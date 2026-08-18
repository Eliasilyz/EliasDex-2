import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-800/60 dark:bg-zinc-800/80 rounded-lg ${className}`}
    />
  );
};

export const AnimeCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900">
        <Skeleton className="w-full h-full" />
      </div>
      <Skeleton className="h-4 w-3/4 mt-1" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
};

export const CardSkeleton = AnimeCardSkeleton;


export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full aspect-[21/9] min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3 max-w-xl">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
