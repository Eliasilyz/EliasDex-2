import type { Metadata } from 'next';
import { Anime, AnimeEpisode } from '@/types';

export const SITE_CONFIG = {
  name: 'EliasDex',
  shortName: 'EliasDex',
  description: 'Minimalist, modern, and fast anime browsing and streaming web application with high quality streams and multi-source API fallback.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://eliasdex.farelhanafi.my.id',
  ogImage: '/favicon.png',
  twitterHandle: '@EliasDexAnime',
};

export function constructMetadata({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  canonicalUrl,
}: {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'video.other';
  noIndex?: boolean;
  canonicalUrl?: string;
} = {}): Metadata {
  const metaTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const metaDescription = description || SITE_CONFIG.description;
  const metaImage = image || SITE_CONFIG.ogImage;
  const url = canonicalUrl ? `${SITE_CONFIG.url}${canonicalUrl}` : SITE_CONFIG.url;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: ['anime', 'streaming', 'watch anime', 'anime list', 'jikan', 'anilist', 'otakudesu', 'free anime'],
    applicationName: SITE_CONFIG.shortName,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: SITE_CONFIG.twitterHandle,
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: SITE_CONFIG.shortName,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'darkreader-lock': '',
    },
  };
}

export function generateAnimeJsonLd(anime: Anime) {
  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    '';

  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: anime.title,
    alternateName: anime.title_english || anime.title_japanese || undefined,
    description: anime.synopsis || SITE_CONFIG.description,
    image: imageUrl,
    genre: anime.genres ? anime.genres.map((g) => g.name) : [],
    aggregateRating: anime.score
      ? {
          '@type': 'AggregateRating',
          ratingValue: anime.score,
          bestRating: 10,
          worstRating: 0,
        }
      : undefined,
  };
}

export function generateEpisodeJsonLd(animeTitle: string, episodeNumber: number, synopsis?: string, imageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Episode',
    name: `Episode ${episodeNumber} — ${animeTitle}`,
    partOf: {
      '@type': 'TVSeries',
      name: animeTitle,
    },
    description: synopsis || `${animeTitle} Episode ${episodeNumber}`,
    image: imageUrl,
    episodeNumber,
  };
}

export function generateMangaJsonLd(manga: {
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  description?: string;
  imageUrl?: string;
  genres?: string[];
  chapters?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComicSeries',
    name: manga.title,
    alternateName: manga.titleEnglish || manga.titleJapanese || undefined,
    description: manga.description || `${manga.title} manga series`,
    image: manga.imageUrl || '',
    genre: manga.genres || [],
    numberOfChapters: manga.chapters,
  };
}

export function generateChapterJsonLd(mangaTitle: string, chapterNumber: number, volume?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: `Chapter ${chapterNumber} — ${mangaTitle}`,
    partOf: {
      '@type': 'ComicSeries',
      name: mangaTitle,
    },
    chapterNumber,
    volumeNumber: volume,
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
