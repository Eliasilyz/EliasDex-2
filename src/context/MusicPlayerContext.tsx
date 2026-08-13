'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MusicTrack } from '../types';
import { searchThemeSong } from '../lib/music';

interface MusicPlayerContextType {
  currentTrack: MusicTrack | null;
  playlist: MusicTrack[];
  isPlaying: boolean;
  isLoading: boolean;
  isMinimized: boolean;
  showVideoModal: boolean;
  playbackMode: 'loop' | 'loop-one' | 'shuffle';
  playTrack: (track: MusicTrack, newPlaylist?: MusicTrack[]) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  closePlayer: () => void;
  toggleMinimize: () => void;
  setShowVideoModal: (show: boolean) => void;
  setPlaybackMode: (mode: 'loop' | 'loop-one' | 'shuffle') => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'loop' | 'loop-one' | 'shuffle'>('loop');

  const playTrack = useCallback(async (track: MusicTrack, newPlaylist?: MusicTrack[]) => {
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    } else if (playlist.length === 0 || !playlist.some((t) => t.id === track.id)) {
      setPlaylist([track]);
    }

    setIsLoading(true);
    setIsPlaying(true);
    setIsMinimized(false);

    // If track doesn't have embedUrl yet, search and resolve it
    if (!track.embedUrl) {
      try {
        const result = await searchThemeSong(track.query);
        const enrichedTrack: MusicTrack = {
          ...track,
          videoId: result.videoId,
          embedUrl: result.embedUrl,
          thumbnailUrl: result.thumbnailUrl || track.thumbnailUrl,
        };
        setCurrentTrack(enrichedTrack);
      } catch (err) {
        console.error('Error loading theme track:', err);
        setCurrentTrack({
          ...track,
          embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(track.query)}&autoplay=1`,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentTrack(track);
      setIsLoading(false);
    }
  }, [playlist]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    let nextIndex = 0;

    if (playbackMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * playlist.length);
      if (nextIndex === currentIndex && playlist.length > 1) {
        nextIndex = (currentIndex + 1) % playlist.length;
      }
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    const next = playlist[nextIndex];
    if (next) {
      playTrack(next);
    }
  }, [playlist, currentTrack, playbackMode, playTrack]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prev = playlist[prevIndex];
    if (prev) {
      playTrack(prev);
    }
  }, [playlist, currentTrack, playTrack]);

  const closePlayer = useCallback(() => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setShowVideoModal(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        isPlaying,
        isLoading,
        isMinimized,
        showVideoModal,
        playbackMode,
        playTrack,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        closePlayer,
        toggleMinimize,
        setShowVideoModal,
        setPlaybackMode,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
