import { Db, MongoClient } from "mongodb";
import { DB_ENABLED, ENV } from "./env";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let downUntil = 0;
let connecting: Promise<Db | null> | null = null;

/** How long to fast-fail (return null) after a failed connect attempt. */
const DOWN_COOLDOWN_MS = 10_000;
/** Give up on an individual connect attempt this fast so a downed DB doesn't stall requests. */
const CONNECT_TIMEOUT_MS = 5_000;

function isTopologyOpen(client: MongoClient | null): boolean {
  if (!client) return false;
  const topology = (client as any).topology;
  // Possible states: "connecting", "connected", "disconnecting", "uninitialized".
  // Anything that isn't actively connected should be rebuilt.
  return !!topology && topology.state === "connected";
}

async function doConnect(): Promise<Db | null> {
  // Capture into a local BEFORE any await so a concurrent getDb()/closeDb()
  // resetting the global can't leave us calling .db() on null after connect().
  let client = cachedClient;
  try {
    if (!client) {
      client = new MongoClient(ENV.MONGODB_URI!, {
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
        connectTimeoutMS: CONNECT_TIMEOUT_MS,
      });
      cachedClient = client;
      await client.connect();
    }
    cachedDb = client.db("eliasdex");
    return cachedDb;
  } catch (err) {
    // Connection failed — remember when so we fast-fail for a while instead of
    // hammering a downed DB (and spamming logs) on every request.
    downUntil = Date.now() + DOWN_COOLDOWN_MS;
    if (client) {
      try {
        await client.close();
      } catch {
        // ignore close errors on an already-dead topology
      }
    }
    cachedClient = null;
    cachedDb = null;
    console.error(
      `MongoDB connection failed (will retry in ${DOWN_COOLDOWN_MS / 1000}s): ${
        ENV.MONGODB_URI
      } — ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  if (!DB_ENABLED) return null;
  if (!ENV.MONGODB_URI) return null;

  // Fast-fail while Mongo is known-down to avoid 5s waits + log spam per request.
  if (Date.now() < downUntil) return null;

  // If we have a valid cached connection, use it.
  if (cachedDb && isTopologyOpen(cachedClient)) return cachedDb;

  // If the cached client went stale (rebuilt/hot-reloaded), clear it and reconnect.
  if (cachedClient && !isTopologyOpen(cachedClient)) {
    cachedClient = null;
    cachedDb = null;
  }

  // Serialize concurrent reconnect attempts so a downed DB only gets one
  // connect attempt at a time instead of N requests all retrying.
  if (!connecting) {
    connecting = (async () => {
      try {
        return await doConnect();
      } finally {
        connecting = null;
      }
    })();
  }

  return connecting;
}

export async function closeDb(): Promise<void> {
  connecting = null;
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch {
      // ignore
    }
    cachedClient = null;
    cachedDb = null;
  }
}