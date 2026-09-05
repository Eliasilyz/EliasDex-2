'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
  ListOrdered,
  Search,
  Clock,
  Play,
  Layers,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ExternalLink,
  Bookmark,
  TrendingUp,
  FileText,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Button } from '@/components/ui/Button';
import { MangaCard } from '@/components/manga/MangaCard';
import {
  fetchMangaDetail,
  fetchLatestManga,
  getMangaProgress,
  mangaSlug,
  mangaReadUrl,
  type MangaDetailWithChapters,
  type Chapter,
  type LatestResult,
} from '@/lib/mangaApi';

interface MangaDetailPageProps {
  seriesUrl: string;
}

export const MangaDetailPage: React.FC<MangaDetailPageProps> = ({ seriesUrl }) => {
  const onNavigate = useAppNavigate();
  const [manga, setManga] = useState<MangaDetailWithChapters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recommendations / More Manga
  const [recommendations, setRecommendations] = useState<LatestResult[]>([]);

  // UI States
  const [searchChapter, setSearchChapter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'chapters' | 'synopsis'>('chapters');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const progress = getMangaProgress(seriesUrl);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fetch Manga Details
    fetchMangaDetail(seriesUrl)
      .then((data) => {
        if (isMounted) {
          setManga(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Fetch manga detail error:', err);
          setError(err.message || 'Failed to load manga details');
          setLoading(false);
        }
      });

    // Fetch more manga for the sidebar / recommendations
    fetchLatestManga(1)
      .then((res) => {
        if (isMounted && res.data) {
          setRecommendations(res.data.filter((item) => item.url !== seriesUrl).slice(0, 8));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [seriesUrl]);

  const allChapters: Chapter[] = useMemo(() => {
    if (!manga) return [];
    if (manga.chapters && manga.chapters.length > 0) {
      return manga.chapters;
    }
    return manga.episodes?.flatMap((ep) => ep.urls) || [];
  }, [manga]);

  const filteredChapters = useMemo(() => {
    let list = [...allChapters];
    if (searchChapter.trim()) {
      const q = searchChapter.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (sortOrder === 'asc') {
      return [...list].reverse();
    }
    return list;
  }, [allChapters, searchChapter, sortOrder]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleReadChapter = (chapter: Chapter) => {
    onNavigate(mangaReadUrl(chapter.url, seriesUrl));
  };

  const firstChapter = allChapters.length > 0 ? allChapters[allChapters.length - 1] : null;
  const latestChapter = allChapters.length > 0 ? allChapters[0] : null;

  if (loading) {
    return (
      <div className="space-y-6 pb-20 animate-pulse">
        <div className="h-4 w-48 bg-ink-800/60 rounded" />
        <div className="h-96 w-full bg-ink-800/40 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-10 w-64 bg-ink-800/40 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-ink-800/30 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-48 bg-ink-800/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-heading text-surface-primary">Manga Not Found</h2>
        <p className="text-sm text-ink-500">{error || 'Could not retrieve manga information.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => onNavigate('/manga')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Manga Hub
          </Button>
          <Button variant="primary" onClick={() => window.location.reload()} icon={<RotateCcw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-500 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-orange-400 transition-colors cursor-pointer shrink-0"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-ink-500 shrink-0" />
        <button
          type="button"
          onClick={() => onNavigate('/manga')}
          className="hover:text-orange-400 transition-colors cursor-pointer shrink-0"
        >
          Manga Hub
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-ink-500 shrink-0" />
        <span className="text-ink-300 font-medium truncate max-w-[200px] sm:max-w-md">
          {manga.title}
        </span>
      </nav>

      {/* 2. Top Manga Showcase Banner (Matches AnimeDetailPage Top Banner) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-surface-canvas border border-ink-700 shadow-lg">
        {/* Background Wallpaper with Blur & Fade */}
        <div className="absolute inset-0 z-0">
          <img
            src={manga.cover}
            alt={manga.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter blur-md brightness-[0.18] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-surface-canvas/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-canvas/90 via-surface-canvas/50 to-transparent" />
        </div>

        {/* Content Inside Hero Showcase */}
        <div className="relative z-10 p-4 sm:p-7 flex flex-col md:flex-row gap-5 sm:gap-7 items-start">
          {/* Left Column: Cover Poster & Action Buttons */}
          <div className="w-36 sm:w-48 md:w-56 shrink-0 mx-auto md:mx-0 flex flex-col gap-3">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-ink-900 border border-ink-600/50 shadow-2xl">
              <img
                src={manga.cover}
                alt={manga.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

              {/* Desktop Primary Action Buttons */}
            <div className="hidden md:flex flex-col gap-2 w-full">
              {progress ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    onNavigate(mangaReadUrl(progress.lastChapterUrl, seriesUrl))
                  }
                  icon={<Clock className="w-4 h-4" />}
                  className="w-full justify-center shadow-lg bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                >
                  Resume ({progress.lastChapterName})
                </Button>
              ) : null}

              {firstChapter && (
                <Button
                  variant={progress ? 'outline' : 'primary'}
                  size="md"
                  onClick={() => handleReadChapter(firstChapter)}
                  icon={<Play className="w-4 h-4 fill-white" />}
                  className="w-full justify-center shadow-lg"
                >
                  {progress ? 'Read from Start' : 'Read Chapter 1'}
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Title, Metadata Badges, Synopsis & Specs */}
          <div className="flex-1 space-y-3.5 min-w-0 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-600/20 text-orange-400 border border-orange-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <BookOpen className="w-3 h-3" />
                <span>WeebCentral Manga</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-primary font-heading tracking-tight leading-tight">
                {manga.title}
              </h1>
            </div>

            {/* Badges Bar (Matches Anime format) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-ink-700 text-ink-300 border border-ink-500">
                MANGA
              </span>

              <span className="px-2 py-0.5 rounded font-bold text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {allChapters.length} CHAPTERS
              </span>

              {latestChapter && (
                <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LATEST: {latestChapter.name}
                </span>
              )}

              <span className="px-2 py-0.5 rounded font-bold text-xs bg-ink-700 text-ink-300 border border-ink-500">
                HD SCANS
              </span>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex md:hidden flex-wrap items-center gap-2 pt-1">
              {progress ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onNavigate(mangaReadUrl(progress.lastChapterUrl, seriesUrl))
                  }
                  icon={<Clock className="w-3.5 h-3.5" />}
                  className="flex-1 min-w-[130px] justify-center bg-emerald-600 hover:bg-emerald-500"
                >
                  Resume
                </Button>
              ) : firstChapter ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReadChapter(firstChapter)}
                  icon={<Play className="w-3.5 h-3.5 fill-white" />}
                  className="flex-1 min-w-[130px] justify-center"
                >
                  Read Ch. 1
                </Button>
              ) : null}

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-surface-canvas border border-border-subtle text-ink-500 hover:text-white transition-colors"
                title="Share"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Synopsis */}
            {manga.desc && (
              <div className="text-xs sm:text-sm text-ink-300 leading-relaxed pt-1">
                <p className={`${showFullSynopsis ? '' : 'line-clamp-3 sm:line-clamp-4'} max-w-[65ch]`}>
                  {manga.desc}
                </p>
                {manga.desc.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 mt-1 cursor-pointer"
                  >
                    {showFullSynopsis ? '- Less' : '+ More'}
                  </button>
                )}
              </div>
            )}

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs pt-3 border-t border-ink-700/80 text-ink-500">
              <div>
                <span className="text-ink-500 block text-xs">Format:</span>
                <span className="font-medium text-ink-300">Manga</span>
              </div>
              <div>
                <span className="text-ink-500 block text-xs">Total Chapters:</span>
                <span className="font-medium text-ink-300">{allChapters.length}</span>
              </div>
              <div>
                <span className="text-ink-500 block text-xs">Source:</span>
                <span className="font-medium text-ink-300">WeebCentral</span>
              </div>
              <div>
                <span className="text-ink-500 block text-xs">Status:</span>
                <span className="font-medium text-ink-300">Publishing</span>
              </div>
              <div>
                <span className="text-ink-500 block text-xs">Reading Mode:</span>
                <span className="font-medium text-ink-300">Long Strip / Single</span>
              </div>
              <div>
                <span className="text-ink-500 block text-xs">Language:</span>
                <span className="font-medium text-ink-300">English (Scans)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Layout (2 Columns: 70% Left Main / 30% Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-8): Chapters & Synopsis */}
        <div className="lg:col-span-8 space-y-7">
          {/* Section Selector Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-canvas/90 border border-ink-700 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTabSection('chapters')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'chapters'
                  ? 'bg-orange-700 text-white shadow-sm'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Chapters ({allChapters.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('synopsis')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'synopsis'
                  ? 'bg-orange-700 text-white shadow-sm'
                  : 'text-ink-500 hover:text-ink-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Synopsis & Info</span>
            </button>
          </div>

{/* Active Tab: Chapters */}
          {activeTabSection === 'chapters' && (
            <div className="space-y-4">
              {/* Header & Controls (Matches Anime ChapterList) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-700">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  <h2 className="text-base font-bold text-surface-primary font-heading">
                    Chapters ({allChapters.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Chapter Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
                    <input
                      type="text"
                      value={searchChapter}
                      onChange={(e) => setSearchChapter(e.target.value)}
                      placeholder="Search or Ch #..."
                      className="bg-ink-700/90 border border-ink-500/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-surface-primary placeholder-ink-500 focus:outline-none focus:border-orange-500 w-36 sm:w-44"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-ink-700/90 border border-ink-500/60 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-ink-500 text-white' : 'text-ink-500 hover:text-ink-300'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'bg-ink-500 text-white' : 'text-ink-500 hover:text-ink-300'
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sort Order Toggle */}
                  <button
                    type="button"
                    onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-800/80 border border-ink-700 hover:bg-ink-700 text-xs font-semibold text-ink-200 transition-colors"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                  </button>
                </div>
              </div>

              {/* Chapters Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredChapters.map((chapter) => {
                    const isCurrentRead = progress?.lastChapterUrl === chapter.url;
                    // Extract chapter number for clean box display (e.g., "Chapter 105" -> "105")
                    const match = chapter.name.match(/(?:chapter|ch\.?)\s*([\d.]+)/i);
                    const displayNum = match ? match[1] : chapter.name;

                    return (
                      <button
                        key={chapter.url}
                        type="button"
                        onClick={() => handleReadChapter(chapter)}
                        title={chapter.name}
                        className={`relative h-11 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer border px-1 ${
                          isCurrentRead
                            ? 'bg-orange-700 text-white border-orange-400 shadow-md ring-2 ring-orange-400/30'
                            : 'bg-surface-canvas/90 text-ink-500 border-ink-700 hover:bg-ink-700 hover:text-white'
                        }`}
                      >
                        {isCurrentRead && (
                          <Play className="w-2.5 h-2.5 fill-white text-white absolute left-1.5 top-1.5" />
                        )}
                        <span className="truncate">{displayNum}</span>
                        {isCurrentRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                  {filteredChapters.map((chapter, idx) => {
                    const isCurrentRead = progress?.lastChapterUrl === chapter.url;
                    return (
                      <button
                        key={chapter.url}
                        type="button"
                        onClick={() => handleReadChapter(chapter)}
                        className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isCurrentRead
                            ? 'bg-orange-700/20 border border-orange-500/40 text-white'
                            : 'bg-surface-canvas/60 border border-ink-700 hover:bg-ink-800/40 text-surface-primary hover:border-orange-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrentRead
                              ? 'bg-orange-600 text-white'
                              : 'bg-ink-700 text-ink-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`text-sm font-medium truncate ${
                            isCurrentRead ? 'text-white' : 'text-ink-300'
                          }`}>
                            {chapter.name}
                          </span>
                          {isCurrentRead && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase shrink-0">
                              Reading
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${
                          isCurrentRead ? 'text-orange-400' : 'text-ink-500 group-hover:text-orange-400'
                        } transition-colors`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredChapters.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-ink-700 bg-surface-canvas/40">
                  <p className="text-sm text-ink-500">No chapters match your search.</p>
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Synopsis */}
          {activeTabSection === 'synopsis' && (
            <div className="p-6 rounded-2xl bg-surface-canvas/60 border border-ink-700/80 space-y-4">
              <h3 className="text-sm font-bold text-surface-primary font-heading uppercase tracking-wider">
                Full Synopsis
              </h3>
              <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-line">
                {manga.desc || 'No description available for this manga.'}
              </p>
            </div>
          )}

          {/* You May Also Like / Recommended Section */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-ink-700">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-surface-primary font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>You May Also Like</span>
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('/manga')}
                  className="text-xs text-orange-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {recommendations.slice(0, 4).map((item) => (
                  <MangaCard
                    key={item.url}
                    title={item.title}
                    url={item.url}
                    cover={item.cover}
                    update={item.update}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (col-span-4): Metadata & Popular Manga */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Manga Metadata Card */}
          <div className="bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-5 space-y-3 text-xs shadow-sm">
            <h2 className="text-xs font-bold text-ink-300 uppercase tracking-wider pb-2 border-b border-ink-700 flex items-center justify-between">
              <span>Manga Information</span>
              <span className="text-xs text-orange-400 font-mono">WeebCentral</span>
            </h2>

            <div className="space-y-2 text-ink-300">
              <div className="flex justify-between gap-2">
                <span className="text-ink-500">Format:</span>
                <span className="font-semibold text-ink-300">Manga / Manhwa</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-ink-500">Total Chapters:</span>
                <span className="font-semibold text-ink-300">{allChapters.length}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-ink-500">Source:</span>
                <span className="font-medium text-ink-300">WeebCentral</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-ink-500">Status:</span>
                <span className="font-medium text-ink-300">Active</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-ink-500">Reader:</span>
                <span className="font-medium text-ink-300">Webtoon / Page-by-Page</span>
              </div>
            </div>
          </div>

          {/* 2. Top / Latest Updates Sidebar Widget */}
          {recommendations.length > 0 && (
            <div className="bg-surface-canvas/60 border border-ink-700/80 rounded-2xl p-4 space-y-3 text-xs shadow-sm">
              <h2 className="text-xs font-bold text-surface-primary uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  Latest Updates
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/manga')}
                  className="text-xs text-orange-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </h2>

              <div className="space-y-2 divide-y divide-ink-700/50">
                {recommendations.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.url}
                    onClick={() => onNavigate(mangaSlug(item.url))}
                    className="group flex items-center gap-3 pt-2 first:pt-0 cursor-pointer"
                  >
                    <span
                      className={`font-mono text-sm font-extrabold w-4 text-center ${
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 1
                          ? 'text-ink-300'
                          : idx === 2
                          ? 'text-orange-400'
                          : 'text-ink-500'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="w-9 h-12 rounded-lg overflow-hidden bg-surface-canvas shrink-0 group-hover:opacity-90 transition-opacity">
                      <img
                        src={item.cover}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold text-ink-300 group-hover:text-orange-400 transition-colors truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                        <span className="truncate text-orange-400/80">{item.update || 'Manga'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
