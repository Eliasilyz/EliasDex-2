'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Compass,
} from 'lucide-react';
import { MangaCard } from '@/components/manga/MangaCard';
import {
  fetchLatestManga,
  searchManga,
  getMangaHistory,
  type LatestResult,
  type SearchResult,
  type MangaHistoryEntry,
} from '@/lib/mangaApi';
import { useAppNavigate } from '@/lib/useNavigate';
import { Button } from '@/components/ui/Button';

export const MangaPage: React.FC = () => {
  const onNavigate = useAppNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Latest Manga State
  const [latestManga, setLatestManga] = useState<LatestResult[]>([]);
  const [page, setPage] = useState(1);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<MangaHistoryEntry[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load history on mount
  useEffect(() => {
    setHistory(getMangaHistory());
  }, []);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    searchManga(debouncedQuery)
      .then((res) => {
        if (isMounted) {
          setSearchResults(res.data || []);
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Search manga error:', err);
          setIsSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Fetch Latest Manga
  useEffect(() => {
    let isMounted = true;
    setLoadingLatest(true);
    setLatestError(null);

    fetchLatestManga(page)
      .then((res) => {
        if (isMounted) {
          setLatestManga(res.data || []);
          setLoadingLatest(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Latest manga error:', err);
          setLatestError(err.message || 'Failed to load latest manga');
          setLoadingLatest(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Navigation Banner (Consistent with Browse / Anime Hub) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-700/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-surface-primary tracking-tight">
              Manga Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Read high quality manga, manhwa & webtoons powered by WeebCentral
          </p>
        </div>

        {/* Search Input Bar in Header */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manga by title..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-canvas border border-ink-700 text-xs sm:text-sm text-surface-primary placeholder-ink-500 focus:border-orange-500 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-ink-500 hover:text-surface-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content */}
      {debouncedQuery ? (
        /* Search Results View */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-surface-primary font-heading flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-400" />
              <span>Results for &ldquo;{debouncedQuery}&rdquo;</span>
              <span className="text-xs text-ink-500 font-normal">
                ({isSearching ? 'Searching...' : `${searchResults.length} found`})
              </span>
            </h2>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs text-orange-400 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-surface-canvas border border-ink-700 animate-pulse" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
              {searchResults.map((manga) => (
                <MangaCard
                  key={manga.url}
                  title={manga.title}
                  url={manga.url}
                  cover={manga.cover}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-ink-700 bg-surface-canvas/60">
              <BookOpen className="w-10 h-10 text-ink-500 mx-auto mb-2 opacity-50" />
              <h3 className="text-base font-semibold text-surface-primary">No manga found</h3>
              <p className="text-xs text-ink-500 mt-1">Try searching with another keyword or English title.</p>
            </div>
          )}
        </section>
      ) : (
        /* Standard Catalog View */
        <div className="space-y-8">
          {/* Reading History */}
          {history.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-surface-primary font-heading flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Continue Reading</span>
                </h2>
                <span className="text-xs text-ink-500">{history.length} in history</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
                {history.slice(0, 6).map((item) => (
                  <MangaCard
                    key={item.seriesUrl}
                    title={item.title}
                    url={item.seriesUrl}
                    cover={item.cover}
                    update={item.lastChapterName}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Latest Chapter Releases */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-surface-primary font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Latest Chapter Updates</span>
              </h2>
              <span className="text-xs text-ink-500">Page {page}</span>
            </div>

            {loadingLatest ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-surface-canvas border border-ink-700 animate-pulse" />
                ))}
              </div>
            ) : latestError ? (
              <div className="py-16 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5">
                <RotateCcw className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-surface-primary">Failed to load manga</h3>
                <p className="text-xs text-ink-500 mt-1 mb-4">{latestError}</p>
                <Button variant="secondary" size="sm" onClick={() => handlePageChange(page)}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
                  {latestManga.map((manga) => (
                    <MangaCard
                      key={manga.url}
                      title={manga.title}
                      url={manga.url}
                      cover={manga.cover}
                      update={manga.update}
                    />
                  ))}
                </div>

                {/* Pagination (Consistent with other browse pages) */}
                <div className="pt-6 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>

                  <span className="px-3.5 py-1.5 rounded-xl bg-surface-canvas border border-ink-700 text-xs font-bold text-orange-400 font-mono">
                    Page {page}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
