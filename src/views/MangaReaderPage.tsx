'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings2,
  Maximize2,
  RotateCcw,
  Sliders,
  List,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { useAppNavigate } from '@/lib/useNavigate';
import {
  fetchChapterPages,
  fetchMangaDetail,
  saveMangaProgress,
  mangaSlug,
  mangaReadUrl,
  type MangaDetailWithChapters,
  type Chapter,
} from '@/lib/mangaApi';

interface MangaReaderPageProps {
  chapterUrl: string;
  mangaUrl?: string;
}

export const MangaReaderPage: React.FC<MangaReaderPageProps> = ({
  chapterUrl,
  mangaUrl,
}) => {
  const onNavigate = useAppNavigate();

  const [pages, setPages] = useState<string[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manga & Chapter Context
  const [manga, setManga] = useState<MangaDetailWithChapters | null>(null);
  const [readingMode, setReadingMode] = useState<'long-strip' | 'single'>('long-strip');
  const [singlePageIndex, setSinglePageIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState<'normal' | 'wide' | 'full'>('normal');

  // Chapter drawer & settings menu
  const [chapterListOpen, setChapterListOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Chapters list
  const chapters: Chapter[] = useMemo(() => {
    if (!manga) return [];
    if (manga.chapters && manga.chapters.length > 0) return manga.chapters;
    return manga.episodes?.flatMap((ep) => ep.urls) || [];
  }, [manga]);

  // Find current chapter info
  const currentChapterIndex = useMemo(() => {
    return chapters.findIndex((c) => c.url === chapterUrl);
  }, [chapters, chapterUrl]);

  const currentChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex] : null;

  // Next and Previous chapters
  // Note: in WeebCentral, chapters are descending (Index 0 is latest chapter, index n-1 is oldest)
  // So Previous Chapter in story order is index + 1, Next Chapter in story order is index - 1
  const prevChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
    ? chapters[currentChapterIndex + 1]
    : null;

  const nextChapter = currentChapterIndex > 0
    ? chapters[currentChapterIndex - 1]
    : null;

  // Load Manga Detail (if mangaUrl provided)
  useEffect(() => {
    if (!mangaUrl) return;
    let isMounted = true;
    fetchMangaDetail(mangaUrl)
      .then((data) => {
        if (isMounted) setManga(data);
      })
      .catch((err) => console.warn('Could not load manga metadata:', err));

    return () => {
      isMounted = false;
    };
  }, [mangaUrl]);

  // Load Chapter Pages
  useEffect(() => {
    let isMounted = true;
    setLoadingPages(true);
    setError(null);
    setSinglePageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });

    fetchChapterPages(chapterUrl)
      .then((data) => {
        if (isMounted) {
          setPages(data || []);
          setLoadingPages(false);

          // Save progress
          if (mangaUrl && manga) {
            saveMangaProgress({
              seriesUrl: mangaUrl,
              title: manga.title,
              cover: manga.cover,
              lastChapterName: currentChapter?.name || 'Chapter',
              lastChapterUrl: chapterUrl,
              totalPages: data.length,
              updatedAt: Date.now(),
            });
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Fetch pages error:', err);
          setError(err.message || 'Failed to load chapter pages');
          setLoadingPages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chapterUrl, mangaUrl, manga, currentChapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (readingMode === 'single') {
          if (singlePageIndex < pages.length - 1) {
            setSinglePageIndex((p) => p + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (nextChapter) {
            handleGoToChapter(nextChapter);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (readingMode === 'single') {
          if (singlePageIndex > 0) {
            setSinglePageIndex((p) => p - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (prevChapter) {
            handleGoToChapter(prevChapter);
          }
        }
      } else if (e.key === 'Escape') {
        if (chapterListOpen) {
          setChapterListOpen(false);
        } else if (mangaUrl) {
          onNavigate(mangaSlug(mangaUrl));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, singlePageIndex, pages.length, nextChapter, prevChapter, chapterListOpen, mangaUrl]);

  const handleGoToChapter = (chap: Chapter) => {
    setChapterListOpen(false);
    onNavigate(mangaReadUrl(chap.url, mangaUrl));
  };

  const handleBackToManga = () => {
    if (mangaUrl) {
      onNavigate(mangaSlug(mangaUrl));
    } else {
      onNavigate('/manga');
    }
  };

  const widthClass = {
    normal: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-full px-2',
  }[maxWidth];

  return (
    <div className="min-h-screen bg-surface-canvas text-surface-primary selection:bg-orange-600 selection:text-white pb-24">
      {/* Sticky Reader Top Navbar */}
      <header className="sticky top-0 z-40 bg-surface-canvas/95 backdrop-blur-md border-b border-ink-800/80 px-4 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Back button & Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToManga}
              className="p-2 rounded-xl bg-ink-800/80 hover:bg-ink-700 text-ink-300 hover:text-white border border-ink-700/80 transition-colors shrink-0"
              title="Back to Manga Detail"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                {manga?.title || 'Manga Reader'}
              </h1>
              <p className="text-[11px] text-orange-400 font-medium truncate">
                {currentChapter?.name || 'Chapter'}
              </p>
            </div>
          </div>

          {/* Center: Chapter Quick Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prev Chapter */}
            <button
              type="button"
              disabled={!prevChapter}
              onClick={() => prevChapter && handleGoToChapter(prevChapter)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-ink-800/80 hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white border border-ink-700/80 flex items-center gap-1 transition-all"
              title={prevChapter ? `Previous: ${prevChapter.name}` : 'No previous chapter'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Prev Chapter</span>
            </button>

            {/* Chapters Drawer Trigger */}
            <button
              type="button"
              onClick={() => setChapterListOpen((o) => !o)}
              className="px-3 py-1.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-xs font-semibold text-orange-400 border border-ink-700/80 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate">
                {currentChapter ? currentChapter.name : 'Chapters'}
              </span>
            </button>

            {/* Next Chapter */}
            <button
              type="button"
              disabled={!nextChapter}
              onClick={() => nextChapter && handleGoToChapter(nextChapter)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-ink-800/80 hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white border border-ink-700/80 flex items-center gap-1 transition-all"
              title={nextChapter ? `Next: ${nextChapter.name}` : 'No next chapter'}
            >
              <span className="hidden md:inline">Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Reading Mode & Width Controls */}
          <div className="flex items-center gap-1.5">
            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center bg-ink-900 rounded-xl p-0.5 border border-ink-800">
              <button
                type="button"
                onClick={() => setReadingMode('long-strip')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  readingMode === 'long-strip'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                Webtoon
              </button>
              <button
                type="button"
                onClick={() => setReadingMode('single')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  readingMode === 'single'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                Single Page
              </button>
            </div>

            {/* Width Toggle */}
            <button
              type="button"
              onClick={() =>
                setMaxWidth((w) => (w === 'normal' ? 'wide' : w === 'wide' ? 'full' : 'normal'))
              }
              className="p-2 rounded-xl bg-ink-800/80 hover:bg-ink-700 text-ink-300 hover:text-white border border-ink-700/80 transition-colors"
              title={`Layout Width: ${maxWidth}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chapters Sidebar / Modal Drawer */}
      {chapterListOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm h-full bg-surface-canvas border-l border-ink-800 flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-ink-800">
              <div>
                <h3 className="font-bold text-white">Chapter List</h3>
                <p className="text-xs text-ink-400">{chapters.length} chapters available</p>
              </div>
              <button
                type="button"
                onClick={() => setChapterListOpen(false)}
                className="p-1.5 rounded-lg text-ink-400 hover:text-white bg-ink-800"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1.5 custom-scrollbar">
              {chapters.map((chap) => {
                const isCurrent = chap.url === chapterUrl;
                return (
                  <button
                    key={chap.url}
                    type="button"
                    onClick={() => handleGoToChapter(chap)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-orange-600 text-white font-bold'
                        : 'text-ink-200 hover:bg-ink-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{chap.name}</span>
                    {isCurrent && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Pages Container */}
      <main className="w-full pt-4 pb-24 sm:pb-0">
        {loadingPages ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-300 font-medium animate-pulse">
              Loading chapter pages...
            </p>
          </div>
        ) : error ? (
          <div className="py-24 text-center max-w-md mx-auto rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8">
            <RotateCcw className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Failed to Load Pages</h3>
            <p className="text-sm text-ink-400 mt-1 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto rounded-2xl border border-ink-800 bg-ink-900/30 p-8">
            <BookOpen className="w-10 h-10 text-ink-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white">No pages found</h3>
            <p className="text-sm text-ink-400 mt-1">This chapter does not contain any readable images.</p>
          </div>
        ) : readingMode === 'long-strip' ? (
          /* Webtoon Long-Strip Mode */
          <div className="w-full flex flex-col items-center">
            {pages.map((imgSrc, idx) => (
              <div key={idx} className="w-full relative">
                <img
                  src={imgSrc}
                  alt={`Page ${idx + 1}`}
                  loading={idx < 3 ? 'eager' : 'lazy'}
                  className="w-full h-auto block mx-auto"
                />
              </div>
            ))}

            {/* Mobile Bottom Chapter Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-t border-ink-800/80 px-4 py-3 sm:hidden">
              <div className="flex items-center justify-between gap-3">
                {prevChapter && (
                  <button
                    type="button"
                    onClick={() => handleGoToChapter(prevChapter)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-xs font-semibold text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="truncate max-[120px]">{prevChapter.name}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBackToManga}
                  className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-lg shadow-orange-600/30"
                >
                  Details
                </button>
                {nextChapter && (
                  <button
                    type="button"
                    onClick={() => handleGoToChapter(nextChapter)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-xs font-semibold text-white transition-all"
                  >
                    <span className="truncate max-[120px]">{nextChapter.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* End of Chapter Action Section (Desktop only) */}
            <div className="w-full py-12 px-6 mt-8 mb-20 rounded-3xl bg-surface-canvas border border-ink-800 text-center space-y-4 shadow-xl hidden sm:block">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">
                You finished {currentChapter?.name || 'this chapter'}!
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {prevChapter && (
                  <button
                    type="button"
                    onClick={() => handleGoToChapter(prevChapter)}
                    className="px-4 py-2.5 rounded-xl border border-ink-700 bg-ink-800 hover:bg-ink-700 text-xs font-semibold text-white transition-all"
                  >
                    &larr; {prevChapter.name}
                  </button>
                )}

                {nextChapter ? (
                  <button
                    type="button"
                    onClick={() => handleGoToChapter(nextChapter)}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Next Chapter ({nextChapter.name})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBackToManga}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all"
                  >
                    All Chapters Completed! Back to Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single Page Reader Mode */
          <div className={`mx-auto flex flex-col items-center ${widthClass}`}>
            <div className="w-full relative overflow-hidden bg-ink-950 min-h-[500px] flex items-center justify-center">
              <img
                src={pages[singlePageIndex]}
                alt={`Page ${singlePageIndex + 1}`}
                className="max-h-[80vh] w-auto mx-auto object-contain"
              />
            </div>

            {/* Single Page Navigation Controls */}
            <div className="w-full mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-surface-canvas border border-ink-800 rounded-2xl">
              <button
                type="button"
                disabled={singlePageIndex === 0 && !prevChapter}
                onClick={() => {
                  if (singlePageIndex > 0) {
                    setSinglePageIndex((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (prevChapter) {
                    handleGoToChapter(prevChapter);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="text-xs font-mono font-bold text-orange-400">
                Page {singlePageIndex + 1} of {pages.length}
              </div>

              <button
                type="button"
                disabled={singlePageIndex === pages.length - 1 && !nextChapter}
                onClick={() => {
                  if (singlePageIndex < pages.length - 1) {
                    setSinglePageIndex((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (nextChapter) {
                    handleGoToChapter(nextChapter);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md shadow-orange-600/20 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
