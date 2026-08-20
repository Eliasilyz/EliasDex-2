import type { Metadata } from 'next';
import { Anime } from '@/types';

export const SITE_CONFIG = {
  name: 'EliasDex AnimeStream',
  shortName: 'EliasDex',
  description: 'Minimalist, modern, and fast anime browsing and streaming web application with high quality streams and multi-source API fallback.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://eliasdex.vercel.app',
  ogImage: '/og-default.jpg',
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
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/icons/icon-192x192.png',
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
