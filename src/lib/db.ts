import { Db, MongoClient } from "mongodb";
import { DB_ENABLED, ENV } from "./env";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db | null> {
  if (!DB_ENABLED) return null;

  if (cachedDb) return cachedDb;

  if (!ENV.MONGODB_URI) return null;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      await cachedClient.connect();
    }
    cachedDb = cachedClient.db("eliasdex");
    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return null;
  }
}

export async function closeDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
