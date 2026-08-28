import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import { levelFromXp } from "@/lib/xp";
import type { User } from "@/types/models";

export type { User };

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  return db.collection<User>("users").findOne({ email });
}

export async function findUserByUsername(username: string): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  return db.collection<User>("users").findOne({ username });
}

export async function findUserById(id: string): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  if (!ObjectId.isValid(id)) return null;
  return db.collection<User>("users").findOne({ _id: new ObjectId(id) });
}

export async function createUser(
  email: string,
  username: string,
  passwordHash?: string,
  isGuest: boolean = false
): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const guestExpiresAt = isGuest ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined;
  const doc: User = {
    email,
    username,
    passwordHash,
    role: isGuest ? "guest" : "member",
    level: 0,
    xp: 0,
    createdAt: now,
    lastLoginAt: now,
    isGuest,
    guestExpiresAt,
  };
  const result = await db.collection<User>("users").insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, "_id" | "createdAt">>
): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  if (!ObjectId.isValid(id)) return null;
  const result = await db.collection<User>("users").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, lastLoginAt: new Date() } },
    { returnDocument: "after" }
  );
  return result ?? null;
}

export async function addXp(userId: string, amount: number): Promise<number | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  if (!ObjectId.isValid(userId)) return null;

  const result = await db.collection<User>("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $inc: { xp: amount } },
    { returnDocument: "after" }
  );

  if (!result) return null;

  const newLevel = levelFromXp(result.xp);
  if (newLevel !== result.level) {
    await db.collection<User>("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { level: newLevel } }
    );
  }

  return result.xp;
}

export async function getXpProgress(userId: string): Promise<{ xp: number; level: number } | null> {
  if (!DB_ENABLED) return null;
  const user = await findUserById(userId);
  if (!user) return null;
  return {
    xp: user.xp,
    level: levelFromXp(user.xp),
  };
}
