'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime, Genre, SearchFilters } from '../types';
import { getUnifiedSearchAnime, getUnifiedGenres } from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Button } from '../components/ui/Button';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SearchPageProps {
 initialQuery?: string;
}

const POPULAR_SEARCH_TAGS = [
 'Jujutsu Kaisen',
 'Attack on Titan',
 'Demon Slayer',
 'Frieren',
 'One Piece',
 'Solo Leveling',
 'Chainsaw Man',
 'Bleach',
 'Naruto',
 'Death Note',
 'Oshi no Ko',
 'Spy x Family',
];

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '' }) => {
 const onNavigate = useAppNavigate();
 const { dataSource } = useDataSource();
 const [query, setQuery] = useState(initialQuery);
 const [activeSearchQuery, setActiveSearchQuery] = useState(initialQuery);
 const [results, setResults] = useState<Anime[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [genres, setGenres] = useState<Genre[]>([]);
 const [showFilters, setShowFilters] = useState(false);

 // Filters State
 const [selectedGenre, setSelectedGenre] = useState<string>('');
 const [selectedType, setSelectedType] = useState<string>('');
 const [selectedStatus, setSelectedStatus] = useState<string>('');
 const [selectedOrderBy, setSelectedOrderBy] = useState<string>('popularity');
 const [selectedSort, setSelectedSort] = useState<'desc' | 'asc'>('desc');
 const [currentPage, setCurrentPage] = useState<number>(1);
 const [hasNextPage, setHasNextPage] = useState<boolean>(false);

 // Sync initial query prop changes
 useEffect(() => {
  if (initialQuery !== activeSearchQuery) {
   setQuery(initialQuery);
   setActiveSearchQuery(initialQuery);
   setCurrentPage(1);
  }
 }, [initialQuery]);

 // Debounced live typing search
 useEffect(() => {
  const timer = setTimeout(() => {
   const trimmed = query.trim();
   if (trimmed !== activeSearchQuery) {
    setActiveSearchQuery(trimmed);
    setCurrentPage(1);
   }
  }, 350);

  return () => clearTimeout(timer);
 }, [query, activeSearchQuery]);

 // Load available genres
 useEffect(() => {
  getUnifiedGenres({ source: dataSource })
   .then((data) => setGenres(data || []))
   .catch((err) => console.warn('Could not load genres:', err));
 }, [dataSource]);

 // Perform search
 useEffect(() => {
  let isMounted = true;
  setLoading(true);
  setError(null);

  const filters: SearchFilters = {
   query: activeSearchQuery.trim() || undefined,
   genres: selectedGenre || undefined,
   type: (selectedType as any) || undefined,
   status: (selectedStatus as any) || undefined,
   order_by: (selectedOrderBy as any) || undefined,
   sort: selectedSort,
   page: currentPage,
   limit: 24,
  };

  getUnifiedSearchAnime(activeSearchQuery.trim(), filters, { source: dataSource })
   .then((res) => {
    if (isMounted) {
     setResults(res.data || []);
     setHasNextPage(res.pagination?.has_next_page || false);
     setLoading(false);
    }
   })
   .catch((err) => {
    if (isMounted) {
     console.error('Search error:', err);
     setError(err.message || 'Failed to search anime. Please try again.');
     setLoading(false);
    }
   });

  return () => {
   isMounted = false;
  };
 }, [activeSearchQuery, selectedGenre, selectedType, selectedStatus, selectedOrderBy, selectedSort, currentPage, dataSource]);

 const executeSearch = (searchVal: string) => {
  const trimmed = searchVal.trim();
  setActiveSearchQuery(trimmed);
  setCurrentPage(1);
  onNavigate(`/search?q=${encodeURIComponent(trimmed)}`);
 };

 const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  executeSearch(query);
 };

 const handleQuickTagClick = (tag: string) => {
  setQuery(tag);
  executeSearch(tag);
 };

 const handleResetFilters = () => {
  setSelectedGenre('');
  setSelectedType('');
  setSelectedStatus('');
  setSelectedOrderBy('popularity');
  setSelectedSort('desc');
  setCurrentPage(1);
 };

 const handleClearQuery = () => {
  setQuery('');
  setActiveSearchQuery('');
  setCurrentPage(1);
  onNavigate('/search');
 };

 const hasActiveFilters = !!(selectedGenre || selectedType || selectedStatus || selectedOrderBy !== 'popularity');

 return (
  <div className="space-y-8 pb-16">
   {/* Search Header */}
   <div className="space-y-4">
    <div className="flex items-center justify-between">
     <div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-surface-primary font-heading tracking-tight">
       Search Anime
      </h1>
      <p className="text-xs text-ink-500">Discover and search from thousands of anime series and movies</p>
     </div>

     <Button
      id="search-filter-toggle-btn"
      variant={showFilters ? 'primary' : 'secondary'}
      size="sm"
      onClick={() => setShowFilters(!showFilters)}
      icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
     >
      Filters {hasActiveFilters && '(Active)'}
     </Button>
    </div>

    {/* Search Input Bar */}
    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none" />
     <input
      type="text"
      id="search-page-main-input"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search by title (e.g., Attack on Titan, Jujutsu Kaisen, Frieren, Naruto)..."
      className="w-full bg-surface-canvas border border-ink-700 rounded-2xl pl-12 pr-36 py-3.5 text-sm text-surface-primary placeholder-ink-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:/20"
     />

     <div className="absolute right-2 flex items-center gap-1.5">
      {query && (
       <button
        type="button"
        id="search-page-clear-btn"
        onClick={handleClearQuery}
        className="p-2 rounded-xl text-ink-500 hover:text-ink-300 hover:bg-ink-700/80 transition-colors"
        title="Clear query"
       >
        <X className="w-4 h-4" />
       </button>
      )}

      <Button
       type="submit"
       id="search-page-submit-btn"
       variant="primary"
       size="md"
      >
       Search
      </Button>
     </div>
    </form>

    {/* Popular Quick Suggestions */}
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
     <span className="text-ink-500 shrink-0 flex items-center gap-1 text-xs font-medium">
      <Sparkles className="w-3 h-3 text-orange-400" /> Popular:
     </span>
     {POPULAR_SEARCH_TAGS.map((tag) => (
      <button
       key={tag}
       type="button"
       onClick={() => handleQuickTagClick(tag)}
       className={`shrink-0 px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer border ${
        activeSearchQuery.toLowerCase() === tag.toLowerCase()
         ? 'bg-orange-600/20 border-orange-500/40 text-orange-300'
         : 'bg-surface-canvas/80 border-ink-700 text-ink-500 hover:text-ink-300 hover:border-ink-500'
       }`}
      >
       {tag}
      </button>
     ))}
    </div>

    {/* Collapsible Filter Panel */}
    {showFilters && (
     <div className="p-5 rounded-2xl bg-surface-canvas/80 border border-ink-700 space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
       {/* Genre */}
       <div className="space-y-1.5">
        <label className="text-ink-500 font-medium">Genre</label>
        <select
         value={selectedGenre}
         onChange={(e) => {
          setSelectedGenre(e.target.value);
          setCurrentPage(1);
         }}
         className="w-full bg-ink-700 border border-ink-500 rounded-xl px-3 py-2 text-ink-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
         <option value="">All Genres</option>
         {genres.map((g) => (
          <option key={g.mal_id} value={g.mal_id}>
           {g.name}
          </option>
         ))}
        </select>
       </div>

       {/* Format / Type */}
       <div className="space-y-1.5">
        <label className="text-ink-500 font-medium">Format</label>
        <select
         value={selectedType}
         onChange={(e) => {
          setSelectedType(e.target.value);
          setCurrentPage(1);
         }}
         className="w-full bg-ink-700 border border-ink-500 rounded-xl px-3 py-2 text-ink-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
         <option value="">All Formats</option>
         <option value="tv">TV Series</option>
         <option value="movie">Movie</option>
         <option value="ova">OVA</option>
         <option value="special">Special</option>
         <option value="ona">ONA</option>
        </select>
       </div>

       {/* Status */}
       <div className="space-y-1.5">
        <label className="text-ink-500 font-medium">Status</label>
        <select
         value={selectedStatus}
         onChange={(e) => {
          setSelectedStatus(e.target.value);
          setCurrentPage(1);
         }}
         className="w-full bg-ink-700 border border-ink-500 rounded-xl px-3 py-2 text-ink-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
         <option value="">All Statuses</option>
         <option value="airing">Currently Airing</option>
         <option value="complete">Completed</option>
         <option value="upcoming">Upcoming</option>
        </select>
       </div>

       {/* Sort Order */}
       <div className="space-y-1.5">
        <label className="text-ink-500 font-medium">Sort By</label>
        <select
         value={selectedOrderBy}
         onChange={(e) => {
          setSelectedOrderBy(e.target.value);
          setCurrentPage(1);
         }}
         className="w-full bg-ink-700 border border-ink-500 rounded-xl px-3 py-2 text-ink-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
         <option value="popularity">Popularity</option>
         <option value="score">Score / Rating</option>
         <option value="title">Title (A-Z)</option>
         <option value="start_date">Release Date</option>
         <option value="episodes">Episode Count</option>
        </select>
       </div>
      </div>

      {hasActiveFilters && (
       <div className="flex justify-end pt-2 border-t border-ink-700">
        <button
         type="button"
         onClick={handleResetFilters}
         className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
        >
         Reset all filters
        </button>
       </div>
      )}
     </div>
    )}
   </div>

   {/* Results Section */}
   <section className="space-y-6">
    <div className="flex items-center justify-between text-xs text-ink-500">
     <span className="font-medium">
      {activeSearchQuery ? (
       <>
        Search results for <span className="text-orange-400 font-semibold">"{activeSearchQuery}"</span>
        {!loading && results.length > 0 && ` (${results.length} titles)`}
       </>
      ) : (
       'Discover All Anime'
      )}
     </span>
     <span>Page {currentPage}</span>
    </div>

    <AnimeGrid
     items={results}
     loading={loading}
     error={error}
     onRetry={() => setCurrentPage(1)}
     onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
     onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
    />

    {/* Pagination Navigation */}
    {!loading && results.length > 0 && (
     <div className="flex items-center justify-center gap-3 pt-6 border-t border-ink-700">
      <Button
       variant="secondary"
       size="sm"
       disabled={currentPage <= 1}
       onClick={() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
       }}
       icon={<ChevronLeft className="w-4 h-4" />}
      >
       Previous Page
      </Button>

      <span className="text-xs font-mono text-ink-300 px-3 py-1.5 rounded-xl bg-surface-canvas border border-ink-700">
       Page {currentPage}
      </span>

      <Button
       variant="secondary"
       size="sm"
       disabled={!hasNextPage}
       onClick={() => {
        setCurrentPage((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
       }}
       className="gap-1.5"
      >
       <span>Next Page</span>
       <ChevronRight className="w-4 h-4" />
      </Button>
     </div>
    )}
   </section>
  </div>
 );
};

