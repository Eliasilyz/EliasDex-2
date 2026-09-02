import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";

export interface Announcement {
  _id?: ObjectId;
  title: string;
  body: string;
  createdBy: ObjectId;
  isActive: boolean;
  createdAt: Date;
}

export async function getActiveAnnouncements(limit = 10): Promise<Announcement[]> {
  if (!DB_ENABLED) return [];

  const db = await getDb();
  if (!db) return [];

  return db
    .collection<Announcement>("announcements")
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function createAnnouncement(
  title: string,
  body: string,
  createdBy: ObjectId
): Promise<Announcement | null> {
  if (!DB_ENABLED) return null;

  const db = await getDb();
  if (!db) return null;

  try {
    const doc: Announcement = {
      title,
      body,
      createdBy,
      isActive: true,
      createdAt: new Date(),
    };

    const result = await db.collection<Announcement>("announcements").insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (err: any) {
    console.error("Failed to create announcement:", err);
    return null;
  }
}

export async function toggleAnnouncementStatus(
  id: string,
  isActive: boolean
): Promise<boolean> {
  if (!DB_ENABLED) return false;

  if (!ObjectId.isValid(id)) return false;

  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .collection<Announcement>("announcements")
      .updateOne({ _id: new ObjectId(id) }, { $set: { isActive } });

    return result.modifiedCount > 0;
  } catch (err: any) {
    console.error("Failed to toggle announcement:", err);
    return false;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (!DB_ENABLED) return false;

  if (!ObjectId.isValid(id)) return false;

  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .collection<Announcement>("announcements")
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount > 0;
  } catch (err: any) {
    console.error("Failed to delete announcement:", err);
    return false;
  }
}