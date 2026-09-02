"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, Plane, CheckCheck, PauseCircle, XCircle } from "lucide-react";
import type { WatchlistStatus } from "@/types/models";

export interface WatchlistDisplayItem {
  animeId: number;
  animeTitle: string;
  animeCoverImageUrl: string;
  status: WatchlistStatus;
}

const STATUS_CONFIG: Record<WatchlistStatus, { label: string; icon: React.ReactNode; chip: string }> = {
  watching: { label: "Watching", icon: <Plane className="w-2.5 h-2.5" />, chip: "bg-orange-600/90" },
  plan_to_watch: { label: "Plan", icon: <Bookmark className="w-2.5 h-2.5" />, chip: "bg-sky-600/90" },
  completed: { label: "Done", icon: <CheckCheck className="w-2.5 h-2.5" />, chip: "bg-emerald-600/90" },
  on_hold: { label: "Hold", icon: <PauseCircle className="w-2.5 h-2.5" />, chip: "bg-amber-600/90" },
  dropped: { label: "Dropped", icon: <XCircle className="w-2.5 h-2.5" />, chip: "bg-red-600/90" },
};

export const ProfileWatchlist: React.FC<{ favorites: WatchlistDisplayItem[] }> = ({ favorites }) => {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-4 h-4 text-ink-500" />
        <h3 className="font-heading text-lg font-bold text-surface-primary">Watchlist</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
        {favorites.slice(0, 24).map((fav) => {
          const status = STATUS_CONFIG[fav.status] ?? STATUS_CONFIG.watching;
          return (
            <Link
              key={`${fav.animeId}-${fav.status}`}
              href={`/anime/${fav.animeId}`}
              className="group relative block aspect-[2/3] w-full overflow-hidden rounded-lg border border-ink-700/50 bg-surface-canvas/60 hover:border-ink-300/70 focus-visible:ring-2 focus-visible:ring-orange-500/40 transition-colors"
            >
              {fav.animeCoverImageUrl ? (
                <img
                  src={fav.animeCoverImageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-700">
                  <Bookmark className="w-8 h-8" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

              {/* Status chip */}
              <div className="absolute left-1.5 top-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white ${status.chip}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              {/* Title overlaid on cover (no duplicate below) */}
              <div className="absolute inset-x-1.5 bottom-1.5">
                <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white/95">
                  {fav.animeTitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
