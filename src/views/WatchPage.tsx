'use client';

import React, { useState, useEffect } from 'react';
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

  const handleNextEp = () => {
    const next = epNum + 1;
    onNavigate(`/watch/${malId}/${next}?lang=${lang}`);
  };

  const handlePrevEp = () => {
    if (epNum > 1) {
      const prev = epNum - 1;
      onNavigate(`/watch/${malId}/${prev}?lang=${lang}`);
    }
  };

  const handleVideoEnded = () => {
    if (autoNext && hasNextEp) {
      console.log('Video ended. Triggering auto-next episode...');
      handleNextEp();
    }
  };

  // Build the live embed URL
  const streamUrl = buildStreamUrl(source, malId, epNum, lang);
  const currentEpMeta = episodes.find((e) => e.mal_id === epNum);
  const episodeTitle = currentEpMeta?.title ? `${currentEpMeta.title}` : `Episode ${epNum}`;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(`/anime/${malId}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anime Details</span>
          </button>

          <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {anime ? getTitle(anime) : 'Anime Stream'}
          </h2>
        </div>

        {/* Language and Audio Toggles */}
        <div className="flex items-center gap-3">
          <TitleLanguageToggle />
          <LanguageToggle value={lang} onChange={(newLang) => setLang(newLang)} />
        </div>
      </div>

      {/* Main Grid: Player on left (2 cols), Episode List on right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Left Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Embedded MegaPlay Video Player */}
          <PlayerFrame
            src={streamUrl}
            title={`${anime?.title || 'Anime'} - Episode ${epNum}`}
            onEnded={handleVideoEnded}
          />

          {/* Player Navigation & Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-orange-400 font-mono">
                EPISODE {epNum}
              </span>
              <h3 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
                {episodeTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Prev Episode */}
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasPrevEp}
                onClick={handlePrevEp}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Prev
              </Button>

              {/* Next Episode */}
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

              {/* Auto Next Toggle */}
              <button
                type="button"
                onClick={() => setAutoNext(!autoNext)}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  autoNext
                    ? 'bg-orange-600/20 text-orange-300 border-orange-500/30'
                    : 'bg-zinc-850 text-zinc-500 border-zinc-800'
                }`}
                title={`Auto-Next: ${autoNext ? 'ON' : 'OFF'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Server Selector & Notice */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <ServerSelector selectedSource={source} onSelectSource={(s) => setSource(s)} />
            <ServerNotice />
          </div>

          {/* Anime Info Accordion */}
          {anime && (
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-bold text-white font-heading">
                    About this Anime
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="pt-2 text-xs text-zinc-300 space-y-3 animate-in fade-in duration-150">
                  <p className="leading-relaxed">{anime.synopsis || 'No synopsis.'}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                    <span>Format: <strong className="text-zinc-200">{anime.type}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-zinc-200">{anime.status}</strong></span>
                    <span>•</span>
                    <span>Score: <strong className="text-amber-400">{anime.score}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Episodes Sidebar Right Section */}
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};
