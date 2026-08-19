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
      <div className="flex flex-col gap-2.5 w-full p-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
        {/* Poster image box */}
        <div className="relative aspect-[3/4] w-full rounded-xl bg-zinc-800/80 overflow-hidden">
          <div className="w-full h-full" />
        </div>
        {/* Title line */}
        <div className="space-y-1.5 px-0.5">
          <div className="h-4 w-4/5 rounded-md bg-zinc-700/70 font-semibold text-xs truncate">
            Anime Title Placeholder
          </div>
          {/* Meta info line */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="h-3 w-16 rounded-md bg-zinc-700/50 text-[10px]">TV Series</div>
            <div className="h-3 w-10 rounded-md bg-zinc-700/50 text-[10px]">★ 8.5</div>
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
    <PhantomLoader loading className="w-full space-y-8">
      {/* Hero / Banner */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 p-6 flex flex-col justify-end">
        <div className="h-8 w-1/3 rounded-lg bg-zinc-800 font-bold text-xl">Anime Title</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column / poster info */}
        <div className="space-y-4">
          <div className="w-full aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800" />
          <div className="h-11 w-full rounded-xl bg-zinc-800 text-center font-medium">Watch Online</div>
          <div className="h-11 w-full rounded-xl bg-zinc-800/80 text-center font-medium">Add to Watchlist</div>
        </div>

        {/* Right column / metadata & synopsis */}
        <div className="lg:col-span-3 space-y-5">
          <div className="h-9 w-2/3 rounded-lg bg-zinc-800 text-2xl font-bold">
            Anime Japanese and English Title
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">Action</span>
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">Fantasy</span>
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">Adventure</span>
          </div>
          <div className="space-y-2 pt-2">
            <p className="text-sm text-zinc-400">
              Detailed synopsis description goes here explaining the storyline, characters, world setting, and episode synopsis in full detail.
            </p>
            <p className="text-sm text-zinc-400">
              Secondary paragraph giving additional information about studio production and voice actors.
            </p>
          </div>
          <div className="h-64 w-full rounded-2xl bg-zinc-900 border border-zinc-800 mt-6" />
        </div>
      </div>
    </PhantomLoader>
  );
};
