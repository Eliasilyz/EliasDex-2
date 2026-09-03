import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-600/10">
            <div className="w-5 h-5 rounded bg-ink-700" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-ink-700" />
            <div className="h-3 w-52 rounded bg-ink-700/60" />
          </div>
        </div>
        <div className="h-9 w-32 rounded-xl bg-ink-700" />
      </div>

      {/* History grid matching HistoryPage cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-surface-canvas/60 border border-ink-700/80 flex gap-3.5"
          >
            <Skeleton className="w-20 aspect-[3/4] rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div className="space-y-2">
                <div className="h-3.5 w-4/5 rounded bg-ink-700" />
                <div className="h-3.5 w-3/5 rounded bg-ink-700/70" />
                <div className="h-3 w-2/5 rounded bg-ink-700/60 mt-1" />
                <div className="h-3 w-1/3 rounded bg-ink-700/50" />
              </div>
              <div className="pt-2 border-t border-ink-700/60 mt-2 flex items-center justify-between">
                <div className="h-3 w-14 rounded bg-ink-700/70" />
                <div className="h-3 w-8 rounded bg-ink-700/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}