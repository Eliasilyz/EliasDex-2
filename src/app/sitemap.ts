import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';
import { FALLBACK_ANIME_LIST } from '@/lib/fallbackData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/top`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/manga`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic high-priority anime routes
  const animeRoutes: MetadataRoute.Sitemap = FALLBACK_ANIME_LIST.map((anime) => ({
    url: `${baseUrl}/anime/${anime.mal_id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic top episode routes
  const episodeRoutes: MetadataRoute.Sitemap = FALLBACK_ANIME_LIST.slice(0, 10).map((anime) => ({
    url: `${baseUrl}/watch/${anime.mal_id}/1`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...animeRoutes, ...episodeRoutes];
}
