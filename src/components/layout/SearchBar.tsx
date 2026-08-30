import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Loader2 } from 'lucide-react';
import { Anime } from '../../types';
import { getUnifiedSearchAnime } from '../../lib/animeApi';
import { useDataSource } from '../../context/DataSourceContext';
import { useTitleLanguage } from '../../context/TitleLanguageContext';
import { useAppNavigate } from '@/lib/useNavigate';

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
  placeholder,
  compact = false,
}) => {
  const effectivePlaceholder = placeholder ?? (compact ? 'Search anime...' : 'Search anime, movies, series...');
  const onNavigate = useAppNavigate();
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
      onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (malId: number) => {
    setIsOpen(false);
    if (onSelectAnime) {
      onSelectAnime(malId);
    } else {
      onNavigate(`/anime/${malId}`);
    }
  };

 return (
  <div ref={dropdownRef} className={`relative w-full ${className}`}>
   <form onSubmit={handleSubmit} className="relative flex items-center">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
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
     placeholder={effectivePlaceholder}
      className={`w-full bg-surface-canvas/90 border border-ink-500/60 rounded-xl pl-10 pr-12 py-2.5 text-sm text-surface-primary placeholder-ink-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all ${
       compact ? 'py-2.5' : 'py-2.5'
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
       className="p-1 rounded-md text-ink-500 hover:text-ink-300"
      >
       <X className="w-3.5 h-3.5" />
      </button>
     ) : (
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-ink-300 bg-ink-700 rounded border border-ink-500">
       /
      </kbd>
     )}
    </div>
   </form>

   {/* Autocomplete Dropdown */}
   {isOpen && query.trim().length >= 2 && (
    <div className="absolute left-0 right-0 top-full mt-2 bg-surface-canvas/95 backdrop-blur-xl border border-ink-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
     {isLoading && results.length === 0 ? (
      <div className="p-4 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
       <Loader2 className="w-4 h-4 animate-spin text-orange-400" /> Searching anime...
      </div>
     ) : results.length > 0 ? (
      <div data-lenis-prevent className="py-2 divide-y divide-ink-700/60 max-h-[380px] overflow-y-auto">
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
          className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-ink-700/80 transition-colors text-left group cursor-pointer"
         >
          <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-ink-700 relative">
           {img ? (
            <img
             src={img}
             alt={anime.title}
             className="w-full h-full object-cover transition-transform"
             loading="lazy"
            />
           ) : (
            <Film className="w-5 h-5 text-ink-500 absolute inset-0 m-auto" />
           )}
          </div>
          <div className="flex-1 min-w-0">
           <h4 className="text-sm font-medium text-ink-300 group-hover:text-orange-400 transition-colors truncate">
            {getTitle(anime)}
           </h4>
           <div className="flex items-center gap-2 mt-1 text-xs text-ink-500">
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
       <div className="p-2 bg-surface-canvas/40 text-center">
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
      <div className="p-6 text-center text-sm text-ink-500">
       No anime found for "{query}".
      </div>
     ) : null}
    </div>
   )}
  </div>
 );
};
