import { MongoClient } from "mongodb";
import { DB_ENABLED } from "@/lib/env";

const uri = process.env.MONGODB_URI;

async function createIndexes(): Promise<void> {
  if (!DB_ENABLED || !uri) {
    console.log("⏭️  Skipped index creation — no MONGODB_URI set");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("eliasdex");

    console.log("📑 Creating indexes...");

    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("  ✓ users.email (unique) — for findUserByEmail() lookups");

    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    console.log("  ✓ users.username (unique) — for findUserByUsername() lookups");

    await db.collection("users").createIndex({ guestExpiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log("  ✓ users.guestExpiresAt (TTL) — auto-delete expired guest sessions");

    await db.collection("watch_history").createIndex({ userId: 1, lastWatchedAt: -1 });
    console.log("  ✓ watch_history.{userId, lastWatchedAt} — for getContinueWatching() queries");

    await db.collection("watch_history").createIndex({ userId: 1, animeId: 1, episodeNumber: 1 });
    console.log("  ✓ watch_history.{userId, animeId, episodeNumber} — for updateWatchProgress() upserts");

    await db
      .collection("favorites")
      .createIndex({ userId: 1, animeId: 1 }, { unique: true });
    console.log("  ✓ favorites.{userId, animeId} (unique) — prevent duplicate favorites");

    await db.collection("favorites").createIndex({ userId: 1, status: 1 });
    console.log("  ✓ favorites.{userId, status} — for getFavoritesByStatus() queries");

    await db.collection("chat_messages").createIndex({ roomId: 1, createdAt: -1 });
    console.log("  ✓ chat_messages.{roomId, createdAt} — for getRecentMessages() by room");

    await db.collection("comments").createIndex({ targetId: 1, createdAt: -1 });
    console.log("  ✓ comments.{targetId, createdAt} — for getComments() anime-level queries");

    await db.collection("comments").createIndex({ targetId: 1, episodeNumber: 1, createdAt: -1 });
    console.log("  ✓ comments.{targetId, episodeNumber, createdAt} — for getEpisodeComments()");

    await db.collection("comments").createIndex({ parentId: 1 });
    console.log("  ✓ comments.parentId — for getReplies() threaded queries");

    console.log("✅ All indexes created successfully");
  } catch (error) {
    console.error("❌ Failed to create indexes:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

createIndexes();

