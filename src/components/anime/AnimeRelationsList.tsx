import React from 'react';
import { AnimeRelation } from '../../types';
import { Badge } from '../ui/Badge';
import { GitFork, BookOpen, Tv, ArrowRight, ExternalLink, Film } from 'lucide-react';
interface AnimeRelationsListProps {
  relations: AnimeRelation[];
  onNavigateAnime: (malId: number) => void;
  isLoading?: boolean;
}


export const AnimeRelationsList: React.FC<AnimeRelationsListProps> = ({
  relations,
  onNavigateAnime,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface-canvas/60 rounded-2xl border border-ink-700" />
        ))}
      </div>
    );
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-surface-canvas/30 border border-ink-700/80 space-y-2">
        <GitFork className="w-8 h-8 text-ink-500 mx-auto" />
        <p className="text-sm font-semibold text-ink-300">No related entries found</p>
        <p className="text-xs text-ink-500">This anime is a standalone title or relations are not cataloged.</p>
      </div>
    );
  }

  const getRelationBadgeVariant = (relation: string) => {
    const rel = relation.toLowerCase();
    if (rel.includes('sequel')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (rel.includes('prequel')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (rel.includes('adaptation')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (rel.includes('side story') || rel.includes('spin-off')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    return 'bg-ink-700 text-ink-300 border-ink-500';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {relations.map((relGroup, gIdx) => (
          <div
            key={gIdx}
            className="bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-4 space-y-3 shadow-sm"
          >
            {/* Relation Group Header */}
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getRelationBadgeVariant(
                  relGroup.relation
                )}`}
              >
                {relGroup.relation}
              </span>
              <span className="text-xs text-ink-500">
                ({relGroup.entry.length} {relGroup.entry.length === 1 ? 'entry' : 'entries'})
              </span>
            </div>

            {/* Entries List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relGroup.entry.map((entry) => {
                const isAnime = entry.type?.toLowerCase() === 'anime';

                if (isAnime) {
                  return (
                    <div
                      key={entry.mal_id}
                      onClick={() => onNavigateAnime(entry.mal_id)}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-ink-700/60 hover:bg-ink-700 border border-border-subtle/70 hover:border-orange-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-ink-300 group-hover:text-orange-400 transition-colors truncate">
                            {entry.name}
                          </h4>
                          <span className="text-xs text-ink-500 uppercase font-semibold">
                            Anime Entry
                          </span>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-ink-500/50 group-hover:bg-orange-500 text-ink-500 group-hover:text-white transition-colors shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                // Non-anime (e.g. Manga, Light Novel)
                return (
                  <a
                    key={entry.mal_id}
                    href={entry.url || `https://myanimelist.net/manga/${entry.mal_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-ink-700/40 hover:bg-ink-700/80 border border-border-subtle/50 hover:border-ink-500 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-ink-300 group-hover:text-purple-300 transition-colors truncate">
                          {entry.name}
                        </h4>
                        <span className="text-xs text-ink-500 uppercase font-medium">
                          {entry.type} (Source Material)
                        </span>
                      </div>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-ink-500 group-hover:text-ink-300 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
