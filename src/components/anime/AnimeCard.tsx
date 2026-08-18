import React, { useState } from 'react';
import { Play, Star, Bookmark, Check, Film, Tv } from 'lucide-react';
import { Anime, WatchlistStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { LazyImage } from '../ui/LazyImage';
import { useWatch } from '../../context/WatchContext';

import { useTitleLanguage } from '../../context/TitleLanguageContext';

interface AnimeCardProps {
  anime: Anime;
  onSelect?: (malId: number) => void;
  onWatch?: (malId: number, ep?: number) => void;
  showWatchlistQuickBtn?: boolean;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onWatch,
  showWatchlistQuickBtn = true,
}) => {
  const { getWatchlistStatus, setWatchlistStatus, getWatchProgress } = useWatch();
  const { getTitle, getSecondaryTitle } = useTitleLanguage();
  const [imageError, setImageError] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = getWatchlistStatus(anime.mal_id);
  const progress = getWatchProgress(anime.mal_id);

  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    '';

  const title = getTitle(anime);
  const secondaryTitle = getSecondaryTitle(anime);
  const score = anime.score ? anime.score.toFixed(1) : null;
  const episodes = anime.episodes;
  const type = anime.type || 'TV';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(anime.mal_id);
    } else {
      window.location.hash = `#/anime/${anime.mal_id}`;
    }
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetEp = progress ? progress.episodeNumber : 1;
    if (onWatch) {
      onWatch(anime.mal_id, targetEp);
    } else {
      window.location.hash = `#/watch/${anime.mal_id}/${targetEp}`;
    }
  };

  const handleStatusChange = (newStatus: WatchlistStatus | 'remove', e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistStatus(anime, newStatus);
    setShowStatusMenu(false);
  };

  return (
    <div
      id={`anime-card-${anime.mal_id}`}
      className="group relative flex flex-col h-full rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 hover:shadow-xl hover:shadow-orange-950/20 overflow-hidden"
    >
      {/* Poster Image Box */}
      <div
        onClick={handleClick}
        className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-850 cursor-pointer"
      >
        <LazyImage
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />


        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            type="button"
            id={`card-play-btn-${anime.mal_id}`}
            onClick={handleQuickPlay}
            className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 scale-90 group-hover:scale-100 transition-all cursor-pointer"
            title={`Watch ${progress ? `Episode ${progress.episodeNumber}` : 'Episode 1'}`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold tracking-wider backdrop-blur-md">
            {type}
          </Badge>

          {score && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-zinc-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {score}
            </span>
          )}
        </div>

        {/* Bottom badges on poster */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none text-[11px]">
          {episodes ? (
            <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-zinc-300 font-mono">
              {episodes} eps
            </span>
          ) : anime.status === 'Currently Airing' ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md text-emerald-300 font-mono">
              Airing
            </span>
          ) : null}

          {progress && (
            <span className="px-2 py-0.5 rounded-md bg-orange-950/90 border border-orange-500/40 text-orange-300 font-semibold font-mono">
              EP {progress.episodeNumber}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={handleClick}
              className="text-sm font-semibold text-zinc-100 hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer leading-snug flex-1"
              title={title}
            >
              {title}
            </h3>

            {/* Watchlist Bookmark Trigger */}
            {showWatchlistQuickBtn && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  id={`bookmark-btn-${anime.mal_id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusMenu(!showStatusMenu);
                  }}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    status
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title="Bookmark / Watchlist"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${status ? 'fill-white' : ''}`} />
                </button>

                {/* Status Popover */}
                {showStatusMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-36 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl py-1 z-30 text-xs animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange('watching', e)}
                      className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200"
                    >
                      <span>Watching</span>
                      {status === 'watching' && <Check className="w-3 h-3 text-orange-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange('plan_to_watch', e)}
                      className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200"
                    >
                      <span>Plan to Watch</span>
                      {status === 'plan_to_watch' && <Check className="w-3 h-3 text-orange-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange('completed', e)}
                      className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200"
                    >
                      <span>Completed</span>
                      {status === 'completed' && <Check className="w-3 h-3 text-orange-400" />}
                    </button>
                    {status && (
                      <button
                        type="button"
                        onClick={(e) => handleStatusChange('remove', e)}
                        className="w-full px-3 py-1.5 text-left hover:bg-rose-950 text-rose-400 border-t border-zinc-800 mt-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <p className="text-[11px] text-zinc-400 mt-1 truncate">
              {anime.genres.slice(0, 2).map((g) => g.name).join(' • ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/40">
          <span className="truncate">{anime.season ? `${anime.season} ${anime.year || ''}` : anime.status || 'Anime'}</span>
          <button
            type="button"
            onClick={handleClick}
            className="text-orange-400 hover:text-orange-300 font-medium shrink-0"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
};
