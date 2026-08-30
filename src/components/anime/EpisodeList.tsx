import React, { useState, useMemo } from 'react';
import { Play, Check, Search, LayoutGrid, List, Sparkles, Clock } from 'lucide-react';
import { AnimeEpisode } from '../../types';
import { Badge } from '../ui/Badge';

interface EpisodeListProps {
 malId: number;
 totalEpisodes?: number | null;
 episodesData?: AnimeEpisode[];
 /** Pass anime.status so we know if it's airing */
 animeStatus?: string | null;
 currentEp?: number;
 onSelectEpisode: (epNum: number) => void;
 watchedEpisodes?: number[];
 className?: string;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
 malId,
 totalEpisodes,
 episodesData = [],
 animeStatus,
 currentEp = 1,
 onSelectEpisode,
 watchedEpisodes = [],
 className = '',
}) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

 const isAiring = animeStatus === 'Currently Airing';

 const apiCount = useMemo(
 () => episodesData.filter((ep) => ep.mal_id > 0).length,
 [episodesData]
 );

 /**
 * Episode count to display:
 * - If Currently Airing AND API has aired episodes: ONLY show aired episodes (apiCount).
 * - If Finished Airing or no API data yet: show totalEpisodes or apiCount.
 */
 const count = useMemo(() => {
 if (isAiring && apiCount > 0) {
  return Math.max(apiCount, currentEp || 1);
 }
 const val = Math.max(totalEpisodes || 0, apiCount, currentEp || 1);
 return val > 0 ? val : 12;
 }, [totalEpisodes, apiCount, isAiring, currentEp]);

 // Create episode items array for aired episodes only
 const allEpisodes = useMemo(() => {
 const list: Array<{
  epNum: number;
  title: string;
  titleJapanese?: string;
  aired?: string;
  filler?: boolean;
 }> = [];

 for (let i = 1; i <= count; i++) {
  const metadata = episodesData.find((ep) => ep.mal_id === i);
  const hasRealTitle = !!metadata?.title && metadata.title !== `Episode ${i}`;

  let formattedDate: string | undefined = undefined;
  if (metadata?.aired) {
  formattedDate = metadata.aired.includes('T') ? metadata.aired.split('T')[0] : metadata.aired;
  }

  list.push({
  epNum: i,
  title: hasRealTitle ? metadata!.title : `Episode ${i}`,
  titleJapanese: metadata?.title_japanese || undefined,
  aired: formattedDate,
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
 <div className={`w-full bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-4 sm:p-5 space-y-4 ${className}`}>
  {/* Header & Controls */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-700">
  <div className="flex items-center gap-2">
   <Sparkles className="w-4 h-4 text-orange-400" />
   <h3 className="text-base font-bold text-surface-primary font-heading">
   Episodes ({count}{isAiring && totalEpisodes && totalEpisodes > count ? `/${totalEpisodes}` : ''})
   </h3>
   {isAiring && (
   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    Airing
   </span>
   )}
  </div>

  <div className="flex items-center gap-2">
   {/* Search Episode Filter */}
   <div className="relative">
   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
   <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search or Ep #"
    className="bg-ink-700/90 border border-ink-500/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-surface-primary placeholder-ink-500 focus:outline-none focus:border-orange-500 w-32 sm:w-40"
   />
   </div>

   {/* View Toggle */}
   <div className="flex items-center bg-ink-700/90 border border-ink-500/60 rounded-xl p-0.5">
   <button
    type="button"
    onClick={() => setViewMode('grid')}
    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
    viewMode === 'grid'
     ? 'bg-ink-500 text-white'
     : 'text-ink-500 hover:text-ink-300'
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
     ? 'bg-ink-500 text-white'
     : 'text-ink-500 hover:text-ink-300'
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
     : 'bg-ink-700 hover:bg-ink-500/80 text-ink-300 border border-ink-500/60'
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
   const hasTitle = ep.title && ep.title !== `Episode ${ep.epNum}`;

   return (
    <button
    key={ep.epNum}
    id={`ep-btn-${ep.epNum}`}
    type="button"
    onClick={() => onSelectEpisode(ep.epNum)}
    className={`relative h-11 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
     isCurrent
     ? 'bg-orange-600 text-white border-orange-400 shadow-md ring-2 '
     : isWatched
     ? 'bg-ink-700/90 text-ink-300 border-ink-500/80 hover:bg-ink-500 hover:border-orange-500/50'
     : 'bg-surface-canvas/90 text-ink-500 border-ink-700 hover:bg-ink-700 hover:text-white'
    }`}
    title={hasTitle ? `Ep ${ep.epNum}: ${ep.title}` : `Episode ${ep.epNum}`}
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
  <div data-lenis-prevent className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
   {filteredEpisodes.map((ep) => {
   const isCurrent = currentEp === ep.epNum;
   const isWatched = watchedEpisodes.includes(ep.epNum) || ep.epNum < currentEp;
   const hasRealTitle = ep.title && ep.title !== `Episode ${ep.epNum}`;

   return (
    <button
    key={ep.epNum}
    id={`ep-list-item-${ep.epNum}`}
    type="button"
    onClick={() => onSelectEpisode(ep.epNum)}
    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
     isCurrent
     ? 'bg-orange-600/20 border border-orange-500/40 text-white'
     : 'hover:bg-ink-700/80 text-ink-300'
    }`}
    >
    <div className="flex items-center gap-3 min-w-0">
     <div
     className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
      isCurrent
      ? 'bg-orange-600 text-white'
      : 'bg-ink-700 text-ink-300'
     }`}
     >
     {isCurrent ? <Play className="w-3.5 h-3.5 fill-white" /> : ep.epNum}
     </div>
     <div className="min-w-0">
     <p className={`text-xs sm:text-sm font-semibold truncate ${
      isCurrent ? 'text-orange-300' : hasRealTitle ? 'text-surface-primary' : 'text-ink-300'
     }`}>
      {ep.title}
     </p>
     <div className="flex items-center gap-2 mt-0.5">
      {ep.aired && (
      <p className="text-xs text-ink-500 font-mono">{ep.aired}</p>
      )}
      {ep.titleJapanese && (
      <p className="text-xs text-ink-500 truncate max-w-[140px]">{ep.titleJapanese}</p>
      )}
     </div>
     </div>
    </div>

    <div className="flex items-center gap-1.5 shrink-0">
     {ep.filler && (
     <Badge variant="warning" size="sm">Filler</Badge>
     )}
     {isWatched ? (
     <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
      <Check className="w-3 h-3" />
     </span>
     ) : isCurrent ? (
     <span className="flex items-center gap-1 text-xs text-orange-400 font-mono">
      <Play className="w-3 h-3 fill-orange-400" />
     </span>
     ) : null}
    </div>
    </button>
   );
   })}
  </div>
  )}

  {filteredEpisodes.length === 0 && (
  <div className="py-8 text-center text-xs text-ink-500">
   No episodes match your search query.
  </div>
  )}
 </div>
 );
};
