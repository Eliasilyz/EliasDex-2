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
          <div key={i} className="h-20 bg-zinc-900/60 rounded-xl border border-zinc-800/80" />
        ))}
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-10 px-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 text-zinc-500 text-xs">
        No character cast information available for this title.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/70">
        <div className="flex items-center gap-1.5 p-0.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterRole === 'all'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
                : 'text-zinc-400 hover:text-zinc-200'
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
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Supporting ({supportingCount})
          </button>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search character or VA..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-zinc-900/90 border border-zinc-800 focus:border-orange-500 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
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
              className="flex items-stretch justify-between bg-zinc-900/50 hover:bg-zinc-850/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Left Side: Character */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 p-2">
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                  {charImg ? (
                    <img
                      src={charImg}
                      alt={item.character.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px]">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-100 truncate hover:text-orange-400 transition-colors">
                    {item.character.name}
                  </h4>
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase mt-0.5 ${
                      isMain ? 'text-orange-400' : 'text-zinc-400'
                    }`}
                  >
                    {item.role || 'Character'}
                  </span>
                </div>
              </div>

              {/* Right Side: Voice Actor */}
              {primaryVA ? (
                <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 p-2 border-l border-zinc-800/60 text-right bg-zinc-950/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate hover:text-orange-400 transition-colors">
                      {primaryVA.person.name}
                    </p>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {primaryVA.language}
                    </span>
                  </div>

                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                    {vaImg ? (
                      <img
                        src={vaImg}
                        alt={primaryVA.person.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Mic className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-4 border-l border-zinc-800/60 text-[10px] text-zinc-500 italic bg-zinc-950/20">
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
