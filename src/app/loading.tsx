import React from "react";
import { HeroSkeleton, CardSkeleton, ScheduleRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <section>
        <HeroSkeleton />
      </section>

      {/* Schedule */}
      <section>
        <ScheduleRowSkeleton />
      </section>

      {/* Sections (2 rows of cards) */}
      <section className="space-y-4">
        <div className="h-6 w-40 rounded bg-ink-700 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-6 w-40 rounded bg-ink-700 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
