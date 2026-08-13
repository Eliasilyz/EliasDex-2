'use client';

import React, { useState, useEffect } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime } from '../types';
import { getUnifiedTopAnime } from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Button } from '../components/ui/Button';
import { Flame, ChevronLeft, ChevronRight, Trophy, Sparkles, Heart } from 'lucide-react';

interface TopAnimePageProps {
  initialFilter?: 'bypopularity' | 'airing' | 'upcoming' | 'favorite';
}

export const TopAnimePage: React.FC<TopAnimePageProps> = ({ initialFilter = 'bypopularity' }) => {
  const onNavigate = useAppNavigate();
  const { dataSource } = useDataSource();
  const [filter, setFilter] = useState<'bypopularity' | 'airing' | 'upcoming' | 'favorite'>(initialFilter);
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (initialFilter !== filter) {
      setFilter(initialFilter);
      setCurrentPage(1);
    }
  }, [initialFilter]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getUnifiedTopAnime({
      source: dataSource,
      filter,
      page: currentPage,
      limit: 24,
    })
      .then((res) => {
        if (isMounted) {
          setItems(res.data || []);
          setHasNextPage(res.pagination?.has_next_page || false);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Top anime error:', err);
          setError(err.message || 'Failed to load top anime');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filter, currentPage, dataSource]);

  const tabs = [
    { id: 'bypopularity', label: 'Most Popular', icon: Flame },
    { id: 'airing', label: 'Top Airing', icon: Trophy },
    { id: 'upcoming', label: 'Top Upcoming', icon: Sparkles },
    { id: 'favorite', label: 'Most Favorited', icon: Heart },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
              Top Anime Charts
            </h1>
            <p className="text-xs text-zinc-400">Discover highest ranked and most celebrated series</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = filter === tab.id;

          return (
            <button
              key={tab.id}
              id={`top-tab-${tab.id}`}
              type="button"
              onClick={() => {
                setFilter(tab.id as any);
                setCurrentPage(1);
                onNavigate(`/top?filter=${tab.id}`);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Top Anime */}
      <section className="space-y-4">
        <div className="text-xs text-zinc-400">
          Showing <span className="text-white font-semibold capitalize">{filter}</span> (Page {currentPage})
        </div>

        <AnimeGrid
          items={items}
          loading={loading}
          error={error}
          onRetry={() => setCurrentPage(1)}
          onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
          onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
        />

        {/* Pagination Navigation */}
        {!loading && items.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-800">
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

            <span className="text-xs font-mono text-zinc-300 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
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
