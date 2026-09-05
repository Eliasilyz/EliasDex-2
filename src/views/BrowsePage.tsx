'use client';

import React, { useState, useEffect } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime, Genre, SearchFilters } from '../types';
import { getUnifiedGenres, getUnifiedSearchAnime } from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { AnimeListRow } from '../components/anime/AnimeListRow';
import { GenreSelector } from '../components/anime/GenreSelector';
import { Button } from '../components/ui/Button';
import {
 Compass,
 ChevronLeft,
 ChevronRight,
 Search,
 X,
 SlidersHorizontal,
 LayoutGrid,
 List,
 RotateCcw,
} from 'lucide-react';

interface BrowsePageProps {
 initialGenreIds?: number[];
}

export const BrowsePage: React.FC<BrowsePageProps> = ({ initialGenreIds = [] }) => {
 const onNavigate = useAppNavigate();
 const { dataSource } = useDataSource();
 const [genres, setGenres] = useState<Genre[]>([]);
 const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(initialGenreIds);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
 const [formatType, setFormatType] = useState<string>('');
 const [airingStatus, setAiringStatus] = useState<string>('');
 const [minScore, setMinScore] = useState<number>(0);
 const [sortBy, setSortBy] = useState<'popularity' | 'score' | 'favorites' | 'title' | 'start_date'>('popularity');
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

 const [items, setItems] = useState<Anime[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [currentPage, setCurrentPage] = useState<number>(1);
 const [hasNextPage, setHasNextPage] = useState<boolean>(false);
 const [totalCount, setTotalCount] = useState<number | null>(null);

 // Load Genres list
 useEffect(() => {
  getUnifiedGenres({ source: dataSource })
   .then((data) => setGenres(data || []))
   .catch((err) => console.warn('Could not load genres:', err));
 }, [dataSource]);

 // Debounce search input in browse
 useEffect(() => {
  const timer = setTimeout(() => {
   setDebouncedSearchQuery(searchQuery.trim());
   setCurrentPage(1);
  }, 350);
  return () => clearTimeout(timer);
 }, [searchQuery]);

 // Main Data Fetcher
 useEffect(() => {
  let isMounted = true;
  setLoading(true);
  setError(null);

  // Only send genre filter when genres are loaded
  const genreParam = selectedGenreIds.length > 0
   ? selectedGenreIds.join(',')
   : undefined;

  const filterParams: SearchFilters = {
   genres: genreParam,
   type: (formatType as any) || undefined,
   status: (airingStatus as any) || undefined,
   order_by: sortBy as any,
   sort: sortBy === 'title' ? 'asc' : 'desc',
   page: currentPage,
   limit: 24,
  };

  getUnifiedSearchAnime(debouncedSearchQuery, filterParams, { source: dataSource })
   .then((res) => {
    if (isMounted) {
     let fetched = res.data || [];

     if (minScore > 0) {
      fetched = fetched.filter((a) => (a.score || 0) >= minScore);
     }

     setItems(fetched);
     setHasNextPage(res.pagination?.has_next_page || false);
     setTotalCount(res.pagination?.items?.total || null);
     setLoading(false);
    }
   })
   .catch((err) => {
    if (isMounted) {
     console.error('Browse anime error:', err);
     setError(err.message || 'Could not load anime directory');
     setLoading(false);
    }
   });

  return () => {
   isMounted = false;
  };
 }, [selectedGenreIds, genres, debouncedSearchQuery, formatType, airingStatus, minScore, sortBy, currentPage, dataSource]);

 // Count active secondary filters
 const activeExtraFiltersCount = [
  selectedGenreIds.length > 0,
  Boolean(formatType),
  Boolean(airingStatus),
  minScore > 0,
 ].filter(Boolean).length;

 const hasAnyFilter = Boolean(
  selectedGenreIds.length > 0 ||
  searchQuery.trim() ||
  activeExtraFiltersCount > 0 ||
  sortBy !== 'popularity'
 );

 const resetAllFilters = () => {
  setSelectedGenreIds([]);
  setSearchQuery('');
  setFormatType('');
  setAiringStatus('');
  setMinScore(0);
  setSortBy('popularity');
  setCurrentPage(1);
  onNavigate('/browse');
 };

 const toggleGenre = (genreId: number) => {
  setSelectedGenreIds((prev) =>
   prev.includes(genreId)
    ? prev.filter((id) => id !== genreId)
    : [...prev, genreId]
  );
  setCurrentPage(1);
 };

 return (
  <div className="space-y-4 pb-20 max-w-7xl mx-auto">
   {/* Header Row */}
   <div className="flex items-center justify-between gap-3 pt-1">
    <div className="flex items-center gap-2.5">
     <div className="p-2 rounded-xl bg-orange-600/15 text-orange-400 border border-orange-500/20 shrink-0">
      <Compass className="w-5 h-5" />
     </div>
     <div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-surface-primary font-heading tracking-tight">
       Browse Catalog
      </h1>
      {totalCount !== null && (
       <p className="text-xs text-ink-500">
        {totalCount.toLocaleString()} anime available
       </p>
      )}
     </div>
    </div>

    {/* View Mode Switcher */}
    <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-canvas border border-ink-700">
     <button
      type="button"
      onClick={() => setViewMode('grid')}
      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
       viewMode === 'grid'
        ? 'bg-orange-600 text-white shadow-sm '
        : 'text-ink-500 hover:text-white'
      }`}
      title="Grid View"
     >
      <LayoutGrid className="w-4 h-4" />
     </button>
     <button
      type="button"
      onClick={() => setViewMode('list')}
      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
       viewMode === 'list'
        ? 'bg-orange-600 text-white shadow-sm '
        : 'text-ink-500 hover:text-white'
      }`}
      title="List View"
     >
      <List className="w-4 h-4" />
     </button>
    </div>
   </div>

   {/* Sleek Compact Action Toolbar */}
   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
    {/* Compact Search Bar */}
    <div className="relative flex-1">
     <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
     <input
      type="text"
      value={searchQuery}
      onChange={(e) => {
       setSearchQuery(e.target.value);
       setCurrentPage(1);
      }}
      placeholder="Search anime title..."
       className="w-full bg-surface-canvas border border-ink-700 text-surface-primary text-xs pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus: placeholder-ink-500 font-medium transition-all"
     />
     {searchQuery && (
      <button
       type="button"
       onClick={() => setSearchQuery('')}
       className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white"
      >
       <X className="w-3.5 h-3.5" />
      </button>
     )}
    </div>

    {/* Controls Group */}
    <div className="flex items-center gap-2 shrink-0">
     {/* Sort Dropdown */}
     <select
      value={sortBy}
      onChange={(e) => {
       setSortBy(e.target.value as any);
       setCurrentPage(1);
      }}
       className="bg-surface-canvas border border-ink-700 text-ink-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
     >
      <option value="popularity">Most Popular</option>
      <option value="score">Highest Rated</option>
      <option value="favorites">Most Favorited</option>
      <option value="title">Title (A-Z)</option>
      <option value="start_date">Newest First</option>
     </select>

     {/* Filters Drawer Toggle */}
     <button
      type="button"
      onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
       className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
        showFiltersDrawer || activeExtraFiltersCount > 0
         ? 'bg-orange-950/60 border-orange-500/50 text-orange-400'
         : 'bg-surface-canvas border-ink-700 text-ink-300 hover:bg-ink-700'
      }`}
     >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      <span>Filters</span>
      {activeExtraFiltersCount > 0 && (
       <span className="w-4 h-4 rounded-full bg-orange-700 text-white text-xs font-bold flex items-center justify-center ml-0.5">
        {activeExtraFiltersCount}
       </span>
      )}
     </button>

     {/* Reset button if active */}
     {hasAnyFilter && (
      <button
       type="button"
       onClick={resetAllFilters}
        className="p-2 rounded-xl bg-surface-canvas hover:bg-ink-700 border border-ink-700 text-ink-500 hover:text-white transition-colors cursor-pointer"
       title="Reset Filters"
      >
       <RotateCcw className="w-3.5 h-3.5" />
      </button>
     )}
    </div>
   </div>

   {/* Optional Collapsible Filter Drawer */}
   {showFiltersDrawer && (
      <div className="p-3.5 bg-surface-canvas border border-ink-700 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
     {/* Selected Genre Chips */}
     {selectedGenreIds.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
       {selectedGenreIds.map((id) => {
        const g = genres.find((x) => x.mal_id === id);
        if (!g) return null;
        return (
         <button
          key={id}
          type="button"
          onClick={() => toggleGenre(id)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-300 text-xs font-medium hover:bg-orange-600/30 transition-colors cursor-pointer"
         >
          {g.name}
          <X className="w-3 h-3" />
         </button>
        );
       })}
       <button
        type="button"
        onClick={() => { setSelectedGenreIds([]); setCurrentPage(1); }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-canvas border border-ink-700 text-ink-400 text-xs font-medium hover:bg-ink-700 hover:text-ink-200 transition-colors cursor-pointer"
       >
        Clear genres
       </button>
      </div>
     )}

     {/* Genre Checkbox Grid */}
     <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
       Genre
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
       {genres.map((g) => {
        const checked = selectedGenreIds.includes(g.mal_id);
        return (
         <label
          key={g.mal_id}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
           checked
            ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
            : 'bg-surface-canvas text-ink-300 border border-transparent hover:bg-ink-700/50'
          }`}
         >
          <input
           type="checkbox"
           checked={checked}
           onChange={() => toggleGenre(g.mal_id)}
           className="sr-only"
          />
          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
           checked ? 'bg-orange-600 border-orange-600' : 'border-ink-600'
          }`}>
           {checked && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M2.5 6l2.5 2.5 4.5-5" />
            </svg>
           )}
          </span>
          {g.name}
         </label>
        );
       })}
      </div>
     </div>

     {/* Other Filters Row */}
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
       <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">
        Format
       </label>
       <select
        value={formatType}
        onChange={(e) => {
         setFormatType(e.target.value);
         setCurrentPage(1);
        }}
         className="w-full bg-surface-canvas border border-ink-700 text-ink-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
       >
        <option value="">All Formats</option>
        <option value="tv">TV Series</option>
        <option value="movie">Movie</option>
        <option value="ova">OVA</option>
        <option value="ona">ONA</option>
        <option value="special">Special</option>
       </select>
      </div>

      <div>
       <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">
        Airing Status
       </label>
       <select
        value={airingStatus}
        onChange={(e) => {
         setAiringStatus(e.target.value);
         setCurrentPage(1);
        }}
         className="w-full bg-surface-canvas border border-ink-700 text-ink-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
       >
        <option value="">All Statuses</option>
        <option value="airing">Currently Airing</option>
        <option value="complete">Finished Airing</option>
        <option value="upcoming">Upcoming</option>
       </select>
      </div>

      <div>
       <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">
        Rating
       </label>
       <select
        value={minScore}
        onChange={(e) => {
         setMinScore(Number(e.target.value));
         setCurrentPage(1);
        }}
         className="w-full bg-surface-canvas border border-ink-700 text-ink-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
       >
        <option value={0}>Any Score</option>
        <option value={8}>★ 8.0+ Exceptional</option>
        <option value={7}>★ 7.0+ Good</option>
        <option value={6}>★ 6.0+ Average</option>
       </select>
      </div>
     </div>
    </div>
   )}

   {/* Genre Pills Row - horizontal scroll multi-select */}
   <GenreSelector
    genres={genres}
    selectedGenreIds={selectedGenreIds}
    onToggleGenre={toggleGenre}
   />

   {/* Anime Content View */}
   <section className="pt-1 space-y-6">
    {viewMode === 'grid' ? (
     <AnimeGrid
      items={items}
      loading={loading}
      error={error}
      onRetry={() => setCurrentPage(1)}
      emptyMessage="No anime found. Try adjusting your search or filters."
      onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
      onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
     />
    ) : (
     <div>
      {loading && items.length === 0 ? (
       <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 bg-surface-canvas rounded-2xl animate-pulse border border-ink-700" />
        ))}
       </div>
      ) : error && items.length === 0 ? (
       <div className="py-12 text-center max-w-md mx-auto text-ink-500 space-y-3">
        <p className="text-xs">{error}</p>
        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(1)}>
         Retry
        </Button>
       </div>
      ) : items.length === 0 ? (
       <div className="py-12 text-center max-w-md mx-auto text-ink-500 space-y-2">
        <p className="text-xs text-ink-300 font-medium">No anime found</p>
        <Button size="sm" variant="secondary" onClick={resetAllFilters}>
         Reset Filters
        </Button>
       </div>
      ) : (
       <div className="grid grid-cols-1 gap-3">
        {items.map((anime) => (
         <AnimeListRow
          key={anime.mal_id}
          anime={anime}
          onSelect={(malId) => onNavigate(`/anime/${malId}`)}
          onWatch={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
         />
        ))}
       </div>
      )}
     </div>
    )}

    {/* Pagination */}
    {!loading && items.length > 0 && (
     <div className="flex items-center justify-between pt-4 border-t border-ink-700/80">
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
       Previous
      </Button>

      <span className="text-xs font-mono text-ink-300 px-3 py-1 rounded-lg bg-surface-canvas border border-ink-700">
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
       <span>Next</span>
       <ChevronRight className="w-4 h-4" />
      </Button>
     </div>
    )}
   </section>
  </div>
 );
};
