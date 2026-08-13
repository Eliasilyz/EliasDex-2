import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Loader2 } from 'lucide-react';
import { Anime } from '../../types';
import { getUnifiedSearchAnime } from '../../lib/animeApi';
import { useDataSource } from '../../context/DataSourceContext';
import { useTitleLanguage } from '../../context/TitleLanguageContext';

interface SearchBarProps {
  onSearchSubmit?: (query: string) => void;
  onSelectAnime?: (malId: number) => void;
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchSubmit,
  onSelectAnime,
  className = '',
  placeholder = 'Search anime, movies, series...',
  compact = false,
}) => {
  const { getTitle } = useTitleLanguage();
  const { dataSource } = useDataSource();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced live search suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getUnifiedSearchAnime(query, { limit: 6 }, { source: dataSource });
        setResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    } else {
      window.location.hash = `#/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleSelect = (malId: number) => {
    setIsOpen(false);
    if (onSelectAnime) {
      onSelectAnime(malId);
    } else {
      window.location.hash = `#/anime/${malId}`;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          id="global-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-zinc-900/90 dark:bg-zinc-900 border border-zinc-700/60 dark:border-zinc-800 rounded-xl pl-10 pr-20 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all ${
            compact ? 'text-xs py-1.5' : ''
          }`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin mr-1" />}
          {query ? (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
              /
            </kbd>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" /> Searching anime...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2 divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto">
              {results.map((anime) => {
                const img =
                  anime.images?.webp?.small_image_url ||
                  anime.images?.jpg?.small_image_url ||
                  anime.images?.webp?.image_url ||
                  '';
                return (
                  <button
                    key={anime.mal_id}
                    id={`search-res-${anime.mal_id}`}
                    type="button"
                    onClick={() => handleSelect(anime.mal_id)}
                    className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-800 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={anime.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <Film className="w-5 h-5 text-zinc-600 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
                        {getTitle(anime)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        {anime.score && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {anime.score}
                          </span>
                        )}
                        <span>•</span>
                        <span>{anime.type || 'TV'}</span>
                        {anime.episodes && (
                          <>
                            <span>•</span>
                            <span>{anime.episodes} eps</span>
                          </>
                        )}
                        {anime.year && (
                          <>
                            <span>•</span>
                            <span>{anime.year}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <div className="p-2 bg-zinc-950/40 text-center">
                <button
                  type="button"
                  id="search-view-all-btn"
                  onClick={handleSubmit}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 py-1 cursor-pointer"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              No anime found for "{query}".
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
