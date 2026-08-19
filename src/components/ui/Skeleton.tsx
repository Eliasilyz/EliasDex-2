'use client';

import React from 'react';
import { PhantomLoader } from './PhantomLoader';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <PhantomLoader loading>
      <div className={`bg-zinc-850 rounded-xl ${className}`}>
        <span className="opacity-0 select-none pointer-events-none">&nbsp;</span>
      </div>
    </PhantomLoader>
  );
};

export const AnimeCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <PhantomLoader loading className={`w-full ${className}`}>
      <div className="flex flex-col h-full rounded-2xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden">
        {/* Full bleed poster image box matching AnimeCard */}
        <div className="relative aspect-[3/4] w-full bg-zinc-800/80 overflow-hidden" />

        {/* Content Footer matching AnimeCard */}
        <div className="p-3 flex flex-col flex-1 justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-4 w-4/5 rounded bg-zinc-750 font-semibold text-xs" />
            <div className="h-4 w-3/5 rounded bg-zinc-750/70 text-xs" />
            <div className="h-3 w-1/2 rounded bg-zinc-800 text-[11px]" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <div className="h-3 w-16 rounded bg-zinc-800" />
            <div className="h-3 w-12 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    </PhantomLoader>
  );
};

export const CardSkeleton = AnimeCardSkeleton;

export const HeroSkeleton: React.FC = () => {
  return (
    <PhantomLoader loading className="w-full">
      <div className="relative w-full aspect-[21/9] min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800 p-6 md:p-10 flex flex-col justify-end">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/80 text-xs w-28">
            Season Highlight
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-300">
            Featured Anime Title Placeholder
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl line-clamp-3">
            This is a placeholder synopsis for the currently featured spotlight anime of the season.
            Enjoy crisp high-definition streaming and fast episode releases.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-11 px-6 rounded-xl bg-zinc-800 font-semibold text-sm flex items-center justify-center">
              Watch Now
            </div>
            <div className="h-11 px-6 rounded-xl bg-zinc-800/80 font-semibold text-sm flex items-center justify-center">
              View Details
            </div>
          </div>
        </div>
      </div>
    </PhantomLoader>
  );
};

export const ScheduleRowSkeleton: React.FC = () => {
  return (
    <PhantomLoader loading className="w-full">
      <div className="flex gap-4 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-64 shrink-0 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-16 h-22 rounded-xl bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-4/5 rounded bg-zinc-800 text-xs font-semibold">
                  Scheduled Anime
                </div>
                <div className="h-3 w-1/2 rounded bg-zinc-800/70 text-[10px]">Episode 12</div>
                <div className="h-3 w-2/3 rounded bg-zinc-800/70 text-[10px]">18:00 JST</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PhantomLoader>
  );
};

export const DetailPageSkeleton: React.FC = () => {
  return (
    <PhantomLoader loading className="w-full space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 rounded bg-zinc-800" />
        <div className="h-3 w-3 rounded bg-zinc-800/60" />
        <div className="h-3 w-8 rounded bg-zinc-800" />
        <div className="h-3 w-3 rounded bg-zinc-800/60" />
        <div className="h-3 w-28 rounded bg-zinc-800" />
      </div>

      {/* Hero Showcase Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800">
        {/* Blurred bg tint */}
        <div className="absolute inset-0 bg-zinc-900/70" />

        <div className="relative z-10 p-4 sm:p-7 flex flex-col md:flex-row gap-5 sm:gap-7 items-start">
          {/* Left: Poster + Buttons */}
          <div className="w-36 sm:w-48 md:w-56 shrink-0 mx-auto md:mx-0 flex flex-col gap-3">
            <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-800/90 border-2 border-zinc-700/60" />
            <div className="hidden md:flex flex-col gap-2 w-full">
              <div className="h-10 w-full rounded-xl bg-zinc-700/80" />
              <div className="h-9 w-full rounded-xl bg-zinc-800/70 border border-zinc-700/50" />
            </div>
          </div>

          {/* Right: Metadata */}
          <div className="flex-1 space-y-3.5 min-w-0">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-7 w-2/3 rounded-lg bg-zinc-700/80" />
              <div className="h-4 w-1/3 rounded bg-zinc-800/70" />
            </div>

            {/* Streaming badges */}
            <div className="flex flex-wrap gap-1.5">
              {[48, 36, 64, 64, 40, 56].map((w, i) => (
                <div key={i} className="h-5 rounded bg-zinc-800 border border-zinc-700/50" style={{ width: w }} />
              ))}
            </div>

            {/* Mobile watch buttons */}
            <div className="flex md:hidden gap-2 pt-1">
              <div className="h-8 flex-1 rounded-xl bg-zinc-700/80" />
              <div className="h-8 w-20 rounded-xl bg-zinc-800/60 border border-zinc-750" />
            </div>

            {/* Synopsis lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded bg-zinc-800" />
              <div className="h-3.5 w-full rounded bg-zinc-800" />
              <div className="h-3.5 w-4/5 rounded bg-zinc-800" />
              <div className="h-3.5 w-3/5 rounded bg-zinc-800/70" />
            </div>

            {/* Quick specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-3 border-t border-zinc-800/80">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2.5 w-12 rounded bg-zinc-800/70" />
                  <div className="h-3.5 w-20 rounded bg-zinc-800" />
                </div>
              ))}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <div className="h-3 w-12 rounded bg-zinc-800/50" />
              {[48, 60, 52, 44, 56].map((w, i) => (
                <div key={i} className="h-5 rounded-md bg-zinc-900 border border-zinc-800" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 8/4 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left col-span-8 */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tab bar */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
            <div className="h-8 w-32 rounded-lg bg-zinc-700/70" />
            <div className="h-8 w-36 rounded-lg bg-zinc-800/50" />
            <div className="h-8 w-44 rounded-lg bg-zinc-800/50" />
            <div className="h-8 w-32 rounded-lg bg-zinc-800/50" />
          </div>

          {/* Episode rows */}
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-zinc-900/70 border border-zinc-800/80"
                style={{ opacity: 1 - i * 0.08 }}
              />
            ))}
          </div>
        </div>

        {/* Right col-span-4 */}
        <div className="lg:col-span-4 space-y-5">
          {/* Trailer card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="h-3.5 w-28 rounded bg-zinc-800" />
            <div className="aspect-video w-full rounded-xl bg-zinc-800/80" />
          </div>

          {/* Info card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="h-3.5 w-36 rounded bg-zinc-800 mb-3 pb-2 border-b border-zinc-800" />
            <div className="space-y-2.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-zinc-800/70" />
                  <div className="h-3 rounded bg-zinc-800" style={{ width: 60 + (i % 3) * 20 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhantomLoader>
  );
};
