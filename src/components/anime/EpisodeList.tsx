import React, { useState, useMemo } from 'react';
import { Play, Check, Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import { AnimeEpisode } from '../../types';
import { Badge } from '../ui/Badge';

interface EpisodeListProps {
  malId: number;
  totalEpisodes?: number | null;
  episodesData?: AnimeEpisode[];
  currentEp?: number;
  onSelectEpisode: (epNum: number) => void;
  watchedEpisodes?: number[];
  className?: string;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  malId,
  totalEpisodes,
  episodesData = [],
  currentEp = 1,
  onSelectEpisode,
  watchedEpisodes = [],
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  // Compute episode count
  const count = Math.max(
    totalEpisodes || 0,
    episodesData.length,
    currentEp || 1
  );

  // Create episode items array
  const allEpisodes = useMemo(() => {
    const list: Array<{
      epNum: number;
      title?: string;
      titleJapanese?: string;
      aired?: string;
      filler?: boolean;
    }> = [];

    for (let i = 1; i <= count; i++) {
      const metadata = episodesData.find((ep) => ep.mal_id === i || ep.mal_id === i);
      list.push({
        epNum: i,
        title: metadata?.title || `Episode ${i}`,
        titleJapanese: metadata?.title_japanese || undefined,
        aired: metadata?.aired || undefined,
        filler: metadata?.filler || false,
      });
    }

    return list;
  }, [count, episodesData]);

  // Group into ranges of 50 episodes
  const RANGE_SIZE = 50;
  const ranges = useMemo(() => {
    const r: Array<{ start: number; end: number; label: string }> = [];
    const numRanges = Math.ceil(count / RANGE_SIZE);
    for (let i = 0; i < numRanges; i++) {
      const start = i * RANGE_SIZE + 1;
      const end = Math.min((i + 1) * RANGE_SIZE, count);
      r.push({ start, end, label: `${start} - ${end}` });
    }
    return r;
  }, [count]);

  // If current episode changes, auto-select the right range
  useMemo(() => {
    if (currentEp > 0) {
      const rangeIdx = Math.floor((currentEp - 1) / RANGE_SIZE);
      if (rangeIdx >= 0 && rangeIdx < ranges.length) {
        setSelectedRangeIndex(rangeIdx);
      }
    }
  }, [currentEp, ranges.length]);

  // Filter episodes by search and range
  const filteredEpisodes = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return allEpisodes.filter(
        (ep) =>
          ep.epNum.toString() === q ||
          ep.title?.toLowerCase().includes(q) ||
          ep.epNum.toString().includes(q)
      );
    }

    const currentRange = ranges[selectedRangeIndex];
    if (!currentRange) return allEpisodes.slice(0, RANGE_SIZE);

    return allEpisodes.slice(currentRange.start - 1, currentRange.end);
  }, [allEpisodes, searchQuery, ranges, selectedRangeIndex]);

  return (
    <div className={`w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h3 className="text-base font-bold text-white font-heading">
            Episodes ({count})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Episode Filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or Ep #"
              className="bg-zinc-800/90 border border-zinc-700/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-32 sm:w-40"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-800/90 border border-zinc-700/60 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Episode Range Selectors (if > 50 episodes) */}
      {!searchQuery && ranges.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {ranges.map((range, idx) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setSelectedRangeIndex(idx)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRangeIndex === idx
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700/80 text-zinc-400 border border-zinc-700/60'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {/* Episodes Rendering: Grid View */}
      {viewMode === 'grid' && (
        <div data-lenis-prevent className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredEpisodes.map((ep) => {
            const isCurrent = currentEp === ep.epNum;
            const isWatched = watchedEpisodes.includes(ep.epNum) || ep.epNum < currentEp;

            return (
              <button
                key={ep.epNum}
                id={`ep-btn-${ep.epNum}`}
                type="button"
                onClick={() => onSelectEpisode(ep.epNum)}
                className={`relative h-11 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                  isCurrent
                    ? 'bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-600/40 ring-2 ring-orange-400/50'
                    : isWatched
                    ? 'bg-zinc-800/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-700 hover:border-orange-500/50'
                    : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                }`}
                title={`Episode ${ep.epNum}: ${ep.title}`}
              >
                {isCurrent && (
                  <Play className="w-2.5 h-2.5 fill-white text-white absolute left-1.5 top-1.5" />
                )}
                <span>{ep.epNum}</span>
                {isWatched && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Episodes Rendering: Detailed List View */}
      {viewMode === 'list' && (
        <div data-lenis-prevent className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 divide-y divide-zinc-800/40">
          {filteredEpisodes.map((ep) => {
            const isCurrent = currentEp === ep.epNum;
            const isWatched = watchedEpisodes.includes(ep.epNum) || ep.epNum < currentEp;

            return (
              <button
                key={ep.epNum}
                id={`ep-list-item-${ep.epNum}`}
                type="button"
                onClick={() => onSelectEpisode(ep.epNum)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600/20 border border-orange-500/40 text-white'
                    : 'hover:bg-zinc-800/80 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-orange-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isCurrent ? <Play className="w-3.5 h-3.5 fill-white" /> : ep.epNum}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-orange-300' : 'text-zinc-200'}`}>
                      {ep.title}
                    </p>
                    {ep.aired && (
                      <p className="text-[10px] text-zinc-500">{ep.aired}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ep.filler && (
                    <Badge variant="warning" size="sm">
                      Filler
                    </Badge>
                  )}
                  {isWatched && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <Check className="w-3 h-3" /> Watched
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filteredEpisodes.length === 0 && (
        <div className="py-8 text-center text-xs text-zinc-500">
          No episodes match your search query.
        </div>
      )}
    </div>
  );
};
