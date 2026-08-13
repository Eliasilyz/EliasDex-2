import React, { useState, useMemo } from 'react';
import { AnimeThemeSongs, MusicTrack } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import {
  Music,
  Disc3,
  ExternalLink,
  Copy,
  Check,
  Youtube,
  Play,
  Pause,
  Tv,
  ListMusic,
  Search,
  Sparkles,
} from 'lucide-react';

interface ThemeSongsListProps {
  themes: AnimeThemeSongs;
  animeTitle: string;
  animePoster?: string;
  animeId?: number;
  isLoading?: boolean;
}

interface ParsedTheme {
  raw: string;
  number: string;
  title: string;
  artist: string;
  episodes?: string;
}

function parseThemeSong(rawString: string, defaultNum: number): ParsedTheme {
  const trimmed = rawString.trim();
  let number = String(defaultNum);
  let rest = trimmed;

  const numMatch = trimmed.match(/^#?(\d+):\s*(.*)/);
  if (numMatch) {
    number = numMatch[1];
    rest = numMatch[2];
  }

  let title = rest;
  let artist = '';
  let episodes = '';

  const epsMatch = rest.match(/\((eps?\s*[\d\s\-,\+]+)\)$/i);
  if (epsMatch) {
    episodes = epsMatch[1];
    rest = rest.replace(/\((eps?\s*[\d\s\-,\+]+)\)$/i, '').trim();
  }

  const byMatch = rest.match(/^(?:"([^"]+)"|'([^']+)'|([^b]+))\s+by\s+(.+)$/i);
  if (byMatch) {
    title = (byMatch[1] || byMatch[2] || byMatch[3] || rest).trim();
    artist = byMatch[4].trim();
  } else {
    const quoteMatch = rest.match(/^"([^"]+)"\s*(.*)$/);
    if (quoteMatch) {
      title = quoteMatch[1];
      artist = quoteMatch[2].replace(/^by\s+/i, '').trim();
    }
  }

  title = title.replace(/^["']|["']$/g, '');

  return {
    raw: trimmed,
    number,
    title: title || rest,
    artist: artist || 'Featured Artist',
    episodes,
  };
}

export const ThemeSongsList: React.FC<ThemeSongsListProps> = ({
  themes,
  animeTitle,
  animePoster,
  animeId = 0,
  isLoading = false,
}) => {
  const { currentTrack, isPlaying, isLoading: isAudioLoading, playTrack, togglePlay, setShowVideoModal } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<'openings' | 'endings'>('openings');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openings = themes.openings || [];
  const endings = themes.endings || [];

  // Parse all tracks into standardized MusicTrack objects
  const parsedOpenings: { parsed: ParsedTheme; track: MusicTrack }[] = useMemo(() => {
    return openings.map((raw, idx) => {
      const parsed = parseThemeSong(raw, idx + 1);
      const query = `${animeTitle} OP ${parsed.title} ${parsed.artist}`.trim();
      return {
        parsed,
        track: {
          id: `op-${animeId}-${idx + 1}`,
          title: parsed.title,
          artist: parsed.artist,
          animeTitle,
          animePoster,
          animeId,
          type: 'OP',
          number: parsed.number,
          episodes: parsed.episodes,
          query,
        },
      };
    });
  }, [openings, animeTitle, animePoster, animeId]);

  const parsedEndings: { parsed: ParsedTheme; track: MusicTrack }[] = useMemo(() => {
    return endings.map((raw, idx) => {
      const parsed = parseThemeSong(raw, idx + 1);
      const query = `${animeTitle} ED ${parsed.title} ${parsed.artist}`.trim();
      return {
        parsed,
        track: {
          id: `ed-${animeId}-${idx + 1}`,
          title: parsed.title,
          artist: parsed.artist,
          animeTitle,
          animePoster,
          animeId,
          type: 'ED',
          number: parsed.number,
          episodes: parsed.episodes,
          query,
        },
      };
    });
  }, [endings, animeTitle, animePoster, animeId]);

  const fullPlaylist: MusicTrack[] = useMemo(() => {
    return [
      ...parsedOpenings.map((p) => p.track),
      ...parsedEndings.map((p) => p.track),
    ];
  }, [parsedOpenings, parsedEndings]);

  const activeList = activeTab === 'openings' ? parsedOpenings : parsedEndings;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    const q = searchQuery.toLowerCase();
    return activeList.filter(
      (item) =>
        item.parsed.title.toLowerCase().includes(q) ||
        item.parsed.artist.toLowerCase().includes(q) ||
        item.parsed.number.includes(q)
    );
  }, [activeList, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handlePlayAll = () => {
    const currentTabTracks = activeList.map((item) => item.track);
    if (currentTabTracks.length > 0) {
      playTrack(currentTabTracks[0], fullPlaylist);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Tabs & Play All CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            id="themes-tab-op"
            onClick={() => setActiveTab('openings')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'openings'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${activeTab === 'openings' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span>Openings ({openings.length})</span>
          </button>

          <button
            type="button"
            id="themes-tab-ed"
            onClick={() => setActiveTab('endings')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'endings'
                ? 'bg-orange-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Endings ({endings.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeList.length > 0 && (
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All {activeTab === 'openings' ? 'OPs' : 'EDs'}</span>
            </button>
          )}

          {activeList.length > 3 && (
            <div className="relative w-40 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search song or artist..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-zinc-900/90 border border-zinc-800 focus:border-orange-500 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Song Track Rows */}
      {activeList.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
          <Music className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">
            No {activeTab === 'openings' ? 'Opening' : 'Ending'} theme songs cataloged
          </p>
          <p className="text-xs text-zinc-500">
            Themes have not been indexed for this entry.
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-500">
          No songs found matching "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map(({ parsed, track }) => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isThisTrackActive && isPlaying;
            const trackId = track.id;

            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.query)}`;
            const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(`${parsed.title} ${parsed.artist}`)}`;

            return (
              <div
                key={trackId}
                id={`theme-track-${trackId}`}
                className={`group relative border rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-sm ${
                  isThisTrackActive
                    ? 'bg-orange-950/20 border-orange-500/80 shadow-orange-950/40 ring-1 ring-orange-500/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-850/90 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Left Track Info & Instant Play Button */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Instant Play / Pause Circular Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isThisTrackActive) {
                        togglePlay();
                      } else {
                        playTrack(track, fullPlaylist);
                      }
                    }}
                    className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer shadow-md ${
                      isCurrentlyPlaying
                        ? 'bg-orange-600 text-white shadow-orange-600/40 scale-105'
                        : isThisTrackActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 hover:bg-orange-600 text-zinc-300 hover:text-white border border-zinc-700/80'
                    }`}
                    title={isCurrentlyPlaying ? 'Pause Track' : 'Play Track Now'}
                  >
                    {isThisTrackActive && isAudioLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isCurrentlyPlaying ? (
                      /* Animated Equalizer Wave */
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '70%' }} />
                        <span className="w-0.5 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '100%' }} />
                        <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ height: '50%' }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span className="text-[8px] font-bold uppercase opacity-80 leading-none mt-0.5">
                          {parsed.number}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Title, Artist & Episodes */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        onClick={() => playTrack(track, fullPlaylist)}
                        className={`text-sm font-bold truncate cursor-pointer transition-colors ${
                          isThisTrackActive ? 'text-orange-400' : 'text-white group-hover:text-orange-400'
                        }`}
                      >
                        {parsed.title}
                      </h4>
                      {parsed.episodes && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-750 shrink-0">
                          {parsed.episodes}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <span className="text-zinc-500">by</span>
                      <span className="font-medium text-zinc-300">{parsed.artist}</span>
                    </p>
                  </div>
                </div>

                {/* Right Action Tools (Play, Watch MV, Copy, YouTube, Spotify) */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 w-full sm:w-auto justify-end">
                  {/* Direct Play / Listen Now Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isThisTrackActive) {
                        togglePlay();
                      } else {
                        playTrack(track, fullPlaylist);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentlyPlaying
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Song</span>
                      </>
                    )}
                  </button>

                  {/* Watch Video Mode Popout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isThisTrackActive) {
                        playTrack(track, fullPlaylist);
                      }
                      setShowVideoModal(true);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold inline-flex items-center gap-1.5 border border-orange-500/25 transition-colors cursor-pointer"
                    title="Watch Anime Opening / Ending Video"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Video</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(`${parsed.title} - ${parsed.artist}`, trackId)}
                    title="Copy song name"
                    className="p-1.5 sm:p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs inline-flex items-center gap-1.5 border border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    {copiedIndex === trackId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* External YouTube Link */}
                  <a
                    href={youtubeSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Search on YouTube"
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-xs font-semibold inline-flex items-center gap-1.5 border border-red-800/40 transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5 fill-red-400" />
                    <span className="hidden sm:inline text-[11px]">YT</span>
                  </a>

                  {/* External Spotify Link */}
                  <a
                    href={spotifySearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Search on Spotify"
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5 border border-emerald-800/40 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline text-[11px]">Spotify</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
