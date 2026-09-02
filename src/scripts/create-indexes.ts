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

    await db.collection("users").createIndex({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
    console.log("  ✓ users.username (unique, case-insensitive) — for findUserByUsername() lookups");

    

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

    await db.collection("announcements").createIndex({ isActive: 1, createdAt: -1 });
    console.log("  ✓ announcements.{isActive, createdAt} — for getActiveAnnouncements()");

    // ── Collectibles ──────────────────────────────────────────────
    await db.collection("collectibles").createIndex({ slug: 1 }, { unique: true });
    console.log("  ✓ collectibles.slug (unique) — for slug-based lookups");

    await db.collection("collectibles").createIndex({ type: 1, rarity: 1 });
    console.log("  ✓ collectibles.{type, rarity} — for filtered browsing");

    await db.collection("user_collectibles").createIndex(
      { userId: 1, collectibleId: 1 },
      { unique: true }
    );
    console.log("  ✓ user_collectibles.{userId, collectibleId} (unique) — prevent duplicate grants");

    await db.collection("user_collectibles").createIndex({ userId: 1 });
    console.log("  ✓ user_collectibles.userId — for getUserCollectibles() lookups");

    console.log("✅ All indexes created successfully");
  } catch (error) {
    console.error("❌ Failed to create indexes:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

createIndexes();

