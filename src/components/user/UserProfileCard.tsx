"use client";

import React from "react";
import { Calendar, User as UserIcon } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileBorderWrapper } from "@/components/collectibles/ProfileBorderWrapper";
import { UserNameDisplay } from "@/components/collectibles/UserNameDisplay";
import { cn } from "@/lib/utils";
import type { UserRole, UserSocials, ResolvedCollectibles } from "@/types/models";

export interface PublicUser {
  id: string;
  username: string;
  avatarUrl?: string;
  profileBannerUrl?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  level: number;
  xp: number;
  joinedAt: Date | string;
  isPublicProfile: boolean;
  socials?: UserSocials;
  collectibles?: ResolvedCollectibles;
}

export interface PublicUserStats {
  animeCount: number;
  episodeCount: number;
  secondsWatched: number;
}

export interface UserProfileCardProps {
  user: PublicUser;
  stats?: PublicUserStats;
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  premium: "Premium",
  member: "Member",
  guest: "Guest",
};

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.max(1, Math.round(seconds / 60))}m`;
  if (hours < 100) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours).toLocaleString()}h`;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, stats }) => {
  const isPublic = user.isPublicProfile;
  const joined =
    user.joinedAt instanceof Date ? user.joinedAt : new Date(user.joinedAt as any);

  // Turn XP into a small level meter shown only when there is something to show.
  const levelPct = user.xp > 0 ? Math.max(6, (user.xp % 100)) : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-ink-700/50 bg-surface-raised">
      {/* Banner — plain, no decorative grid: the page canvas already carries the grid. */}
      <div className="relative h-28 sm:h-36 w-full bg-surface-canvas">
        {user.profileBannerUrl ? (
          <img
            src={user.profileBannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              user.role === "admin"
                ? "from-red-800/45 via-red-950/30 to-transparent"
                : user.role === "premium"
                ? "from-amber-700/45 via-amber-900/25 to-transparent"
                : "from-[#3b5bfd]/45 via-[#3b5bfd]/20 to-transparent"
            )}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-raised to-transparent" />
      </div>

      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar overlapping banner */}
        <div className="-mt-12 sm:-mt-14 mb-3 flex items-end justify-between">
          <ProfileBorderWrapper border={user.collectibles?.border}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-surface-canvas ring-4 ring-surface-raised"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-tr from-ink-700 to-ink-500 ring-4 ring-surface-raised flex items-center justify-center">
                <UserIcon className="h-9 w-9 text-ink-300" />
              </div>
            )}
          </ProfileBorderWrapper>
        </div>

        {/* Name + meta */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <UserNameDisplay
            username={user.username}
            nameStyle={user.collectibles?.nameStyle}
            rank={user.collectibles?.rank}
            className="font-heading text-2xl font-bold text-surface-primary"
          />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-500">
            {ROLE_LABEL[user.role] ?? "Member"}
          </span>
          {user.isVerified && <VerifiedBadge />}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Joined&nbsp;
            {joined.toLocaleDateString("en-ID", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        {user.bio && (
          <p className="mt-3 text-sm leading-relaxed text-ink-300 break-words whitespace-pre-line">
            {user.bio}
          </p>
        )}

        {/* Social Links */}
        {user.socials && Object.keys(user.socials).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {user.socials.instagram && (
              <a
                href={user.socials.instagram.startsWith("http") ? user.socials.instagram : `https://instagram.com/${user.socials.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-pink-500/50 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            )}
            {user.socials.tiktok && (
              <a
                href={user.socials.tiktok.startsWith("http") ? user.socials.tiktok : `https://tiktok.com/@${user.socials.tiktok.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 007.04 6.3 6.34 6.34 0 005.14-6.22V9.12a8.16 8.16 0 004.78 1.52V7.2a4.85 4.85 0 01-.52-.51z"/></svg>
                TikTok
              </a>
            )}
            {user.socials.x && (
              <a
                href={user.socials.x.startsWith("http") ? user.socials.x : `https://x.com/${user.socials.x.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-ink-300/70 hover:text-surface-primary transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </a>
            )}
            {user.socials.discord && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300" aria-label="Discord">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                {user.socials.discord}
              </span>
            )}
            {user.socials.anilist && (
              <a
                href={user.socials.anilist.startsWith("http") ? user.socials.anilist : `https://anilist.co/user/${user.socials.anilist.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-blue-400/50 hover:text-blue-400 transition-colors"
                aria-label="AniList"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.268 21.078l-1.82-4.763h.002l-1.803 4.763H5.866l2.977-7.34L6.055 3.923h3.606l1.755 4.594L13.146 3.923h3.038l-2.754 7.815 3.03 7.34h-3.038l-1.854-4.763-.006.003zM17.823 15.288h1.656l-3.312-8.382v8.382z"/></svg>
                AniList
              </a>
            )}
            {user.socials.myanimelist && (
              <a
                href={user.socials.myanimelist.startsWith("http") ? user.socials.myanimelist : `https://myanimelist.net/profile/${user.socials.myanimelist.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
                aria-label="MyAnimeList"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.667 14.083c0 .415-.337.752-.752.752H5.417v-1.5h1.5c.415 0 .75.337.75.75zm8.333-3.333v1.5h-1.5V9.25h1.5v1.5zm-5 0v1.5h-1.5V9.25H10.5v1.5zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 7.5h-1.5v1.5h1.5v-1.5zm7 0h-1.5v1.5h1.5v-1.5zm-3.5 7.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm-2-6.5h1.5v-1.5H11.5v1.5zm5 0h-1.5v-1.5H16.5v1.5zm-5 0h1.5v-1.5H11.5v1.5z"/></svg>
                MAL
              </a>
            )}
          </div>
        )}

        {/* Stats — single data-dense row, no per-tile chrome. Numbers carry the weight. */}
        {isPublic && stats ? (
          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-ink-700/50 bg-ink-700/40">
            {[
              { label: "Anime", value: stats.animeCount.toLocaleString() },
              { label: "Episodes", value: stats.episodeCount.toLocaleString() },
              { label: "Watched", value: formatHours(stats.secondsWatched) },
            ].map((s) => (
              <div key={s.label} className="bg-surface-raised px-3 py-3 text-center">
                <div className="font-heading text-xl font-bold text-surface-primary leading-none">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  {s.label}
                </div>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-ink-700/40 bg-surface-canvas/40 px-4 py-3 text-xs text-ink-500">
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Stats are hidden because this profile is private.</span>
          </div>
        )}

        {/* Level — neutral track, reserved flame fill. */}
        {user.level > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1.5">
              <span>Level {user.level}</span>
              <span>{user.xp} XP</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-canvas/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
