import React, { useState, useEffect } from 'react';
import { Play, Info, Star, ChevronLeft, ChevronRight, Bookmark, Check } from 'lucide-react';
import { Anime } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useWatch } from '../../context/WatchContext';
import { useTitleLanguage } from '../../context/TitleLanguageContext';

interface HeroCarouselProps {
  items: Anime[];
  onSelectAnime?: (malId: number) => void;
  onWatchAnime?: (malId: number, ep?: number) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  items,
  onSelectAnime,
  onWatchAnime,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { getWatchlistStatus, setWatchlistStatus } = useWatch();
  const { getTitle, getSecondaryTitle } = useTitleLanguage();

  // Autoplay carousel every 6 seconds
  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [items, isPaused]);

  if (!items || items.length === 0) return null;

  const currentAnime = items[currentIndex];
  const title = getTitle(currentAnime);
  const secondaryTitle = getSecondaryTitle(currentAnime);
  const isBookmarked = !!getWatchlistStatus(currentAnime.mal_id);

  const backdropUrl =
    currentAnime.trailer?.images?.maximum_image_url ||
    currentAnime.trailer?.images?.large_image_url ||
    currentAnime.images?.webp?.large_image_url ||
    currentAnime.images?.jpg?.large_image_url ||
    '';

  const posterUrl =
    currentAnime.images?.webp?.large_image_url ||
    currentAnime.images?.jpg?.large_image_url ||
    '';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-surface-canvas border border-ink-700/80 shadow-2xl group/hero min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {backdropUrl && (
          <img
            key={currentAnime.mal_id}
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center scale-105 filter blur-sm brightness-[0.4] transition-all duration-700 animate-in fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-surface-canvas/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-canvas via-surface-canvas/80 to-transparent" />
      </div>

      {/* Content Layout */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-10 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8">
        {/* Text Details */}
        <div className="max-w-2xl space-y-4 text-left">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="font-semibold tracking-wide">
              {currentAnime.type || 'TV Series'}
            </Badge>

            {currentAnime.score && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {currentAnime.score.toFixed(1)}
              </span>
            )}

            {currentAnime.status && (
              <Badge variant="secondary" className="font-mono text-xs">
                {currentAnime.status}
              </Badge>
            )}

            {currentAnime.season && (
              <span className="text-xs text-ink-500 capitalize font-medium">
                {currentAnime.season} {currentAnime.year}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h1
              id="hero-anime-title"
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-surface-primary tracking-tight leading-tight line-clamp-2"
            >
              {title}
            </h1>
            {secondaryTitle && (
              <p className="text-xs text-ink-500 mt-1 font-sans">
                {secondaryTitle}
              </p>
            )}
          </div>

          {/* Genres */}
          {currentAnime.genres && currentAnime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentAnime.genres.slice(0, 4).map((g) => (
                <span
                  key={g.mal_id}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-canvas/80 text-ink-300 border border-border-subtle"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {currentAnime.synopsis && (
            <p className="text-xs sm:text-sm text-ink-300/90 line-clamp-3 max-w-xl leading-relaxed">
              {currentAnime.synopsis}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              id="hero-watch-btn"
              variant="primary"
              size="lg"
              onClick={() => {
                if (onWatchAnime) onWatchAnime(currentAnime.mal_id, 1);
                else window.location.hash = `#/watch/${currentAnime.mal_id}/1`;
              }}
              icon={<Play className="w-5 h-5 fill-white" />}
            >
              Watch Episode 1
            </Button>

            <Button
              id="hero-details-btn"
              variant="secondary"
              size="lg"
              onClick={() => {
                if (onSelectAnime) onSelectAnime(currentAnime.mal_id);
                else window.location.hash = `#/anime/${currentAnime.mal_id}`;
              }}
              icon={<Info className="w-4 h-4" />}
            >
              Details
            </Button>

            <Button
              id="hero-bookmark-btn"
              variant="outline"
              size="lg"
              onClick={() => {
                setWatchlistStatus(currentAnime, isBookmarked ? 'remove' : 'watching');
              }}
              icon={isBookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
            >
              {isBookmarked ? 'In List' : 'Add to List'}
            </Button>
          </div>
        </div>

        {/* Small Poster preview on desktop */}
        <div className="hidden lg:block shrink-0">
          <div className="w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-ink-500/60 bg-ink-700 rotate-1 group-hover/hero:rotate-0 transition-transform duration-300">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        id="hero-prev-btn"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-canvas/80 hover:bg-ink-700 border border-ink-500/80 text-white shadow-xl flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity cursor-pointer"
        aria-label="Previous Featured Anime"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        id="hero-next-btn"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-canvas/80 hover:bg-ink-700 border border-ink-500/80 text-white shadow-xl flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity cursor-pointer"
        aria-label="Next Featured Anime"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {items.slice(0, 8).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? 'w-6 bg-orange-500'
                : 'w-1.5 bg-ink-500 hover:bg-ink-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
