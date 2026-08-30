'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Star, Bookmark, Calendar, Film, Check, Clock, Tv } from 'lucide-react';
import { Anime, WatchlistStatus } from '@/types';
import { useWatch } from '@/context/WatchContext';
import { useTitleLanguage } from '@/context/TitleLanguageContext';
import { useAppNavigate } from '@/lib/useNavigate';

interface AnimeHoverCardProps {
  anime: Anime;
  children: React.ReactNode;
  onSelect?: (malId: number) => void;
  onWatch?: (malId: number, ep?: number) => void;
}

export const AnimeHoverCard: React.FC<AnimeHoverCardProps> = ({
  anime,
  children,
  onSelect,
  onWatch,
}) => {
  const onNavigate = useAppNavigate();
  const { getTitle, getSecondaryTitle } = useTitleLanguage();
  const { getWatchlistStatus, setWatchlistStatus, getWatchProgress } = useWatch();

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const status = getWatchlistStatus(anime.mal_id);
  const progress = getWatchProgress(anime.mal_id);

  const handleMouseEnter = () => {
    // Only show hover card on devices with hover capability (pointer: fine)
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If card is too close to right edge, flip popover to left side
        if (rect.right + 320 > window.innerWidth) {
          setPosition('left');
        } else {
          setPosition('right');
        }
      }
      setIsVisible(true);
    }, 320); // 320ms debounce prevents flickering during fast scrolling/hover
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    if (onSelect) {
      onSelect(anime.mal_id);
    } else {
      onNavigate(`/anime/${anime.mal_id}`);
    }
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    const targetEp = progress ? progress.episodeNumber : 1;
    if (onWatch) {
      onWatch(anime.mal_id, targetEp);
    } else {
      onNavigate(`/watch/${anime.mal_id}/${targetEp}`);
    }
  };

  const handleStatusChange = (newStatus: WatchlistStatus | 'remove', e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistStatus(anime, newStatus);
  };

  const primaryTitle = getTitle(anime);
  const secondaryTitle = getSecondaryTitle(anime);
  const studios = anime.studios?.map((s) => s.name).join(', ') || anime.source || 'Original';
  const genres = anime.genres?.slice(0, 3) || [];
  const cleanSynopsis = anime.synopsis
    ? anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, '').trim()
    : 'No synopsis available.';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Popover Hover Card (Zero Network Fetch — 100% Rate-Limit Safe) */}
      {isVisible && (
        <div
          className={`hidden md:block absolute top-0 z-50 w-80 p-4 rounded-2xl bg-surface-raised border border-ink-700 shadow-2xl text-surface-primary animate-in fade-in zoom-in-95 duration-200 pointer-events-auto ${
            position === 'right'
              ? 'left-[102%] -translate-y-2'
              : 'right-[102%] -translate-y-2'
          }`}
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsVisible(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header Info */}
          <div className="space-y-1">
            <h4
              onClick={handleDetailsClick}
              className="text-sm font-bold text-surface-primary hover:text-orange-400 cursor-pointer line-clamp-2 transition-colors"
              title={primaryTitle}
            >
              {primaryTitle}
            </h4>

            {secondaryTitle && (
              <p className="text-xs text-ink-500 truncate">{secondaryTitle}</p>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs">
            {anime.score && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-400" />
                {anime.score.toFixed(1)}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-ink-700 text-ink-300 font-mono">
              {anime.type || 'TV'}
            </span>
            {anime.episodes && (
              <span className="px-2 py-0.5 rounded-md bg-ink-700 text-ink-300 font-mono">
                {anime.episodes} EP
              </span>
            )}
            {anime.status && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  anime.status === 'Currently Airing'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-ink-700 text-ink-300'
                }`}
              >
                {anime.status === 'Currently Airing' ? 'Airing' : 'Completed'}
              </span>
            )}
          </div>

          {/* Quick Specs */}
          <div className="mt-3 pt-2.5 border-t border-ink-700/80 space-y-1.5 text-xs text-ink-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-ink-500">
                <Film className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Studio
              </span>
              <span className="text-ink-300 font-medium truncate max-w-[150px]">{studios}</span>
            </div>

            {anime.year && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-ink-500">
                  <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Season
                </span>
                <span className="text-ink-300 font-medium capitalize">
                  {anime.season || ''} {anime.year}
                </span>
              </div>
            )}

            {anime.duration && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-ink-500">
                  <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Duration
                </span>
                <span className="text-ink-300 font-medium truncate max-w-[150px]">{anime.duration}</span>
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div className="mt-2.5 pt-2 border-t border-ink-700/80">
            <p className="text-xs text-ink-300 line-clamp-3 leading-relaxed">
              {cleanSynopsis}
            </p>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="text-xs px-2 py-0.5 rounded-full bg-ink-700/80 text-ink-300 border border-ink-500/50"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t border-ink-700/80">
            <button
              type="button"
              onClick={handleWatchClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{progress ? `Resume EP ${progress.episodeNumber}` : 'Watch Ep 1'}</span>
            </button>

            <button
              type="button"
              onClick={handleDetailsClick}
              className="py-2 px-3 rounded-xl bg-ink-700 hover:bg-ink-500 text-ink-300 hover:text-white text-xs font-semibold border border-ink-500/60 transition-colors cursor-pointer"
            >
              Details
            </button>

            {/* Quick Bookmark Status */}
            <button
              type="button"
              onClick={(e) => handleStatusChange(status ? 'remove' : 'watching', e)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                status
                  ? 'bg-orange-700 border-orange-500 text-white'
                  : 'bg-ink-700 border-ink-500/60 text-ink-500 hover:text-white'
              }`}
              title={status ? `Watchlist: ${status}` : 'Add to Watchlist'}
            >
              {status ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
