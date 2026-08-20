'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Anime } from '../types';

export type TitleLanguage = 'en' | 'jp';

interface TitleLanguageContextType {
  titleLanguage: TitleLanguage;
  setTitleLanguage: (lang: TitleLanguage) => void;
  toggleTitleLanguage: () => void;
  /**
   * Get formatted primary title according to current titleLanguage setting:
   * - 'en': Prefers anime.title_english -> anime.title -> anime.title_japanese
   * - 'jp': Prefers anime.title (Romaji) -> anime.title_japanese (Kanji/Kana) -> anime.title_english
   */
  getTitle: (anime: Partial<Anime> | null | undefined) => string;
  /**
   * Get secondary title (opposite language) for subtitle or badge display
   */
  getSecondaryTitle: (anime: Partial<Anime> | null | undefined) => string | null;
  /**
   * Get native Japanese title (Kanji/Kana) if available
   */
  getNativeJapaneseTitle: (anime: Partial<Anime> | null | undefined) => string | null;
}

const TitleLanguageContext = createContext<TitleLanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'animestream_title_language';

export const TitleLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [titleLanguage, setTitleLanguageState] = useState<TitleLanguage>('en');

  // Load saved language on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'jp') {
        setTitleLanguageState(saved);
      }
    } catch {}
  }, []);

  const setTitleLanguage = useCallback((lang: TitleLanguage) => {
    setTitleLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  const toggleTitleLanguage = useCallback(() => {
    setTitleLanguageState((prev) => {
      const next = prev === 'en' ? 'jp' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const getTitle = useCallback(
    (anime: Partial<Anime> | null | undefined): string => {
      if (!anime) return '';
      if (titleLanguage === 'en') {
        return (
          anime.title_english?.trim() ||
          anime.title?.trim() ||
          anime.title_japanese?.trim() ||
          'Untitled'
        );
      }
      // 'jp' mode: Japanese Romaji title (anime.title) or Native Kanji (anime.title_japanese)
      return (
        anime.title?.trim() ||
        anime.title_japanese?.trim() ||
        anime.title_english?.trim() ||
        'Untitled'
      );
    },
    [titleLanguage]
  );

  const getSecondaryTitle = useCallback(
    (anime: Partial<Anime> | null | undefined): string | null => {
      if (!anime) return null;
      const primary = getTitle(anime);

      if (titleLanguage === 'en') {
        // In EN mode, secondary is the Romaji (anime.title) or Japanese kanji
        const romaji = anime.title?.trim();
        const japanese = anime.title_japanese?.trim();
        if (romaji && romaji !== primary) return romaji;
        if (japanese && japanese !== primary) return japanese;
        return null;
      }

      // In JP mode, secondary is the English title (anime.title_english) or Kanji
      const english = anime.title_english?.trim();
      const japanese = anime.title_japanese?.trim();
      if (english && english !== primary) return english;
      if (japanese && japanese !== primary) return japanese;
      return null;
    },
    [titleLanguage, getTitle]
  );

  const getNativeJapaneseTitle = useCallback(
    (anime: Partial<Anime> | null | undefined): string | null => {
      if (!anime || !anime.title_japanese) return null;
      return anime.title_japanese.trim();
    },
    []
  );

  return (
    <TitleLanguageContext.Provider
      value={{
        titleLanguage,
        setTitleLanguage,
        toggleTitleLanguage,
        getTitle,
        getSecondaryTitle,
        getNativeJapaneseTitle,
      }}
    >
      {children}
    </TitleLanguageContext.Provider>
  );
};

export const useTitleLanguage = () => {
  const context = useContext(TitleLanguageContext);
  if (!context) {
    throw new Error('useTitleLanguage must be used within a TitleLanguageProvider');
  }
  return context;
};
