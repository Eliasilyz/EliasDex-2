'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Clock } from 'lucide-react';
import { useAppNavigate } from '@/lib/useNavigate';
import { getMangaProgress, mangaSlug, mangaReadUrl } from '@/lib/mangaApi';

interface MangaCardProps {
  title: string;
  url: string;
  cover: string;
  update?: string;
  className?: string;
}

export const MangaCard: React.FC<MangaCardProps> = ({
  title,
  url,
  cover,
  update,
  className = '',
}) => {
  const onNavigate = useAppNavigate();
  const [imgError, setImgError] = useState(false);
  const progress = getMangaProgress(url);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(mangaSlug(url));
  };

  const handleQuickRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (progress?.lastChapterUrl) {
      onNavigate(mangaReadUrl(progress.lastChapterUrl, url));
    } else {
    onNavigate(mangaSlug(url));
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col h-full rounded-2xl bg-surface-canvas border border-ink-700 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
    >
      {/* Poster Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-canvas">
        {!imgError && cover ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-canvas text-ink-500 p-4 text-center">
            <BookOpen className="w-8 h-8 mb-2 opacity-60 text-orange-400" />
            <span className="text-xs text-ink-400 font-medium line-clamp-2">{title}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Update Badge */}
        {update && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-600/90 text-white backdrop-blur-md shadow-md border border-orange-400/20">
              <Sparkles className="w-3 h-3 text-orange-200" />
              <span className="truncate max-w-[120px]">{update}</span>
            </span>
          </div>
        )}

        {/* Continue Reading Badge if in history */}
        {progress && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">Last read: {progress.lastChapterName}</span>
            </div>
          </div>
        )}

        {/* Hover Quick Read Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            type="button"
            onClick={handleQuickRead}
            className="w-11 h-11 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/30 scale-90 group-hover:scale-100 transition-all cursor-pointer"
            title="Read Manga"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <h3
          className="font-heading font-semibold text-xs sm:text-sm text-surface-primary group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
          title={title}
        >
          {title}
        </h3>

        <div className="flex items-center justify-between text-xs text-ink-500 pt-1 border-t border-ink-700/60">
          <span className="inline-flex items-center gap-1 text-ink-500 text-xs">
            <BookOpen className="w-3 h-3 text-orange-400" />
            <span>Manga</span>
          </span>
          <span className="text-orange-400 font-medium group-hover:translate-x-0.5 transition-transform text-xs">
            Read &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
