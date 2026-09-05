"use client";

import React from "react";
import Link from "next/link";
import { History, Play, CheckCheck } from "lucide-react";

export interface HistoryDisplayItem {
  animeId: number;
  animeTitle: string;
  animeCoverImageUrl: string;
  episodeNumber: number;
  completed: boolean;
}

export const ProfileHistory: React.FC<{ history: HistoryDisplayItem[] }> = ({ history }) => {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-ink-500" />
        <h3 className="font-heading text-lg font-bold text-surface-primary">Recently Watched</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
        {history.slice(0, 18).map((item) => (
          <Link
            key={`${item.animeId}-${item.episodeNumber}`}
            href={`/anime/${item.animeId}`}
            className="group relative block aspect-[2/3] w-full overflow-hidden rounded-lg border border-ink-700/50 bg-surface-canvas/60 hover:border-ink-300/70 focus-visible:ring-2 focus-visible:ring-orange-500/40 transition-colors"
          >
            {item.animeCoverImageUrl ? (
              <img
                src={item.animeCoverImageUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-700">
                <History className="w-8 h-8" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

            {/* Episode chip */}
            <div className="absolute left-1.5 top-1.5">
              {item.completed ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  <CheckCheck className="w-3 h-3" />
                  Done
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-ink-300 border border-white/10">
                  <Play className="w-2.5 h-2.5" />
                  Ep. {item.episodeNumber}
                </span>
              )}
            </div>

            {/* Title overlaid on cover (no duplicate below) */}
            <div className="absolute inset-x-1.5 bottom-1.5">
              <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white/95">
                {item.animeTitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
