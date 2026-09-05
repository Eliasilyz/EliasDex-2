import type { SearchResult, LatestResult, Chapter, MangaDetail } from "./external/weebcentral";

export type { SearchResult, LatestResult, Chapter, MangaDetail };

/** Convert a WeebCentral series URL to a clean /manga/[...slug] path. */
export function mangaSlug(url: string): string {
  try {
    const u = new URL(url);
    // /series/01JGH4.../the-returners-road-to-retirement → 01JGH4.../the-returners-road-to-retirement
    const match = u.pathname.match(/\/series\/(.+)/);
    return match ? `/manga/${match[1]}` : `/manga/detail?url=${encodeURIComponent(url)}`;
  } catch {
    return `/manga/detail?url=${encodeURIComponent(url)}`;
  }
}

/** Convert a WeebCentral chapter URL + series URL to a clean /manga/read/[...path] URL. */
export function mangaReadUrl(chapterUrl: string, seriesUrl?: string): string {
  try {
    const u = new URL(chapterUrl);
    // /chapters/01JGH4.../chapter-97 → /manga/read/01JGH4.../chapter-97
    const match = u.pathname.match(/\/chapters\/(.+)/);
    if (!match) return `/manga/read?url=${encodeURIComponent(chapterUrl)}`;

    let qs = '';
    if (seriesUrl) {
      try {
        const s = new URL(seriesUrl);
        // Extract series slug: /series/{id}/{title-slug}
        const seriesMatch = s.pathname.match(/\/series\/[^/]+\/(.+)/);
        if (seriesMatch) qs = `?series=${seriesMatch[1]}`;
      } catch { /* ignore */ }
    }

    return `/manga/read/${match[1]}${qs}`;
  } catch {
    return `/manga/read?url=${encodeURIComponent(chapterUrl)}`;
  }
}

export interface MangaDetailWithChapters extends MangaDetail {
  chapters: Chapter[];
}

export interface MangaHistoryEntry {
  seriesUrl: string;
  title: string;
  cover: string;
  lastChapterName: string;
  lastChapterUrl: string;
  lastPage?: number;
  totalPages?: number;
  updatedAt: number;
}

const STORAGE_KEY = "eliasdex_manga_history";

export async function fetchLatestManga(page: number = 1): Promise<{ data: LatestResult[]; page: number; hasMore: boolean }> {
  const res = await fetch(`/api/manga/latest?page=${page}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch latest manga" }));
    throw new Error(err.error || `Error ${res.status}: Failed to fetch latest manga`);
  }
  return res.json();
}

export async function searchManga(query: string, page: number = 1): Promise<{ data: SearchResult[] }> {
  if (!query.trim()) return { data: [] };
  const res = await fetch(`/api/manga/search?q=${encodeURIComponent(query.trim())}&page=${page}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to search manga" }));
    throw new Error(err.error || `Error ${res.status}: Failed to search manga`);
  }
  return res.json();
}

export async function fetchMangaDetail(url: string): Promise<MangaDetailWithChapters> {
  const res = await fetch(`/api/manga/detail?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch manga detail" }));
    throw new Error(err.error || `Error ${res.status}: Failed to fetch manga detail`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchChapterPages(chapterUrl: string): Promise<string[]> {
  const res = await fetch(`/api/manga/chapter?url=${encodeURIComponent(chapterUrl)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch chapter pages" }));
    throw new Error(err.error || `Error ${res.status}: Failed to fetch chapter pages`);
  }
  const json = await res.json();
  return json.pages || [];
}

/* ----------------- Reading History & Progress Storage ----------------- */

export function getMangaHistory(): MangaHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getMangaProgress(seriesUrl: string): MangaHistoryEntry | null {
  const history = getMangaHistory();
  return history.find((item) => item.seriesUrl === seriesUrl) || null;
}

export function saveMangaProgress(entry: MangaHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getMangaHistory();
    const existingIndex = history.findIndex((item) => item.seriesUrl === entry.seriesUrl);
    
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...entry, updatedAt: Date.now() };
    } else {
      history.unshift({ ...entry, updatedAt: Date.now() });
    }

    // Keep max 50 items in history
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Failed to save manga progress:", err);
  }
}

export function removeMangaHistory(seriesUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getMangaHistory();
    const updated = history.filter((item) => item.seriesUrl !== seriesUrl);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to remove manga history:", err);
  }
}
