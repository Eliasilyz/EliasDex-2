'use client';

import React, { useState, useEffect } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import {
  Anime,
  AnimeEpisode,
  AnimeCharacterRole,
  AnimeThemeSongs,
  AnimeStaffMember,
  AnimeRelation,
  AnimeExternalLink,
  WatchlistStatus,
} from '../types';
import {
  getUnifiedAnimeById,
  getUnifiedEpisodes,
  getUnifiedRecommendations,
  getUnifiedCharacters,
  getUnifiedThemes,
  getUnifiedStaff,
  getUnifiedRelations,
  getUnifiedExternalLinks,
  getUnifiedTopAnime,
} from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { EpisodeList } from '../components/anime/EpisodeList';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { CharacterList } from '../components/anime/CharacterList';
import { ThemeSongsList } from '../components/anime/ThemeSongsList';
import { AnimeRelationsList } from '../components/anime/AnimeRelationsList';
import { TrailerSection } from '../components/anime/TrailerSection';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton, DetailPageSkeleton } from '../components/ui/Skeleton';
import { TitleLanguageToggle } from '../components/ui/TitleLanguageToggle';
import { useWatch } from '../context/WatchContext';
import { useTitleLanguage } from '../context/TitleLanguageContext';
import {
  Play,
  Star,
  Bookmark,
  Check,
  ChevronRight,
  ArrowLeft,
  Video,
  Users,
  Music,
  GitFork,
  Sparkles,
  ExternalLink,
  Share2,
  ListVideo,
  Film,
  TrendingUp,
  Clapperboard,
  Tv,
} from 'lucide-react';

interface AnimeDetailPageProps {
  malId: number;
}

export const AnimeDetailPage: React.FC<AnimeDetailPageProps> = ({ malId }) => {
  const onNavigate = useAppNavigate();
  const { getWatchlistStatus, setWatchlistStatus, getWatchProgress } = useWatch();
  const { getTitle, getSecondaryTitle, titleLanguage } = useTitleLanguage();
  const { dataSource } = useDataSource();

  // Primary Data
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [characters, setCharacters] = useState<AnimeCharacterRole[]>([]);
  const [themes, setThemes] = useState<AnimeThemeSongs>({ openings: [], endings: [] });
  const [staff, setStaff] = useState<AnimeStaffMember[]>([]);
  const [relations, setRelations] = useState<AnimeRelation[]>([]);
  const [externalLinks, setExternalLinks] = useState<AnimeExternalLink[]>([]);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [topAiring, setTopAiring] = useState<Anime[]>([]);

  // State controls
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'episodes' | 'characters' | 'themes' | 'relations'>('episodes');

  const watchlistStatus = getWatchlistStatus(malId);
  const watchProgress = getWatchProgress(malId);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadAnimeData() {
      try {
        // Phase 1: Core anime details and episodes (primary view)
        const [animeRes, epData] = await Promise.all([
          getUnifiedAnimeById(malId, { source: dataSource }),
          getUnifiedEpisodes(malId, { source: dataSource }).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        const animeData = animeRes.data;
        setAnime(animeData);
        setEpisodes(epData.data || []);

        // Extract embedded themes, relations, and external links directly
        if (animeData?.theme) {
          setThemes({
            openings: animeData.theme.openings || [],
            endings: animeData.theme.endings || [],
          });
        }
        if (animeData?.relations && animeData.relations.length > 0) {
          setRelations(animeData.relations);
        }
        if (animeData?.external && animeData.external.length > 0) {
          setExternalLinks(animeData.external);
        }

        // Complete primary loading state so user sees main page immediately
        setLoading(false);

        // Phase 2: Secondary data (recommendations, characters, staff, top airing)
        const [recData, charData, staffData, topData] = await Promise.all([
          getUnifiedRecommendations(malId, { source: dataSource }).catch(() => []),
          getUnifiedCharacters(malId, { source: dataSource }).catch(() => []),
          getUnifiedStaff(malId, { source: dataSource }).catch(() => []),
          getUnifiedTopAnime({ source: dataSource, filter: 'airing', limit: 5 }).then((res) => res.data).catch(() => []),
        ]);

        if (!isMounted) return;

        if (recData && recData.length > 0) setRecommendations(recData);
        if (charData && charData.length > 0) setCharacters(charData);
        if (staffData && staffData.length > 0) setStaff(staffData);
        if (topData && topData.length > 0) setTopAiring(topData.slice(0, 5));

        // If themes or relations were empty, populate with fallback
        if (!animeData?.theme?.openings?.length && !animeData?.theme?.endings?.length) {
          getUnifiedThemes(malId, animeData).then((t) => isMounted && setThemes(t)).catch(() => {});
        }
        if (!animeData?.relations?.length) {
          getUnifiedRelations(malId, animeData).then((r) => isMounted && setRelations(r)).catch(() => {});
        }
        if (!animeData?.external?.length) {
          getUnifiedExternalLinks(malId, animeData).then((e) => isMounted && setExternalLinks(e)).catch(() => {});
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load anime details');
          setLoading(false);
        }
      }
    }

    loadAnimeData();

    return () => {
      isMounted = false;
    };
  }, [malId, dataSource]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="pb-16 pt-2">
        <DetailPageSkeleton />
      </div>
    );
  }


  if (error || !anime) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">Anime Not Found</h2>
        <p className="text-sm text-zinc-400">{error || 'Could not retrieve anime information.'}</p>
        <Button variant="secondary" onClick={() => onNavigate('/')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Home
        </Button>
      </div>
    );
  }

  const title = getTitle(anime);
  const secondaryTitle = getSecondaryTitle(anime);
  const posterUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    '';

  const backdropUrl =
    anime.trailer?.images?.maximum_image_url ||
    anime.trailer?.images?.large_image_url ||
    posterUrl;

  const targetEp = watchProgress ? watchProgress.episodeNumber : 1;
  const totalEpCount = anime.episodes || episodes.length || 12;

  const handleStatusChange = (status: WatchlistStatus | 'remove') => {
    setWatchlistStatus(anime, status);
  };

  const totalThemeSongs = (themes.openings?.length || 0) + (themes.endings?.length || 0);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-400 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-orange-400 transition-colors cursor-pointer shrink-0"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <button
          type="button"
          onClick={() => onNavigate('/browse')}
          className="hover:text-orange-400 transition-colors cursor-pointer shrink-0"
        >
          {anime.type || 'Anime'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-md">
          {title}
        </span>
      </nav>

      {/* 2. Top Anime Showcase Banner (Classic Anime Streaming Site Showcase) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        {/* Background Wallpaper with Blur & Fade */}
        <div className="absolute inset-0 z-0">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter blur-md brightness-[0.25] scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent" />
        </div>

        {/* Content Inside Hero Showcase */}
        <div className="relative z-10 p-4 sm:p-7 flex flex-col md:flex-row gap-5 sm:gap-7 items-start">
          {/* Left Column: Cover Poster & Action Buttons */}
          <div className="w-36 sm:w-48 md:w-56 shrink-0 mx-auto md:mx-0 flex flex-col gap-3">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700/80 bg-zinc-900 group">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>

            {/* Quick Mobile Action (under poster) */}
            <div className="hidden md:flex flex-col gap-2 w-full">
              <Button
                id="hero-watch-btn"
                variant="primary"
                size="md"
                onClick={() => onNavigate(`/watch/${malId}/${targetEp}`)}
                icon={<Play className="w-4 h-4 fill-white" />}
                className="w-full justify-center shadow-lg shadow-orange-600/30"
              >
                {watchProgress ? `Resume Ep ${watchProgress.episodeNumber}` : 'Watch Now'}
              </Button>

              {/* Watchlist Dropdown */}
              <div className="w-full relative">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-750 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 ${watchlistStatus ? 'text-orange-400 fill-orange-400' : 'text-zinc-500'}`} />
                    <span className="truncate">
                      {watchlistStatus ? watchlistStatus.replace('_', ' ').toUpperCase() : '+ Add to List'}
                    </span>
                  </div>
                  <select
                    value={watchlistStatus || ''}
                    onChange={(e) => handleStatusChange((e.target.value as any) || 'remove')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    <option value="">+ Add to Watchlist</option>
                    <option value="watching">Watching</option>
                    <option value="plan_to_watch">Plan to Watch</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    {watchlistStatus && <option value="remove">Remove from List</option>}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Streaming Badges, Synopsis & Specs */}
          <div className="flex-1 space-y-3.5 min-w-0 text-left">
            {/* Title & Language Toggle Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white font-heading tracking-tight leading-tight">
                  {title}
                </h1>
                <div className="shrink-0 pt-0.5">
                  <TitleLanguageToggle />
                </div>
              </div>
              {secondaryTitle && (
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                  {secondaryTitle}
                </p>
              )}
            </div>

            {/* Streaming Badges Bar (Aniwatch / Zoro style) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-zinc-800 text-zinc-200 border border-zinc-700">
                {anime.rating ? anime.rating.split(' ')[0] : 'PG-13'}
              </span>

              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HD
              </span>

              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SUB: {totalEpCount}
              </span>

              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                DUB: {totalEpCount}
              </span>

              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                {anime.type || 'TV'}
              </span>

              {anime.score && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  <Star className="w-3 h-3 fill-orange-400" />
                  {anime.score.toFixed(2)}
                </span>
              )}
            </div>

            {/* Mobile Watch & Action Buttons (visible on small screens) */}
            <div className="flex md:hidden flex-wrap items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate(`/watch/${malId}/${targetEp}`)}
                icon={<Play className="w-3.5 h-3.5 fill-white" />}
                className="flex-1 min-w-[130px] justify-center"
              >
                {watchProgress ? `Resume Ep ${watchProgress.episodeNumber}` : 'Watch Now'}
              </Button>

              {/* Mobile Quick Watchlist Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Bookmark className={`w-3.5 h-3.5 ${watchlistStatus ? 'text-orange-400 fill-orange-400' : 'text-zinc-400'}`} />}
                >
                  <span className="text-[11px] truncate max-w-[80px]">
                    {watchlistStatus ? watchlistStatus.replace('_', ' ') : 'List'}
                  </span>
                </Button>
                <select
                  value={watchlistStatus || ''}
                  onChange={(e) => handleStatusChange((e.target.value as any) || 'remove')}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="">+ Add to Watchlist</option>
                  <option value="watching">Watching</option>
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  {watchlistStatus && <option value="remove">Remove from List</option>}
                </select>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-white transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Synopsis */}
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
              <p className={showFullSynopsis ? '' : 'line-clamp-3 sm:line-clamp-4'}>
                {anime.synopsis || 'No synopsis available.'}
              </p>
              {anime.synopsis && anime.synopsis.length > 200 && (
                <button
                  type="button"
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 mt-1 cursor-pointer"
                >
                  {showFullSynopsis ? '- Less' : '+ More'}
                </button>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs pt-3 border-t border-zinc-800/80 text-zinc-400">
              <div>
                <span className="text-zinc-500 block text-[11px]">Type:</span>
                <span className="font-medium text-zinc-200">{anime.type || 'TV'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Studios:</span>
                <span className="font-medium text-zinc-200">
                  {anime.studios?.map((s) => s.name).join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Date Aired:</span>
                <span className="font-medium text-zinc-200">{anime.aired?.string || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Status:</span>
                <span className="font-medium text-zinc-200">{anime.status || 'Finished Airing'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Duration:</span>
                <span className="font-medium text-zinc-200">{anime.duration || '24m/ep'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Premiered:</span>
                <span className="font-medium text-zinc-200 capitalize">
                  {anime.season ? `${anime.season} ${anime.year || ''}` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Genre Tags */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-zinc-500 font-medium mr-1">Genres:</span>
                {anime.genres.map((g) => (
                  <span
                    key={g.mal_id}
                    onClick={() => onNavigate(`/browse?genre=${g.mal_id}`)}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900/90 hover:bg-orange-600 hover:text-white text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Streaming Content Layout (2 Columns: 70% Left Main / 30% Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-8): Episodes, Relations, Cast, OST, Recommendations */}
        <div className="lg:col-span-8 space-y-7">
          {/* Section Selector Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTabSection('episodes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'episodes'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListVideo className="w-4 h-4" />
              <span>Episodes ({episodes.length || totalEpCount})</span>
            </button>

            {relations.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTabSection('relations')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTabSection === 'relations'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>Related Anime ({relations.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTabSection('characters')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'characters'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Characters & Voice Actors ({characters.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('themes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'themes'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Theme Songs ({totalThemeSongs})</span>
            </button>
          </div>

          {/* Active Section View */}
          <div>
            {/* 1. Episode List Component */}
            {activeTabSection === 'episodes' && (
              <div className="space-y-4">
                <EpisodeList
                  malId={malId}
                  totalEpisodes={anime.episodes}
                  episodesData={episodes}
                  animeStatus={anime.status}
                  currentEp={watchProgress?.episodeNumber || 1}
                  onSelectEpisode={(epNum) => onNavigate(`/watch/${malId}/${epNum}`)}
                />
              </div>
            )}

            {/* 2. Franchise Relations */}
            {activeTabSection === 'relations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-orange-400" />
                    <span>Franchise & Related Anime</span>
                  </h3>
                  <span className="text-xs text-zinc-500">Prequels, Sequels & Spinoffs</span>
                </div>
                <AnimeRelationsList
                  relations={relations}
                  onNavigateAnime={(targetId) => onNavigate(`/anime/${targetId}`)}
                />
              </div>
            )}

            {/* 3. Characters & Cast */}
            {activeTabSection === 'characters' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span>Characters & Voice Cast</span>
                  </h3>
                  <span className="text-xs text-zinc-500">Japanese & English Cast</span>
                </div>
                <CharacterList characters={characters} />
              </div>
            )}

            {/* 4. Theme Songs */}
            {activeTabSection === 'themes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <Music className="w-4 h-4 text-orange-400" />
                    <span>Opening & Ending Theme Songs</span>
                  </h3>
                  <span className="text-xs text-zinc-500">Official Soundtrack</span>
                </div>
                <ThemeSongsList
                  themes={themes}
                  animeTitle={title}
                  animePoster={posterUrl}
                  animeId={malId}
                />
              </div>
            )}
          </div>

          {/* Recommended Anime / More Like This (Always on main column like Aniwatch/Crunchyroll) */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>You May Also Like</span>
                </h3>
                <span className="text-xs text-zinc-500">Recommended Anime</span>
              </div>

              <AnimeGrid
                items={recommendations.slice(0, 8)}
                onSelectAnime={(id) => onNavigate(`/anime/${id}`)}
                onWatchAnime={(id, ep) => onNavigate(`/watch/${id}/${ep || 1}`)}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar (col-span-4): Trailer Box, Details Info & Top Airing */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Official Trailer Player Box */}
          {anime.trailer && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 text-zinc-400">
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>Official Trailer</span>
              </h3>
              <TrailerSection trailer={anime.trailer} title={title} posterImage={posterUrl} />
            </div>
          )}

          {/* 2. Anime Metadata Specifications Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3 text-xs shadow-sm">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-800 flex items-center justify-between">
              <span>Anime Information</span>
              <span className="text-[10px] text-orange-400 font-mono">MAL ID: {anime.mal_id}</span>
            </h3>

            <div className="space-y-2 text-zinc-300">
              {anime.title_japanese && (
                <div className="flex justify-between gap-2">
                  <span className="text-zinc-500">Japanese:</span>
                  <span className="text-right font-medium text-zinc-200 truncate max-w-[180px]">
                    {anime.title_japanese}
                  </span>
                </div>
              )}

              {anime.title_synonyms && anime.title_synonyms.length > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-zinc-500">Synonyms:</span>
                  <span className="text-right font-medium text-zinc-200 truncate max-w-[180px]">
                    {anime.title_synonyms[0]}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Format:</span>
                <span className="font-semibold text-zinc-200">{anime.type || 'TV'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Episodes:</span>
                <span className="font-semibold text-zinc-200">{anime.episodes || 'Unknown'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Status:</span>
                <span className="font-semibold text-zinc-200">{anime.status || 'Finished'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Aired:</span>
                <span className="font-medium text-zinc-200 text-right">{anime.aired?.string || 'N/A'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Season:</span>
                <span className="font-medium text-zinc-200 capitalize">
                  {anime.season ? `${anime.season} ${anime.year || ''}` : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-medium text-zinc-200">{anime.duration || '24 min'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Score:</span>
                <span className="font-bold text-amber-400">
                  {anime.score ? `⭐ ${anime.score.toFixed(2)}` : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Rank:</span>
                <span className="font-medium text-zinc-200">{anime.rank ? `#${anime.rank}` : 'N/A'}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Popularity:</span>
                <span className="font-medium text-zinc-200">
                  {anime.popularity ? `#${anime.popularity}` : 'N/A'}
                </span>
              </div>

              {anime.studios && anime.studios.length > 0 && (
                <div className="flex justify-between gap-2 pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Studios:</span>
                  <span className="font-semibold text-orange-400">
                    {anime.studios.map((s) => s.name).join(', ')}
                  </span>
                </div>
              )}

              {anime.producers && anime.producers.length > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-zinc-500">Producers:</span>
                  <span className="font-medium text-zinc-300 text-right truncate max-w-[180px]">
                    {anime.producers.map((p) => p.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* External Links */}
            {externalLinks.length > 0 && (
              <div className="pt-3 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-500 block mb-1.5">Official Resources:</span>
                <div className="flex flex-wrap gap-1.5">
                  {externalLinks.slice(0, 4).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Top Airing Anime Widget (Standard in anime streaming sidebars) */}
          {topAiring.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3 text-xs shadow-sm">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  Top Airing Anime
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/top')}
                  className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </h3>

              <div className="space-y-2 divide-y divide-zinc-800/50">
                {topAiring.map((item, idx) => {
                  const itemTitle = item.title_english || item.title;
                  const itemImg =
                    item.images?.webp?.small_image_url ||
                    item.images?.jpg?.small_image_url ||
                    item.images?.webp?.image_url;

                  return (
                    <div
                      key={item.mal_id}
                      onClick={() => onNavigate(`/anime/${item.mal_id}`)}
                      className="group flex items-center gap-3 pt-2 first:pt-0 cursor-pointer"
                    >
                      {/* Rank Number */}
                      <span
                        className={`font-mono text-sm font-extrabold w-4 text-center ${
                          idx === 0
                            ? 'text-amber-400'
                            : idx === 1
                            ? 'text-zinc-300'
                            : idx === 2
                            ? 'text-orange-400'
                            : 'text-zinc-600'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Poster */}
                      <div className="w-9 h-12 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 group-hover:border-orange-500 transition-colors">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={itemTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-orange-400 transition-colors truncate">
                          {itemTitle}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span>{item.type || 'TV'}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">⭐ {item.score?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
