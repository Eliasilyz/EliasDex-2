import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type {
  Collectible,
  UserCollectible,
  CollectibleType,
  UserCollectibleSlots,
  ResolvedCollectibles,
} from "@/types/models";
import { DEFAULT_COLLECTIBLE_SLOTS } from "@/types/models";

// ── List collectibles ────────────────────────────────────────────────

export async function listAvailableCollectibles(
  filter?: { type?: CollectibleType; rarity?: string }
): Promise<Collectible[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];

  const query: Record<string, unknown> = {};
  if (filter?.type) query.type = filter.type;
  if (filter?.rarity) query.rarity = filter.rarity;

  return db
    .collection<Collectible>("collectibles")
    .find(query)
    .sort({ rarity: 1, createdAt: -1 })
    .toArray();
}

// ── User inventory ───────────────────────────────────────────────────

export async function getUserCollectibles(userId: string): Promise<UserCollectible[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  if (!ObjectId.isValid(userId)) return [];

  return db
    .collection<UserCollectible>("user_collectibles")
    .find({ userId: new ObjectId(userId) })
    .sort({ obtainedAt: -1 })
    .toArray();
}

export async function hasCollectible(userId: string, collectibleId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(collectibleId)) return false;

  const count = await db.collection("user_collectibles").countDocuments({
    userId: new ObjectId(userId),
    collectibleId: new ObjectId(collectibleId),
  });
  return count > 0;
}

// ── Grant / Revoke ───────────────────────────────────────────────────

export async function grantCollectible(
  userId: string,
  collectibleId: string,
  source?: string
): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(collectibleId)) return false;

  try {
    await db.collection("user_collectibles").updateOne(
      {
        userId: new ObjectId(userId),
        collectibleId: new ObjectId(collectibleId),
      },
      {
        $setOnInsert: {
          userId: new ObjectId(userId),
          collectibleId: new ObjectId(collectibleId),
          obtainedAt: new Date(),
          source: source ?? null,
        },
      },
      { upsert: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function revokeCollectible(
  userId: string,
  collectibleId: string
): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(collectibleId)) return false;

  try {
    await db.collection("user_collectibles").deleteOne({
      userId: new ObjectId(userId),
      collectibleId: new ObjectId(collectibleId),
    });

    // Unequip if currently equipped
    await unequipIfEquipped(userId, collectibleId);
    return true;
  } catch {
    return false;
  }
}

// ── Equip / Unequip ──────────────────────────────────────────────────

function getSlotsField(slot: CollectibleType): string {
  return `equippedCollectibles.${slot === "nameStyle" ? "nameStyle" : slot}`;
}

export async function equipCollectible(
  userId: string,
  slot: CollectibleType,
  collectibleId: string
): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(collectibleId)) return false;

  // Verify ownership
  const owned = await hasCollectible(userId, collectibleId);
  if (!owned) return false;

  const cid = new ObjectId(collectibleId);
  const update: Record<string, unknown> = {};

  update.$set = { [getSlotsField(slot)]: cid };

  try {
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      update as any,
      { returnDocument: "after" }
    );
    return result !== null;
  } catch {
    return false;
  }
}

export async function unequipCollectible(
  userId: string,
  slot: CollectibleType,
  collectibleId?: string
): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(userId)) return false;

  const update: Record<string, unknown> = {};

  update.$set = { [getSlotsField(slot)]: null };

  try {
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      update as any,
      { returnDocument: "after" }
    );
    return result !== null;
  } catch {
    return false;
  }
}

async function unequipIfEquipped(userId: string, collectibleId: string): Promise<void> {
  if (!DB_ENABLED) return;
  const db = await getDb();
  if (!db) return;
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(collectibleId)) return;

  const cid = new ObjectId(collectibleId);
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) return;

  const slots = (user.equippedCollectibles as UserCollectibleSlots) ?? DEFAULT_COLLECTIBLE_SLOTS;

  // Check single-value slots
  for (const key of ["border", "nameStyle", "rank"] as const) {
    if (slots[key] && (slots[key] as ObjectId).equals(cid)) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { [`equippedCollectibles.${key}`]: null } }
      );
    }
  }
}

// ── Read equipped ────────────────────────────────────────────────────

export async function getEquippedCollectibles(userId: string): Promise<UserCollectibleSlots> {
  if (!DB_ENABLED) return DEFAULT_COLLECTIBLE_SLOTS;
  const db = await getDb();
  if (!db) return DEFAULT_COLLECTIBLE_SLOTS;
  if (!ObjectId.isValid(userId)) return DEFAULT_COLLECTIBLE_SLOTS;

  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) return DEFAULT_COLLECTIBLE_SLOTS;

  const raw = (user.equippedCollectibles as UserCollectibleSlots) ?? DEFAULT_COLLECTIBLE_SLOTS;
  return {
    border: raw.border ?? null,
    nameStyle: raw.nameStyle ?? null,
    rank: raw.rank ?? null,
  };
}

// ── Resolve collectible details from equipped slots ──────────────────

export async function resolveEquippedCollectibles(userId: string): Promise<ResolvedCollectibles> {
  const slots = await getEquippedCollectibles(userId);
  const db = await getDb();

  const empty: ResolvedCollectibles = {
    border: null,
    nameStyle: null,
    rank: null,
  };

  if (!db) return empty;

  const allIds: ObjectId[] = [
    ...(slots.border ? [slots.border] : []),
    ...(slots.nameStyle ? [slots.nameStyle] : []),
    ...(slots.rank ? [slots.rank] : []),
  ];

  if (allIds.length === 0) return empty;

  const docs = await db
    .collection<Collectible>("collectibles")
    .find({ _id: { $in: allIds } })
    .toArray();

  const byId = new Map(docs.map((d) => [d._id!.toString(), d]));

  return {
    border: slots.border ? (byId.get(slots.border.toString()) ?? null) : null,
    nameStyle: slots.nameStyle ? (byId.get(slots.nameStyle.toString()) ?? null) : null,
    rank: slots.rank ? (byId.get(slots.rank.toString()) ?? null) : null,
  };
}
