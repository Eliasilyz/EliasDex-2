import React, { useState } from 'react';
import { Play, Star, Bookmark, Check, Film, Calendar, Tv, Layers } from 'lucide-react';
import { Anime, WatchlistStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { useWatch } from '../../context/WatchContext';
import { useTitleLanguage } from '../../context/TitleLanguageContext';

interface AnimeListRowProps {
  anime: Anime;
  onSelect?: (malId: number) => void;
  onWatch?: (malId: number, ep?: number) => void;
  showWatchlistQuickBtn?: boolean;
}

export const AnimeListRow: React.FC<AnimeListRowProps> = ({
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
  const studioName = anime.studios?.[0]?.name;

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
      id={`anime-list-row-${anime.mal_id}`}
      className="group relative flex flex-col sm:flex-row bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-3 sm:p-4 gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-950/10 overflow-hidden"
    >
      {/* Poster Image */}
      <div
        onClick={handleClick}
        className="relative aspect-[3/4] w-full sm:w-32 md:w-36 shrink-0 rounded-xl overflow-hidden bg-zinc-850 cursor-pointer"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-500">
            <Film className="w-8 h-8 mb-1" />
            <span className="text-[10px]">No Poster</span>
          </div>
        )}

        {/* Hover play button overlay */}
        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            type="button"
            onClick={handleQuickPlay}
            className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 scale-90 group-hover:scale-100 transition-all cursor-pointer"
            title="Watch Now"
          >
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </button>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="font-mono text-[9px] uppercase font-bold tracking-wider backdrop-blur-md bg-zinc-950/80">
            {type}
          </Badge>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
        <div>
          {/* Header Row: Title & Score */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                onClick={handleClick}
                className="text-base sm:text-lg font-bold text-zinc-100 hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"
                title={title}
              >
                {title}
              </h3>
              {secondaryTitle && (
                <p className="text-xs text-zinc-400 line-clamp-1 font-sans">
                  {secondaryTitle}
                </p>
              )}
            </div>

            {/* Score Badge */}
            {score && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-800/90 text-amber-300 border border-amber-500/20 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {score}
              </span>
            )}
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-2">
            {episodes ? (
              <span className="inline-flex items-center gap-1 text-zinc-300 font-mono">
                <Tv className="w-3.5 h-3.5 text-zinc-500" />
                {episodes} Episodes
              </span>
            ) : anime.status === 'Currently Airing' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Airing Now
              </span>
            ) : null}

            {studioName && (
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                {studioName}
              </span>
            )}

            {anime.season && (
              <span className="inline-flex items-center gap-1 text-zinc-400 capitalize">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {anime.season} {anime.year || ''}
              </span>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {anime.genres.slice(0, 5).map((g) => (
                <span
                  key={g.mal_id}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-750"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis preview */}
          {anime.synopsis && (
            <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
              {anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, '').trim()}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickPlay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer shadow-md shadow-orange-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Ep {progress ? progress.episodeNumber : 1}</span>
            </button>

            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-colors cursor-pointer"
            >
              Details
            </button>
          </div>

          {/* Watchlist Bookmark */}
          {showWatchlistQuickBtn && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  status
                    ? 'bg-orange-950/80 text-orange-400 border border-orange-500/40'
                    : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${status ? 'fill-orange-400' : ''}`} />
                <span className="hidden sm:inline capitalize">
                  {status ? status.replace(/_/g, ' ') : 'Bookmark'}
                </span>
              </button>

              {showStatusMenu && (
                <div
                  className="absolute right-0 bottom-full mb-1.5 w-40 bg-zinc-900 border border-zinc-750 rounded-xl shadow-xl py-1 z-30 text-xs animate-in fade-in duration-150"
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
      </div>
    </div>
  );
};
