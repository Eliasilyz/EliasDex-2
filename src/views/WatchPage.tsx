'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime, AnimeEpisode, StreamSource } from '../types';
import { getUnifiedAnimeById, getUnifiedEpisodes } from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { buildStreamUrl } from '../lib/stream';
import { PlayerFrame } from '../components/player/PlayerFrame';
import { LanguageToggle } from '../components/player/LanguageToggle';
import { ServerSelector } from '../components/player/ServerSelector';
import { ServerNotice } from '../components/player/ServerNotice';
import { EpisodeList } from '../components/anime/EpisodeList';
import { ChatPanel } from '../components/chat/ChatPanel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TitleLanguageToggle } from '../components/ui/TitleLanguageToggle';
import { useWatch } from '../context/WatchContext';
import { useTitleLanguage } from '../context/TitleLanguageContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Tv,
  List,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

interface WatchPageProps {
  malId: number;
  epNum: number;
}

export const WatchPage: React.FC<WatchPageProps> = ({ malId, epNum }) => {
  const searchParams = useSearchParams();
  const initialLang = (searchParams?.get('lang') as 'sub' | 'dub') || 'sub';
  const onNavigate = useAppNavigate();
  const { recordWatchProgress, watchlist, setWatchlistStatus } = useWatch();
  const { getTitle, getSecondaryTitle } = useTitleLanguage();
  const { dataSource } = useDataSource();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [lang, setLang] = useState<'sub' | 'dub'>(initialLang);
  const [source, setSource] = useState<StreamSource>('zoko');
  const [autoNext, setAutoNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const [activeSideTab, setActiveSideTab] = useState<'episodes' | 'chat'>('episodes');
  const [markedWatched, setMarkedWatched] = useState(false);

  // Fetch anime metadata and episodes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getUnifiedAnimeById(malId, { source: dataSource }),
      getUnifiedEpisodes(malId, { source: dataSource }).catch(() => ({ data: [] })),
    ])
      .then(([animeRes, epData]) => {
        if (isMounted) {
          setAnime(animeRes.data);
          setEpisodes(epData.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('WatchPage fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [malId, dataSource]);

  // Record progress whenever anime or episode loads
  useEffect(() => {
    if (anime) {
      setMarkedWatched(false);
      const img =
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.image_url ||
        '';

      recordWatchProgress({
        malId: anime.mal_id,
        title: anime.title_english || anime.title,
        image: img,
        episodeNumber: epNum,
        totalEpisodes: anime.episodes,
        language: lang,
      });
    }
  }, [anime, epNum, lang]);

  // Keyboard shortcut listener for player navigation (N: next, P: prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'n' || e.key === 'N') {
        handleNextEp();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePrevEp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [malId, epNum, anime]);

  const isAiring = anime?.status === 'Currently Airing';
  const maxEpisodes = isAiring && episodes.length > 0
    ? Math.max(episodes.length, epNum)
    : Math.max(anime?.episodes || 0, episodes.length, epNum);
  const hasNextEp = epNum < maxEpisodes;
  const hasPrevEp = epNum > 1;

  // Mark the current episode as completed so the account earns XP/level.
  const markCurrentCompleted = useCallback(() => {
    if (!anime) return;
    const img =
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      anime.images?.webp?.image_url ||
      '';
    recordWatchProgress({
      malId: anime.mal_id,
      title: anime.title_english || anime.title,
      image: img,
      episodeNumber: epNum,
      totalEpisodes: anime.episodes,
      language: lang,
      completed: true,
    });
  }, [anime, epNum, lang, recordWatchProgress]);

  const handleNextEp = () => {
    markCurrentCompleted();
    const next = epNum + 1;
    onNavigate(`/watch/${malId}/${next}?lang=${lang}`);
  };

  const handlePrevEp = () => {
    if (epNum > 1) {
      markCurrentCompleted();
      const prev = epNum - 1;
      onNavigate(`/watch/${malId}/${prev}?lang=${lang}`);
    }
  };

  const handleVideoEnded = () => {
    if (autoNext && hasNextEp) {
      console.log('Video ended. Triggering auto-next episode...');
      markCurrentCompleted();
      handleNextEp();
    }
  };

  // Build the live embed URL
  const streamUrl = buildStreamUrl(source, malId, epNum, lang);
  const currentEpMeta = episodes.find((e) => e.mal_id === epNum);
  const episodeTitle = currentEpMeta?.title ? `${currentEpMeta.title}` : `Episode ${epNum}`;

  return (
    <div className="space-y-4 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate(`/anime/${malId}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-white bg-surface-canvas border border-ink-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anime Details</span>
          </button>

          <h2 className="text-sm sm:text-base font-bold font-heading text-surface-primary truncate">
            {anime ? getTitle(anime) : 'Anime Stream'}
          </h2>
        </div>

        {/* Language and Audio Toggles */}
        <div className="flex items-center gap-3 shrink-0">
          <TitleLanguageToggle />
          <LanguageToggle value={lang} onChange={(newLang) => setLang(newLang)} />
        </div>
      </div>

      {/* Main Layout: 2-column on lg+, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
        {/* ── LEFT: Player + Controls ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Iframe Player */}
          <PlayerFrame
            src={streamUrl}
            title={`${anime?.title || 'Anime'} - Episode ${epNum}`}
            onEnded={handleVideoEnded}
          />

          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-surface-canvas/60 border border-ink-700/80">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-bold text-orange-400 font-mono">
                EPISODE {epNum}
              </span>
              <h3 className="text-sm font-bold font-heading text-surface-primary truncate max-w-[180px] sm:max-w-md">
                {episodeTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasPrevEp}
                onClick={handlePrevEp}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Prev
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={!hasNextEp}
                onClick={handleNextEp}
                className="gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={() => {
                  markCurrentCompleted();
                  setMarkedWatched(true);
                }}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  markedWatched
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-surface-raised text-ink-300 border-ink-700 hover:text-white hover:bg-ink-700'
                }`}
                title="Mark this episode as watched (earns XP)"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{markedWatched ? 'Watched' : 'Mark Watched'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoNext(!autoNext)}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  autoNext
                    ? 'bg-orange-600/20 text-orange-300 border-orange-500/30'
                    : 'bg-surface-raised text-ink-500 border-ink-700'
                }`}
                title={`Auto-Next: ${autoNext ? 'ON' : 'OFF'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Server Selector */}
          <div className="p-3 sm:p-4 rounded-2xl bg-surface-canvas/40 border border-ink-700/80 space-y-3">
            <ServerSelector selectedSource={source} onSelectSource={(s) => setSource(s)} />
            <ServerNotice />
          </div>

          {/* Anime Info Accordion */}
          {anime && (
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-canvas/40 border border-ink-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-bold text-surface-primary font-heading">
                    About this Anime
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                >
                  {showDetails ? 'Hide' : 'Show'}
                </button>
              </div>

              {showDetails && (
                <div className="pt-2 text-xs text-ink-300 space-y-3 animate-in fade-in duration-150">
                  <p className="leading-relaxed">{anime.synopsis || 'No synopsis.'}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-ink-500 pt-2 border-t border-ink-700">
                    <span>Format: <strong className="text-ink-300">{anime.type}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-ink-300">{anime.status}</strong></span>
                    <span>•</span>
                    <span>Score: <strong className="text-amber-400">{anime.score}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Episodes + Chat Sidebar ── */}
        <div className="space-y-0">
          {/* Tab switcher (visible only on mobile/tablet — desktop shows both stacked) */}
          <div className="flex lg:hidden rounded-xl overflow-hidden border border-ink-700 bg-surface-canvas/60 mb-3">
            <button
              type="button"
              onClick={() => setActiveSideTab('episodes')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeSideTab === 'episodes'
                  ? 'bg-ink-700 text-surface-primary'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Episodes
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeSideTab === 'chat'
                  ? 'bg-ink-700 text-surface-primary'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </button>
          </div>

          {/* Mobile: conditionally show active tab */}
          <div className="lg:hidden">
            {activeSideTab === 'episodes' ? (
              <EpisodeList
                malId={malId}
                totalEpisodes={anime?.episodes}
                episodesData={episodes}
                animeStatus={anime?.status}
                currentEp={epNum}
                onSelectEpisode={(targetEpNum) => {
                  onNavigate(`/watch/${malId}/${targetEpNum}?lang=${lang}`);
                }}
              />
            ) : (
              <ChatPanel roomId={`anime-${malId}`} />
            )}
          </div>

          {/* Desktop: both panels stacked */}
          <div className="hidden lg:flex flex-col gap-4">
            <EpisodeList
              malId={malId}
              totalEpisodes={anime?.episodes}
              episodesData={episodes}
              animeStatus={anime?.status}
              currentEp={epNum}
              onSelectEpisode={(targetEpNum) => {
                onNavigate(`/watch/${malId}/${targetEpNum}?lang=${lang}`);
              }}
            />
            <ChatPanel roomId={`anime-${malId}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
