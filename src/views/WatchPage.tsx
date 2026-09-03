'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Button } from '../components/ui/Button';
import { TitleLanguageToggle } from '../components/ui/TitleLanguageToggle';
import { WatchPageSkeleton } from '../components/ui/Skeleton';
import { useWatch } from '../context/WatchContext';
import { useTitleLanguage } from '../context/TitleLanguageContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FastForward,
  ChevronDown,
  Info,
  Play,
  Star,
  Tv,
  List,
  RotateCw,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

interface WatchPageProps {
  malId: number;
  epNum: number;
}

const specRow = (label: string, value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <React.Fragment key={label}>
      <dt className="text-[10px] uppercase tracking-[0.08em] text-ink-500">{label}</dt>
      <dd className="text-ink-300 font-medium break-words">{value}</dd>
    </React.Fragment>
  );
};

export const WatchPage: React.FC<WatchPageProps> = ({ malId, epNum }) => {
  const searchParams = useSearchParams();
  const initialLang = (searchParams?.get('lang') as 'sub' | 'dub') || 'sub';
  const onNavigate = useAppNavigate();
  const { recordWatchProgress, setWatchlistStatus, getWatchlistStatus } = useWatch();
  const { getTitle } = useTitleLanguage();
  const { dataSource } = useDataSource();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [lang, setLang] = useState<'sub' | 'dub'>(initialLang);
  const [source, setSource] = useState<StreamSource>('zoko');
  const [autoNext, setAutoNext] = useState(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('eliasdex_autonext');
    return v !== null ? v === 'true' : true;
  });
  const [autoplay, setAutoplay] = useState(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('eliasdex_autoplay');
    return v !== null ? v === 'true' : true;
  });
  const [loading, setLoading] = useState(true);
  const [markedWatched, setMarkedWatched] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);

  const [activeSideTab, setActiveSideTab] = useState<'episodes' | 'chat'>('episodes');
  const xpAwardedRef = useRef(false);

  // Persist autoNext & autoplay preferences to localStorage
  useEffect(() => { localStorage.setItem('eliasdex_autonext', String(autoNext)); }, [autoNext]);
  useEffect(() => { localStorage.setItem('eliasdex_autoplay', String(autoplay)); }, [autoplay]);

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
      xpAwardedRef.current = false;
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
  }, [anime, epNum, lang, recordWatchProgress]);

  // Keyboard: N/P to navigate, Space toggles play in iframe, ? opens help is overkill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.target instanceof HTMLElement && e.target.closest('[role="textbox"]')) return;

      if (e.key === 'n' || e.key === 'N') {
        handleNextEp();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePrevEp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [malId, epNum, anime, autoNext]);

  const isAiring = anime?.status === 'Currently Airing';
  const maxEpisodes = Math.max(anime?.episodes || 0, episodes.length, epNum);
  const hasNextEp = epNum < maxEpisodes;
  const hasPrevEp = epNum > 1;

  const currentEpMeta = episodes.find((e) => e.mal_id === epNum);
  const episodeTitle = currentEpMeta?.title || `Episode ${epNum}`;

  const title = anime ? getTitle(anime) : 'EliasDex';
  const seasonYear = anime?.season && anime?.year ? `${anime.season} ${anime.year}` : anime?.year ? String(anime.year) : null;
  const score = anime?.score;
  const airedString = anime?.aired?.string || null;
  const broadcast = anime?.broadcast?.string || null;

  // Mark the current episode as completed so the account earns XP/level.
  const markCurrentCompleted = useCallback(() => {
    if (!anime || xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    setMarkedWatched(true);
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

  // Auto-mark completed when player progress >= 90%
  const handleProgress = useCallback(
    (event: { currentTime: number; duration: number; progressPercent: number }) => {
      if (event.progressPercent >= 90 && !xpAwardedRef.current) {
        markCurrentCompleted();
      }
    },
    [markCurrentCompleted],
  );

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
      markCurrentCompleted();
      handleNextEp();
    }
  };

  const streamUrl = buildStreamUrl(source, malId, epNum, lang, autoplay);
  const watchlistStatus = anime ? getWatchlistStatus(anime.mal_id) : null;
  const inWatchlist = watchlistStatus !== null;

  const handleWatchlistToggle = () => {
    if (!anime) return;
    if (inWatchlist) {
      setWatchlistStatus(anime, 'remove');
    } else {
      setWatchlistStatus(anime, 'watching');
    }
  };

  const onToggleSynopsis = () => setShowSynopsis((s) => !s);

  return loading ? (
    <WatchPageSkeleton />
  ) : (
    <div className="space-y-3 sm:space-y-4 pb-12 relative" role="main">
      {/* Subtle atmospheric radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/[0.04] rounded-full blur-3xl" />

      {/* Top Bar: back + title + lang */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onNavigate(`/anime/${malId}`)}
          className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-white shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h2
          className="text-xs sm:text-base font-bold font-heading text-surface-primary truncate min-w-0"
          title={title}
        >
          {title}
        </h2>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          <TitleLanguageToggle />
          <LanguageToggle value={lang} onChange={(n) => setLang(n)} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 items-start">
        {/* ── LEFT: Player + Controls ── */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Player — cinematic frame */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
            <PlayerFrame
              src={streamUrl}
              title={`${title} — Episode ${epNum}`}
              onEnded={handleVideoEnded}
              onProgress={handleProgress}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 sm:h-8 bg-gradient-to-b from-black/40 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 sm:h-10 bg-gradient-to-t from-black/50 to-transparent z-20" />
          </div>

          {/* Episode meta bar — stacks on mobile */}
          <div className="rounded-lg border border-ink-700/80 bg-surface-raised px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-400 font-mono">
                  EP {epNum}
                </span>
                {hasNextEp && (
                  <span className="text-[10px] text-ink-600 font-medium">
                    / {maxEpisodes}
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold font-heading text-surface-primary truncate max-w-sm">
                {episodeTitle}
              </h3>
            </div>

            {/* Controls — icon-only on mobile, full labels on sm+ */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
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
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>

              <button
                type="button"
                onClick={handleWatchlistToggle}
                aria-pressed={inWatchlist}
                className={`group/btn p-1.5 sm:p-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer flex items-center gap-1 hover:scale-[1.04] active:scale-[0.97] ${
                  inWatchlist
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-surface-canvas text-ink-400 border-ink-700 hover:text-ink-100 hover:bg-ink-700 hover:border-ink-500'
                }`}
                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Tv className={`w-3.5 h-3.5 transition-colors ${inWatchlist ? 'text-emerald-400' : 'text-ink-500 group-hover/btn:text-ink-300'}`} />
                <span className="hidden sm:inline">{inWatchlist ? 'In list' : 'On list'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  markCurrentCompleted();
                  setMarkedWatched(true);
                }}
                className={`group/btn p-1.5 sm:p-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer flex items-center gap-1 hover:scale-[1.04] active:scale-[0.97] ${
                  markedWatched
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-surface-canvas text-ink-400 border-ink-700 hover:text-ink-100 hover:bg-ink-700 hover:border-ink-500'
                }`}
                title="Mark this episode as watched (earns XP)"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 transition-colors ${markedWatched ? 'text-emerald-400' : 'text-ink-500 group-hover/btn:text-ink-300'}`} />
                <span className="hidden sm:inline">{markedWatched ? 'Watched' : 'Mark watched'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoNext(!autoNext)}
                aria-pressed={autoNext}
                className={`group/btn p-1.5 sm:p-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer flex items-center gap-1 hover:scale-[1.04] active:scale-[0.97] ${
                  autoNext
                    ? 'bg-orange-600/20 text-orange-300 border-orange-500/40 hover:bg-orange-600/30'
                    : 'bg-surface-canvas text-ink-400 border-ink-700 hover:text-ink-100 hover:bg-ink-700 hover:border-ink-500'
                }`}
                title="Auto-next: go to next episode when current ends"
              >
                <FastForward className={`w-3.5 h-3.5 transition-colors ${autoNext ? "text-orange-400" : "text-ink-500 group-hover/btn:text-ink-300"}`} />
                <span>{autoNext ? "Auto-next" : "Auto-next off"}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoplay(!autoplay)}
                aria-pressed={autoplay}
                className={`group/btn p-1.5 sm:p-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer flex items-center gap-1 hover:scale-[1.04] active:scale-[0.97] ${
                  autoplay
                    ? 'bg-orange-600/20 text-orange-300 border-orange-500/40 hover:bg-orange-600/30'
                    : 'bg-surface-canvas text-ink-400 border-ink-700 hover:text-ink-100 hover:bg-ink-700 hover:border-ink-500'
                }`}
                title="Autoplay: start video automatically on load"
              >
                <Play className={`w-3.5 h-3.5 transition-colors ${autoplay ? "text-orange-400" : "text-ink-500 group-hover/btn:text-ink-300"}`} />
                <span>{autoplay ? "Autoplay" : "Autoplay off"}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`/watch/${malId}/${epNum}?lang=${lang}&t=${Date.now()}`)}
                className="group/reload p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 border border-ink-700 hover:border-ink-500 transition-all duration-150 cursor-pointer hover:scale-[1.04] active:scale-[0.97]"
                title="Reload stream"
              >
                <RotateCw className="w-3.5 h-3.5 group-hover/reload:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* Stream sources */}
          <div className="rounded-lg border border-ink-700/80 bg-surface-raised p-3 sm:p-4 space-y-3">
            <ServerSelector selectedSource={source} onSelectSource={(s) => setSource(s)} />
            <ServerNotice />
          </div>

          {/* Anime metadata */}
          {anime && (
            <div className="rounded-lg border border-ink-700/80 bg-surface-raised p-3 sm:p-4 space-y-3 sm:space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs sm:text-sm font-bold font-heading text-surface-primary">
                    About this anime
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={onToggleSynopsis}
                  className="group/syn flex items-center gap-1 text-[10px] sm:text-xs font-medium text-ink-400 hover:text-white transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showSynopsis ? 'rotate-180' : ''}`}
                  />
                  <span className="hidden xs:inline">{showSynopsis ? 'Hide' : 'Show'} synopsis</span>
                  <span className="xs:hidden">{showSynopsis ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              {/* Score + rank */}
              {score && (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                    <span className="font-heading text-sm sm:text-base font-bold text-surface-primary leading-none">
                      {score.toFixed(2)}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-ink-500 font-medium">
                    {anime.rank && (
                      <span>Rank #{anime.rank}</span>
                    )}
                    {anime.popularity != null && (
                      <>
                        {anime.rank && <span className="text-ink-700">·</span>}
                        <span>Top #{anime.popularity}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Spec grid — 2 cols on mobile, 4 on sm+ */}
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:gap-3 text-[10px] sm:text-xs pt-3 border-t border-ink-700/60">
                {specRow('Format', anime.type)}
                {specRow('Episodes', anime.episodes ?? null)}
                {specRow('Status', anime.status)}
                {specRow('Duration', anime.duration)}
                {seasonYear && specRow('Season', seasonYear)}
                {airedString && specRow('Aired', airedString)}
                {broadcast && specRow('Broadcast', broadcast)}
                {anime.rating && specRow('Rating', anime.rating)}
                {anime.studios?.[0] && specRow('Studio', anime.studios[0].name)}
                {anime.producers?.[0] && specRow('Producer', anime.producers[0].name)}
              </dl>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-3 border-t border-ink-700/60">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-ink-500 mr-0.5 sm:mr-1">
                    Genres
                  </span>
                  {anime.genres.slice(0, 5).map((g) => (
                    <span
                      key={g.mal_id}
                      className="px-1.5 sm:px-2 py-0.5 text-[10px] font-medium text-ink-300 bg-ink-700/40 border border-ink-700/60 rounded-md"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {showSynopsis && (
                <p className="text-[11px] sm:text-xs leading-relaxed text-ink-300 pt-3 border-t border-ink-700/60">
                  {anime.synopsis || 'No synopsis available.'}
                </p>
              )}
            </div>
          )}
          </div>

        {/* ── RIGHT: Tabbed Episodes / Live Chat sidebar ── */}
        <div className="space-y-0">
          <div className="relative flex rounded-lg overflow-hidden border border-ink-700/80 bg-surface-raised mb-2">
            <div
              className="absolute inset-y-0 w-1/2 bg-ink-700/50 rounded-lg transition-transform duration-200 ease-out"
              style={{ transform: activeSideTab === 'episodes' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              type="button"
              onClick={() => setActiveSideTab('episodes')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold transition-colors duration-150 ${
                activeSideTab === 'episodes'
                  ? 'text-surface-primary'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Episodes
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('chat')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold transition-colors duration-150 ${
                activeSideTab === 'chat'
                  ? 'text-surface-primary'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Live Room
            </button>
          </div>

          {/* Sidebar panel — shorter on mobile, taller on desktop */}
          <div className="h-[280px] sm:h-[400px] lg:h-[460px] overflow-y-auto rounded-lg border border-ink-700 bg-surface-raised">
            {activeSideTab === 'episodes' ? (
              <EpisodeList
                malId={malId}
                totalEpisodes={anime?.episodes}
                episodesData={episodes}
                animeStatus={anime?.status}
                currentEp={epNum}
                onSelectEpisode={(targetEpNum) => onNavigate(`/watch/${malId}/${targetEpNum}?lang=${lang}`)}
              />
            ) : (
              <ChatPanel roomId={`anime-${malId}`} className="h-full" />
            )}
          </div>
        </div>
      </div>

      {/* Keyboard hint — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-3 text-[10px] text-ink-600 font-medium pt-1">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-ink-700/50 border border-ink-700/60 text-ink-400 font-mono text-[9px]">N</kbd>
          <span>next</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-ink-700/50 border border-ink-700/60 text-ink-400 font-mono text-[9px]">P</kbd>
          <span>prev</span>
        </span>
      </div>
    </div>
  );
};
