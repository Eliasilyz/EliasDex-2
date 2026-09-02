import { notFound } from "next/navigation";
import { getPublicUserByUsername, getPublicUserStats } from "@/lib/users";
import { getFavorites } from "@/models/favorites";
import { getRecentlyWatched } from "@/models/watchHistory";
import { UserProfileCard } from "@/components/user/UserProfileCard";
import { ProfileWatchlist } from "@/components/user/ProfileWatchlist";
import { ProfileHistory } from "@/components/user/ProfileHistory";
import { Lock } from "lucide-react";

export const revalidate = 120;

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  const user = await getPublicUserByUsername(username);

  if (!user) {
    notFound();
  }

  if (!user.isPublicProfile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <UserProfileCard user={user} />
        <div className="mt-6 rounded-xl border border-ink-700/60 bg-surface-raised px-5 py-6 text-center">
          <Lock className="w-5 h-5 text-ink-500 mx-auto mb-2" />
          <p className="text-sm text-ink-500">
            {user.username}&apos;s profile is private. Watchlist and watch history are hidden.
          </p>
        </div>
      </div>
    );
  }

  const [stats, watchlist, history] = await Promise.all([
    getPublicUserStats(user.id),
    getFavorites(user.id),
    getRecentlyWatched(user.id, 18),
  ]);

  // Normalize Mongo docs into plain serializable objects (strip ObjectId toJSON).
  const plainWatchlist = watchlist.map((f) => ({
    animeId: f.animeId,
    animeTitle: f.animeTitle,
    animeCoverImageUrl: f.animeCoverImageUrl,
    status: f.status,
  }));

  const plainHistory = history.map((h) => ({
    animeId: h.animeId,
    animeTitle: h.animeTitle,
    animeCoverImageUrl: h.animeCoverImageUrl,
    episodeNumber: h.episodeNumber,
    completed: h.completed,
  }));

  // Strip ObjectId/Date so the object can cross the server→client boundary.
  const plainUser = JSON.parse(JSON.stringify(user)) as typeof user;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <UserProfileCard user={plainUser} stats={stats} />

      {plainWatchlist.length > 0 && <ProfileWatchlist favorites={plainWatchlist} />}

      {plainHistory.length > 0 && <ProfileHistory history={plainHistory} />}
    </div>
  );
}
