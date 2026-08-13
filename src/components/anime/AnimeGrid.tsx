import React from 'react';
import { Anime } from '../../types';
import { AnimeCard } from './AnimeCard';
import { AnimeCardSkeleton } from '../ui/Skeleton';
import { RefreshCw, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

interface AnimeGridProps {
  items?: Anime[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  skeletonCount?: number;
  onSelectAnime?: (malId: number) => void;
  onWatchAnime?: (malId: number, ep?: number) => void;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No anime found matching your criteria.',
  skeletonCount = 12,
  onSelectAnime,
  onWatchAnime,
}) => {
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="py-16 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-1">Failed to load content</h3>
        <p className="text-sm text-zinc-400 mb-4">{error}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="py-16 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-300 mb-1">No Anime Found</h3>
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
      {items.map((anime) => (
        <AnimeCard
          key={anime.mal_id}
          anime={anime}
          onSelect={onSelectAnime}
          onWatch={onWatchAnime}
        />
      ))}
    </div>
  );
};
