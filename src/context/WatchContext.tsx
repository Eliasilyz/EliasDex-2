'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { WatchProgress, WatchlistItem, WatchlistStatus, Anime } from '../types';
import type { WatchHistoryEntry, Favorite } from '@/types/models';
import { toast } from '@/components/ui/shadcn/use-toast';

interface WatchContextType {
  history: WatchProgress[];
  watchlist: WatchlistItem[];
  userXp: number;
  userLevel: number;
  isSyncing: boolean;
  recordWatchProgress: (data: {
    malId: number;
    title: string;
    image: string;
    episodeNumber: number;
    totalEpisodes?: number | null;
    language?: 'sub' | 'dub';
    completed?: boolean;
  }) => void;
  getWatchProgress: (malId: number) => WatchProgress | undefined;
  setWatchlistStatus: (anime: Anime, status: WatchlistStatus | 'remove') => void;
  getWatchlistStatus: (malId: number) => WatchlistStatus | null;
  removeFromWatchlist: (malId: number) => void;
  clearHistory: () => void;
  removeFromHistory: (malId: number) => void;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'animestream_watch_history';
const WATCHLIST_STORAGE_KEY = 'animestream_watchlist';

function mapServerHistory(entry: WatchHistoryEntry): WatchProgress {
  const ts =
    entry.lastWatchedAt instanceof Date
      ? entry.lastWatchedAt.getTime()
      : new Date(entry.lastWatchedAt as unknown as string).getTime() || Date.now();
  return {
    malId: entry.animeId,
    title: entry.animeTitle,
    image: entry.animeCoverImageUrl,
    episodeNumber: entry.episodeNumber,
    language: 'sub',
    timestamp: ts,
  };
}

function mapServerFavorite(fav: Favorite): WatchlistItem {
  const ts =
    fav.addedAt instanceof Date
      ? fav.addedAt.getTime()
      : new Date(fav.addedAt as unknown as string).getTime() || Date.now();
  return {
    malId: fav.animeId,
    title: fav.animeTitle,
    image: fav.animeCoverImageUrl,
    status: fav.status,
    updatedAt: ts,
  };
}

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id || null;

  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const historyRef = useRef(history);
  historyRef.current = history;
  const watchlistRef = useRef(watchlist);
  watchlistRef.current = watchlist;
  const syncedUserIdRef = useRef<string | null>(null);
  const userLevelRef = useRef(userLevel);
  userLevelRef.current = userLevel;

  // Load initial data from localStorage on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist history
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save watch history to localStorage', e);
    }
  }, [history, isLoaded]);

  // Persist watchlist
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist, isLoaded]);

  // When a user logs in, push local data to the server (so nothing is lost)
  // then adopt the server data as the source of truth.
  useEffect(() => {
    if (!sessionUserId) {
      syncedUserIdRef.current = null;
      return;
    }
    if (syncedUserIdRef.current === sessionUserId) return;
    syncedUserIdRef.current = sessionUserId;

    let cancelled = false;

    (async () => {
      setIsSyncing(true);
      try {
        setUserLevel(session?.user?.level || 0);

        const headers = { 'Content-Type': 'application/json' };

        await Promise.allSettled(
          historyRef.current.map((h) =>
            fetch('/api/watch-progress', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                malId: h.malId,
                episodeNumber: h.episodeNumber,
                animeTitle: h.title,
                animeCoverImageUrl: h.image,
                completed: false,
              }),
            })
          )
        );

        await Promise.allSettled(
          watchlistRef.current.map((w) =>
            fetch('/api/favorites', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                animeId: w.malId,
                animeTitle: w.title,
                animeCoverImageUrl: w.image,
                status: w.status,
              }),
            })
          )
        );

        const [hRes, fRes] = await Promise.all([
          fetch('/api/watch-progress'),
          fetch('/api/favorites'),
        ]);

        if (cancelled) return;

        if (hRes.ok) {
          const hData = await hRes.json();
          const mapped = (hData.history || []).map(mapServerHistory);
          setHistory(mapped);
        }
        if (fRes.ok) {
          const fData = await fRes.json();
          const mapped = (fData.favorites || []).map(mapServerFavorite);
          setWatchlist(mapped);
        }
      } catch (e) {
        console.warn('Failed to sync with account', e);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionUserId, session?.user?.level]);

  const recordWatchProgress = useCallback(
    (data: {
      malId: number;
      title: string;
      image: string;
      episodeNumber: number;
      totalEpisodes?: number | null;
      language?: 'sub' | 'dub';
      completed?: boolean;
    }) => {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.malId !== data.malId);
        const newEntry: WatchProgress = {
          malId: data.malId,
          title: data.title,
          image: data.image,
          episodeNumber: data.episodeNumber,
          totalEpisodes: data.totalEpisodes,
          timestamp: Date.now(),
          language: data.language || 'sub',
        };
        return [newEntry, ...filtered].slice(0, 50); // keep up to 50 items
      });

      // Also update lastWatchedEpisode in watchlist if present
      setWatchlist((prev) =>
        prev.map((item) =>
          item.malId === data.malId
            ? { ...item, lastWatchedEpisode: data.episodeNumber, updatedAt: Date.now() }
            : item
        )
      );

      if (sessionUserId) {
        fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            malId: data.malId,
            episodeNumber: data.episodeNumber,
            animeTitle: data.title,
            animeCoverImageUrl: data.image,
            completed: !!data.completed,
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => {
            if (!res) return;
            if (typeof res.userLevel === 'number') {
              setUserLevel(res.userLevel);
              if (typeof res.userXp === 'number') setUserXp(res.userXp);
            }
            if (res.xpAwarded) {
              const leveledUp = typeof res.userLevel === 'number' && res.userLevel > userLevelRef.current;
              toast({
                title: leveledUp ? `Level Up! → ${res.userLevel}` : 'XP Earned',
                description: res.xpMessage,
              });
            }
          })
          .catch(() => {});
      }
    },
    [sessionUserId]
  );

  const getWatchProgress = (malId: number) => {
    return history.find((item) => item.malId === malId);
  };

  const removeFromWatchlist = useCallback(
    (malId: number) => {
      setWatchlist((prev) => prev.filter((item) => item.malId !== malId));
      if (sessionUserId) {
        fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animeId: malId }),
        }).catch(() => {});
      }
    },
    [sessionUserId]
  );

  const setWatchlistStatus = useCallback(
    (anime: Anime, status: WatchlistStatus | 'remove') => {
      if (status === 'remove') {
        removeFromWatchlist(anime.mal_id);
        return;
      }

      const imageUrl =
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        '';

      const displayTitle = anime.title_english || anime.title;

      setWatchlist((prev) => {
        const existing = prev.find((item) => item.malId === anime.mal_id);
        if (existing) {
          return prev.map((item) =>
            item.malId === anime.mal_id
              ? { ...item, status, updatedAt: Date.now() }
              : item
          );
        } else {
          const newItem: WatchlistItem = {
            malId: anime.mal_id,
            title: displayTitle,
            image: imageUrl,
            score: anime.score,
            type: anime.type,
            status,
            totalEpisodes: anime.episodes,
            updatedAt: Date.now(),
          };
          return [newItem, ...prev];
        }
      });

      if (sessionUserId) {
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            animeId: anime.mal_id,
            animeTitle: displayTitle,
            animeCoverImageUrl: imageUrl,
            status,
          }),
        }).catch(() => {});
      }
    },
    [sessionUserId, removeFromWatchlist]
  );

  const getWatchlistStatus = (malId: number): WatchlistStatus | null => {
    const item = watchlist.find((w) => w.malId === malId);
    return item ? item.status : null;
  };

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (sessionUserId) {
      fetch('/api/watch-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      }).catch(() => {});
    }
  }, [sessionUserId]);

  const removeFromHistory = useCallback(
    (malId: number) => {
      setHistory((prev) => prev.filter((item) => item.malId !== malId));
      if (sessionUserId) {
        fetch('/api/watch-progress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animeId: malId }),
        }).catch(() => {});
      }
    },
    [sessionUserId]
  );

  return (
    <WatchContext.Provider
      value={{
        history,
        watchlist,
        userXp,
        userLevel,
        isSyncing,
        recordWatchProgress,
        getWatchProgress,
        setWatchlistStatus,
        getWatchlistStatus,
        removeFromWatchlist,
        clearHistory,
        removeFromHistory,
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export function useWatch() {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
}
