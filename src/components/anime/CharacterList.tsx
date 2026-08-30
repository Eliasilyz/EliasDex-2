import React, { useState, useMemo } from 'react';
import { AnimeCharacterRole } from '../../types';
import { Search, Mic, ExternalLink, Sparkles } from 'lucide-react';

interface CharacterListProps {
  characters: AnimeCharacterRole[];
  isLoading?: boolean;
}

export const CharacterList: React.FC<CharacterListProps> = ({ characters, isLoading = false }) => {
  const [filterRole, setFilterRole] = useState<'all' | 'Main' | 'Supporting'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const mainCount = useMemo(
    () => characters.filter((c) => c.role?.toLowerCase() === 'main').length,
    [characters]
  );
  const supportingCount = useMemo(
    () => characters.filter((c) => c.role?.toLowerCase() !== 'main').length,
    [characters]
  );

  const filteredCharacters = useMemo(() => {
    return characters.filter((item) => {
      if (filterRole === 'Main' && item.role?.toLowerCase() !== 'main') return false;
      if (filterRole === 'Supporting' && item.role?.toLowerCase() === 'main') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = item.character.name.toLowerCase().includes(q);
      const vaMatch = item.voice_actors?.some((va) =>
        va.person.name.toLowerCase().includes(q)
      );
      return nameMatch || vaMatch;
    });
  }, [characters, filterRole, searchQuery]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface-canvas/60 rounded-xl border border-ink-700/80" />
        ))}
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-10 px-4 rounded-2xl bg-surface-canvas/40 border border-ink-700/70 text-ink-500 text-xs">
        No character cast information available for this title.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-ink-700/70">
        <div className="flex items-center gap-1.5 p-0.5 bg-surface-canvas/90 rounded-xl border border-ink-700 text-xs">
          <button
            type="button"
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRole === 'all'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-ink-500 hover:text-ink-300'
            }`}
          >
            All ({characters.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('Main')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRole === 'Main'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-ink-500 hover:text-ink-300'
            }`}
          >
            Main ({mainCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('Supporting')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRole === 'Supporting'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-ink-500 hover:text-ink-300'
            }`}
          >
            Supporting ({supportingCount})
          </button>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search character or VA..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-surface-canvas/90 border border-ink-700 focus:border-orange-500 rounded-xl text-ink-300 placeholder-ink-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2-Sided Character + Voice Actor Cards (HiAnime / Aniwatch style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredCharacters.map((item) => {
          const isMain = item.role?.toLowerCase() === 'main';
          const charImg =
            item.character.images?.webp?.image_url ||
            item.character.images?.jpg?.image_url ||
            '';

          // Pick primary Japanese VA or first available
          const primaryVA =
            item.voice_actors?.find((va) => va.language?.toLowerCase() === 'japanese') ||
            item.voice_actors?.[0];
          const vaImg = primaryVA?.person?.images?.jpg?.image_url;

          return (
            <div
              key={`${item.character.mal_id}-${item.role}`}
              className="flex items-stretch justify-between bg-surface-canvas/50 hover:bg-surface-raised/80 border border-ink-700/80 hover:border-ink-500/80 rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Left Side: Character */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 p-2">
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-surface-canvas shrink-0 border border-ink-700">
                  {charImg ? (
                    <img
                      src={charImg}
                      alt={item.character.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-ink-700 flex items-center justify-center text-ink-300 text-xs">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-surface-primary truncate hover:text-orange-400 transition-colors">
                    {item.character.name}
                  </h4>
                  <span
                    className={`inline-block text-xs font-semibold uppercase mt-0.5 ${
                      isMain ? 'text-orange-400' : 'text-ink-500'
                    }`}
                  >
                    {item.role || 'Character'}
                  </span>
                </div>
              </div>

              {/* Right Side: Voice Actor */}
              {primaryVA ? (
                <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 p-2 border-l border-ink-700/60 text-right bg-surface-canvas/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink-300 truncate hover:text-orange-400 transition-colors">
                      {primaryVA.person.name}
                    </p>
                    <span className="text-xs text-ink-500 block truncate">
                      {primaryVA.language}
                    </span>
                  </div>

                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-surface-canvas shrink-0 border border-ink-700">
                    {vaImg ? (
                      <img
                        src={vaImg}
                        alt={primaryVA.person.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-ink-700 flex items-center justify-center text-ink-300">
                        <Mic className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-4 border-l border-ink-700/60 text-xs text-ink-500 italic bg-surface-canvas/20">
                  No VA listed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
