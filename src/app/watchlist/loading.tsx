import React from "react";
import { AnimeCardSkeleton } from "@/components/ui/Skeleton";

export default function WatchlistLoading() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-orange-600/10">
          <div className="w-5 h-5 rounded bg-ink-700" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-ink-700" />
          <div className="h-3 w-56 rounded bg-ink-700/60" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-2 pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-2xl border border-ink-700 bg-surface-canvas/70"
            style={{ width: 68 + (i % 3) * 28 }}
          />
        ))}
      </div>

      {/* Items grid matching WatchlistPage anime cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}