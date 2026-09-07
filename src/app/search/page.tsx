import { Metadata } from 'next';
import { Suspense } from 'react';
import { constructMetadata } from '@/lib/metadata';
import { SearchPage } from '@/views/SearchPage';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  if (query) {
    return constructMetadata({
      title: `Search: "${query}"`,
      description: `Search results for "${query}" on EliasDex. Watch and discover anime.`,
      type: 'website',
      canonicalUrl: `/search?q=${encodeURIComponent(query)}`,
    });
  }

  return constructMetadata({
    title: 'Search Anime',
    description: 'Search anime by title, genres, studios, and more. Find where to stream your favorite anime series.',
    type: 'website',
    canonicalUrl: '/search',
  });
}

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <Suspense fallback={null}>
      <SearchPage initialQuery={q || ''} />
    </Suspense>
  );
}
