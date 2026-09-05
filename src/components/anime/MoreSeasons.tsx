'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { Anime, AnimeRelation } from '@/types';
import { getUnifiedAnimeById } from '@/lib/animeApi';
import { useDataSource } from '@/context/DataSourceContext';
import { useTitleLanguage } from '@/context/TitleLanguageContext';

interface MoreSeasonsProps {
 relations: AnimeRelation[];
 currentMalId: number;
 currentAnime?: Anime | null;
 onNavigateAnime: (malId: number) => void;
}

export const MoreSeasons: React.FC<MoreSeasonsProps> = ({
 relations,
 currentMalId,
 currentAnime,
 onNavigateAnime,
}) => {
 const { dataSource } = useDataSource();
 const { getTitle } = useTitleLanguage();
 const [seasonAnimes, setSeasonAnimes] = useState<Anime[]>([]);
 const [loading, setLoading] = useState(false);

 const seasonEntries = useMemo(() => {
  if (!relations || relations.length === 0) return [];
  const seasonGroups = relations.filter((g) =>
   /sequel|prequel/i.test(g.relation)
  );
  const entries = seasonGroups.flatMap((g) =>
   g.entry.filter((e) => e.type?.toLowerCase() === 'anime')
  );
  // Deduplicate by mal_id
  const seen = new Set<number>();
  const unique: typeof entries = [];
  for (const e of entries) {
   if (!seen.has(e.mal_id) && e.mal_id !== currentMalId) {
    seen.add(e.mal_id);
    unique.push(e);
   }
  }
  return unique;
 }, [relations, currentMalId]);

 useEffect(() => {
  if (seasonEntries.length === 0) {
   setSeasonAnimes([]);
   return;
  }
  let isMounted = true;
  setLoading(true);

  // Fetch details for each season entry with concurrency limit (avoid rate limit burst)
  // Sequential batched fetch: 2 at a time
  async function fetchSeasons() {
   const results: Anime[] = [];
   // Include current anime first if available for ordering
   // We'll fetch other seasons; keep order as in relations (prequel -> sequel)
   for (let i = 0; i < seasonEntries.length; i += 2) {
    const batch = seasonEntries.slice(i, i + 2);
    const batchResults = await Promise.all(
     batch.map(async (entry) => {
      try {
       const res = await getUnifiedAnimeById(entry.mal_id, { source: dataSource });
       return res.data || null;
      } catch {
       return null;
      }
     })
    );
    for (const anime of batchResults) {
     if (anime) results.push(anime);
    }
    // Small delay between batches to be rate-limit safe
    if (i + 2 < seasonEntries.length) {
     await new Promise((r) => setTimeout(r, 350));
    }
   }
   if (isMounted) {
    // Sort by year/season if available, otherwise keep relation order
    results.sort((a, b) => (a.year || 0) - (b.year || 0) || a.mal_id - b.mal_id);
    setSeasonAnimes(results);
    setLoading(false);
   }
  }

  fetchSeasons();
  return () => {
   isMounted = false;
  };
 }, [seasonEntries, dataSource]);

 if (seasonEntries.length === 0) return null;

 const hasFetched = seasonAnimes.length > 0;

 return (
  <div className="space-y-3">
   <div className="flex items-center justify-between pb-2 border-b border-ink-700">
    <h2 className="text-sm font-bold text-surface-primary font-heading flex items-center gap-2">
     <Layers className="w-4 h-4 text-orange-400" />
     <span>More Seasons</span>
    </h2>
    <span className="text-xs text-white">
     {seasonEntries.length} {seasonEntries.length === 1 ? 'season' : 'seasons'}
    </span>
   </div>

   {loading && !hasFetched ? (
    <div className="flex gap-3 overflow-hidden py-1">
     {Array.from({ length: Math.min(seasonEntries.length, 4) }).map((_, i) => (
      <div
       key={i}
       className="w-36 sm:w-40 shrink-0 rounded-xl bg-surface-canvas/60 border border-ink-700 overflow-hidden animate-pulse"
      >
       <div className="aspect-[3/4] w-full bg-ink-700/70" />
       <div className="p-2.5 space-y-2">
        <div className="h-3 w-3/4 rounded bg-ink-700" />
        <div className="h-2.5 w-1/2 rounded bg-ink-700/60" />
       </div>
      </div>
     ))}
    </div>
   ) : (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-1 px-1">
     {/* Optionally include current season as first card with active ring */}
     {currentAnime && (
      <div
       key={`current-${currentMalId}`}
       className="w-36 sm:w-40 shrink-0 rounded-xl overflow-hidden bg-surface-raised border-2 border-orange-500/60 shadow-md flex flex-col cursor-default opacity-90"
       title="Current season"
      >
       <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-700">
        {(() => {
         const img =
          currentAnime.images?.webp?.large_image_url ||
          currentAnime.images?.jpg?.large_image_url ||
          currentAnime.images?.webp?.image_url ||
          '';
         return img ? (
          <img
           src={img}
           alt={getTitle(currentAnime)}
           className="w-full h-full object-cover"
           loading="lazy"
           referrerPolicy="no-referrer"
          />
         ) : (
          <div className="w-full h-full bg-ink-700" />
         );
        })()}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-xs font-bold bg-orange-600 text-white shadow-sm">
         Watching
        </span>
       </div>
       <div className="p-2.5 space-y-1">
        <p className="text-xs font-bold text-surface-primary line-clamp-2 leading-snug">
         {getTitle(currentAnime)}
        </p>
        <p className="text-xs text-white truncate">
         {currentAnime.year ? `${currentAnime.season || ''} ${currentAnime.year}`.trim() : currentAnime.type || 'TV'}
        </p>
       </div>
      </div>
     )}

     {(hasFetched ? seasonAnimes : []).map((anime) => {
      const img =
       anime.images?.webp?.large_image_url ||
       anime.images?.jpg?.large_image_url ||
       anime.images?.webp?.image_url ||
       '';
      const relationLabel =
       relations.find((g) => g.entry.some((e) => e.mal_id === anime.mal_id))?.relation || 'Sequel';
      return (
       <div
        key={anime.mal_id}
        onClick={() => onNavigateAnime(anime.mal_id)}
        className="group w-36 sm:w-40 shrink-0 rounded-xl overflow-hidden bg-surface-canvas/70 hover:bg-surface-raised border border-ink-700 hover:border-orange-500/50 flex flex-col cursor-pointer transition-all hover:shadow-lg"
       >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-700">
         {img ? (
          <img
           src={img}
           alt={getTitle(anime)}
           className="w-full h-full object-cover transition-transform duration-300"
           loading="lazy"
           referrerPolicy="no-referrer"
          />
         ) : (
          <div className="w-full h-full bg-ink-700" />
         )}
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-xs font-bold bg-surface-canvas/90 text-white border border-white/10">
           {relationLabel}
          </span>
          {anime.score && (
           <span className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold bg-surface-canvas/90 text-amber-400 border border-white/10">
            ★ {anime.score.toFixed(1)}
           </span>
          )}
        </div>
        <div className="p-2.5 space-y-1 flex-1 flex flex-col">
         <p className="text-xs font-bold text-surface-primary group-hover:text-orange-400 line-clamp-2 leading-snug transition-colors">
          {getTitle(anime)}
         </p>
         <p className="text-xs text-white truncate mt-auto">
          {anime.year ? `${anime.season || ''} ${anime.year}`.trim() : anime.type || 'TV'} • {anime.episodes ? `${anime.episodes} eps` : anime.status || ''}
         </p>
        </div>
       </div>
      );
     })}

     {/* Fallback: show text-only entries that failed to fetch (with name from relation) */}
     {!hasFetched &&
      seasonEntries.map((entry) => (
       <div
        key={`fallback-${entry.mal_id}`}
        onClick={() => onNavigateAnime(entry.mal_id)}
        className="w-36 sm:w-40 shrink-0 rounded-xl bg-surface-canvas/60 border border-ink-700 p-3 flex flex-col justify-center gap-2 cursor-pointer hover:border-orange-500/50 hover:bg-surface-raised transition-colors"
       >
        <p className="text-xs font-bold text-white line-clamp-2">{entry.name}</p>
        <span className="text-xs text-white">MAL #{entry.mal_id}</span>
       </div>
      ))}
    </div>
   )}
  </div>
 );
};
