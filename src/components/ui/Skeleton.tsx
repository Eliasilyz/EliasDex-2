'use client';

import React from 'react';
import { PhantomLoader } from './PhantomLoader';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <PhantomLoader loading>
      <div className={`bg-surface-raised rounded-xl ${className}`}>
        <span className="opacity-0 select-none pointer-events-none">&nbsp;</span>
      </div>
    </PhantomLoader>
  );
};

export const AnimeCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <PhantomLoader loading className={`w-full ${className}`}>
      <div className="flex flex-col h-full rounded-2xl bg-surface-canvas/50 border border-ink-700/80 overflow-hidden">
        {/* Full bleed poster image box matching AnimeCard */}
        <div className="relative aspect-[3/4] w-full bg-ink-700/80 overflow-hidden" />

        {/* Content Footer matching AnimeCard */}
        <div className="p-3 flex flex-col flex-1 justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-4 w-4/5 rounded bg-ink-500 font-semibold text-xs" />
            <div className="h-4 w-3/5 rounded bg-ink-500/70 text-xs" />
            <div className="h-3 w-1/2 rounded bg-ink-700 text-xs" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-ink-700/60">
            <div className="h-3 w-16 rounded bg-ink-700" />
            <div className="h-3 w-12 rounded bg-ink-700" />
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
      <div className="relative w-full aspect-[21/9] min-h-[360px] md:min-h-[460px] rounded-3xl overflow-hidden bg-surface-canvas/90 border border-ink-700/60 p-6 md:p-12 flex flex-col justify-end">
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-md bg-ink-700/80" />
            <div className="h-6 w-16 rounded-md bg-ink-700/60" />
          </div>
          <div className="space-y-2">
            <div className="h-10 md:h-14 w-3/4 rounded-xl bg-ink-500/70" />
            <div className="h-10 md:h-14 w-1/2 rounded-xl bg-ink-500/50" />
          </div>
          <div className="space-y-2 max-w-prose">
            <div className="h-3.5 w-full rounded bg-ink-700/80" />
            <div className="h-3.5 w-5/6 rounded bg-ink-700/70" />
            <div className="h-3.5 w-2/3 rounded bg-ink-700/60" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-11 w-36 rounded-xl bg-ink-500/80" />
            <div className="h-11 w-28 rounded-xl bg-ink-700/70" />
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
            className="w-64 shrink-0 rounded-2xl bg-surface-canvas/60 border border-ink-700 p-3 space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-16 h-22 rounded-xl bg-ink-700 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-4/5 rounded bg-ink-500/80" />
                <div className="h-3 w-1/2 rounded bg-ink-700/70" />
                <div className="h-3 w-2/3 rounded bg-ink-700/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PhantomLoader>
  );
};

export const WatchPageSkeleton: React.FC = () => {
  return (
    <PhantomLoader loading className="w-full space-y-4 pb-12">
      {/* Top bar: back link + title + lang toggles */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-36 rounded-sm bg-ink-700" />
        <div className="h-4 w-44 rounded bg-ink-500/70" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-lg bg-ink-700/60 border border-ink-600" />
          <div className="h-8 w-16 rounded-lg bg-ink-700/60 border border-ink-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
        {/* LEFT: player + meta */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-xl bg-ink-700/80 border border-ink-700" />

          {/* Episode nav bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-700 bg-surface-raised px-3.5 py-2.5">
            <div className="space-y-1.5">
              <div className="h-3 w-10 rounded bg-ink-500/80" />
              <div className="h-4 w-32 rounded bg-ink-500/70" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-14 rounded-lg bg-ink-700/70" />
              <div className="h-7 w-60 rounded-lg bg-orange-500/70" />
              <div className="h-7 w-24 rounded-lg bg-ink-700/70" />
              <div className="h-7 w-8 rounded-lg bg-ink-700/70" />
              <div className="h-7 w-28 rounded-lg bg-ink-700/70" />
            </div>
          </div>

          {/* Sources placeholder */}
          <div className="rounded-lg border border-ink-700 bg-surface-raised p-3.5 space-y-3">
            <div className="h-3 w-16 rounded bg-ink-500/80" />
            <div className="flex flex-wrap gap-2">
              {[40, 56, 48, 64].map((w, i) => (
                <div key={i} className="h-7 rounded-lg bg-ink-700/70" style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* About placeholder */}
          <div className="rounded-lg border border-ink-700 bg-surface-raised p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-ink-500/80" />
              <div className="h-3 w-8 rounded bg-ink-500/70" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[40, 48, 60, 52, 44, 56].map((w, i) => (
                <div key={i} className="h-3 rounded bg-ink-700/70" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: sidebar tabs + content */}
        <div className="space-y-0">
          <div className="flex rounded-xl overflow-hidden border border-ink-700 bg-surface-raised mb-2">
            <div className="flex-1 h-9 rounded-none bg-ink-700/40" />
            <div className="flex-1 h-9 rounded-none bg-surface-raised" />
          </div>
          <div className="max-h-[62vh] rounded-lg border border-ink-700 bg-surface-raised p-3 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-ink-700/70" style={{ opacity: 1 - i * 0.08 }} />
            ))}
          </div>
        </div>
      </div>
    </PhantomLoader>
  );
};

export const DetailPageSkeleton: React.FC = () => {
  return (
    <PhantomLoader loading className="w-full space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 rounded bg-ink-700" />
        <div className="h-3 w-3 rounded bg-ink-700/60" />
        <div className="h-3 w-8 rounded bg-ink-700" />
        <div className="h-3 w-3 rounded bg-ink-700/60" />
        <div className="h-3 w-28 rounded bg-ink-700" />
      </div>

      {/* Hero Showcase Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-surface-canvas border border-ink-700">
        {/* Blurred bg tint */}
        <div className="absolute inset-0 bg-surface-canvas/70" />

        <div className="relative z-10 p-4 sm:p-7 flex flex-col md:flex-row gap-5 sm:gap-7 items-start">
          {/* Left: Poster + Buttons */}
          <div className="w-36 sm:w-48 md:w-56 shrink-0 mx-auto md:mx-0 flex flex-col gap-3">
            <div className="aspect-[3/4] w-full rounded-2xl bg-ink-700/90 border-2 border-ink-500/60" />
            <div className="hidden md:flex flex-col gap-2 w-full">
              <div className="h-10 w-full rounded-xl bg-ink-500/80" />
              <div className="h-9 w-full rounded-xl bg-ink-700/70 border border-ink-500/50" />
            </div>
          </div>

          {/* Right: Metadata */}
          <div className="flex-1 space-y-3.5 min-w-0">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-7 w-2/3 rounded-lg bg-ink-500/80" />
              <div className="h-4 w-1/3 rounded bg-ink-700/70" />
            </div>

            {/* Streaming badges */}
            <div className="flex flex-wrap gap-1.5">
              {[48, 36, 64, 64, 40, 56].map((w, i) => (
                <div key={i} className="h-5 rounded bg-ink-700 border border-ink-500/50" style={{ width: w }} />
              ))}
            </div>

            {/* Mobile watch buttons */}
            <div className="flex md:hidden gap-2 pt-1">
              <div className="h-8 flex-1 rounded-xl bg-ink-500/80" />
              <div className="h-8 w-20 rounded-xl bg-ink-700/60 border border-border-subtle" />
            </div>

            {/* Synopsis lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded bg-ink-700" />
              <div className="h-3.5 w-full rounded bg-ink-700" />
              <div className="h-3.5 w-4/5 rounded bg-ink-700" />
              <div className="h-3.5 w-3/5 rounded bg-ink-700/70" />
            </div>

            {/* Quick specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-3 border-t border-ink-700/80">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2.5 w-12 rounded bg-ink-700/70" />
                  <div className="h-3.5 w-20 rounded bg-ink-700" />
                </div>
              ))}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <div className="h-3 w-12 rounded bg-ink-700/50" />
              {[48, 60, 52, 44, 56].map((w, i) => (
                <div key={i} className="h-5 rounded-md bg-surface-canvas border border-ink-700" style={{ width: w }} />
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
          <div className="flex items-center gap-1 p-1 bg-surface-canvas/90 border border-ink-700 rounded-xl">
            <div className="h-8 w-32 rounded-lg bg-ink-500/70" />
            <div className="h-8 w-36 rounded-lg bg-ink-700/50" />
            <div className="h-8 w-44 rounded-lg bg-ink-700/50" />
            <div className="h-8 w-32 rounded-lg bg-ink-700/50" />
          </div>

          {/* Episode rows */}
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-surface-canvas/70 border border-ink-700/80"
                style={{ opacity: 1 - i * 0.08 }}
              />
            ))}
          </div>
        </div>

        {/* Right col-span-4 */}
        <div className="lg:col-span-4 space-y-5">
          {/* Trailer card */}
          <div className="bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-4 space-y-3">
            <div className="h-3.5 w-28 rounded bg-ink-700" />
            <div className="aspect-video w-full rounded-xl bg-ink-700/80" />
          </div>

          {/* Info card */}
          <div className="bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-5 space-y-3">
            <div className="h-3.5 w-36 rounded bg-ink-700 mb-3 pb-2 border-b border-ink-700" />
            <div className="space-y-2.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-ink-700/70" />
                  <div className="h-3 rounded bg-ink-700" style={{ width: 60 + (i % 3) * 20 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhantomLoader>
  );
};
