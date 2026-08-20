'use client';

import React, { useState } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { useWatch } from '../context/WatchContext';
import { WatchlistStatus } from '../types';
import { Bookmark, Play, Trash2, Star, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const WatchlistPage: React.FC = () => {
  const onNavigate = useAppNavigate();
  const { watchlist, removeFromWatchlist, setWatchlistStatus } = useWatch();
  const [selectedStatus, setSelectedStatus] = useState<WatchlistStatus | 'all'>('all');

  const filteredItems = watchlist.filter((item) =>
    selectedStatus === 'all' ? true : item.status === selectedStatus
  );

  const tabs: Array<{ id: WatchlistStatus | 'all'; label: string; count: number }> = [
    { id: 'all', label: 'All', count: watchlist.length },
    { id: 'watching', label: 'Watching', count: watchlist.filter((i) => i.status === 'watching').length },
    { id: 'plan_to_watch', label: 'Plan to Watch', count: watchlist.filter((i) => i.status === 'plan_to_watch').length },
    { id: 'completed', label: 'Completed', count: watchlist.filter((i) => i.status === 'completed').length },
    { id: 'dropped', label: 'Dropped', count: watchlist.filter((i) => i.status === 'dropped').length },
  ];

  
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-600/10 text-orange-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
              My Watchlist
            </h1>
            <p className="text-xs text-zinc-400">Track and organize your personal anime library</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isSelected = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected ? 'bg-orange-700 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const lastEp = item.lastWatchedEpisode || 1;
            return (
              <div
                key={item.malId}
                className="group relative flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all"
              >
                {/* Poster */}
                <div
                  onClick={() => onNavigate(`/anime/${item.malId}`)}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-850 cursor-pointer"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}

                  {/* Play CTA Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/watch/${item.malId}/${lastEp}`);
                      }}
                      className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg cursor-pointer"
                      title={`Play Episode ${lastEp}`}
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-900/80 backdrop-blur-md text-orange-300 border border-orange-500/30">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Score */}
                  {item.score && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/80 backdrop-blur-md text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {item.score}
                    </div>
                  )}

                  {/* Last watched indicator */}
                  {item.lastWatchedEpisode && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-950/90 border border-orange-500/30 text-orange-300">
                        EP {item.lastWatchedEpisode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <h3
                    onClick={() => onNavigate(`/anime/${item.malId}`)}
                    className="text-xs font-semibold text-white hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/watch/${item.malId}/${lastEp}`)}
                      className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-orange-400" />
                      <span>EP {lastEp}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromWatchlist(item.malId)}
                      className="p-1 rounded-md text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
          <Bookmark className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-300">No Anime in this list</h3>
          <p className="text-xs text-zinc-500">Browse anime and click bookmark to save your favorite titles.</p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/')}>
            Explore Anime
          </Button>
        </div>
      )}
    </div>
  );
};
