'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WatchProgress, WatchlistItem, WatchlistStatus, Anime } from '../types';

interface WatchContextType {
  history: WatchProgress[];
  watchlist: WatchlistItem[];
  recordWatchProgress: (data: {
    malId: number;
    title: string;
    image: string;
    episodeNumber: number;
    totalEpisodes?: number | null;
    language?: 'sub' | 'dub';
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

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const recordWatchProgress = (data: {
    malId: number;
    title: string;
    image: string;
    episodeNumber: number;
    totalEpisodes?: number | null;
    language?: 'sub' | 'dub';
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
  };

  const getWatchProgress = (malId: number) => {
    return history.find((item) => item.malId === malId);
  };

  const setWatchlistStatus = (anime: Anime, status: WatchlistStatus | 'remove') => {
    if (status === 'remove') {
      removeFromWatchlist(anime.mal_id);
      return;
    }

    setWatchlist((prev) => {
      const existing = prev.find((item) => item.malId === anime.mal_id);
      const imageUrl =
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        '';

      if (existing) {
        return prev.map((item) =>
          item.malId === anime.mal_id
            ? { ...item, status, updatedAt: Date.now() }
            : item
        );
      } else {
        const newItem: WatchlistItem = {
          malId: anime.mal_id,
          title: anime.title_english || anime.title,
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
  };

  const getWatchlistStatus = (malId: number): WatchlistStatus | null => {
    const item = watchlist.find((w) => w.malId === malId);
    return item ? item.status : null;
  };

  const removeFromWatchlist = (malId: number) => {
    setWatchlist((prev) => prev.filter((item) => item.malId !== malId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (malId: number) => {
    setHistory((prev) => prev.filter((item) => item.malId !== malId));
  };

  return (
    <WatchContext.Provider
      value={{
        history,
        watchlist,
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
