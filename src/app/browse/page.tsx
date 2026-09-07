import { Metadata } from 'next';
import { Suspense } from 'react';
import { constructMetadata } from '@/lib/metadata';
import { BrowsePage } from '@/views/BrowsePage';

type Props = {
  searchParams: Promise<{ genre?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { genre } = await searchParams;
  const title = genre ? `Browse Anime — Genre: ${genre}` : 'Browse Anime';

  return constructMetadata({
    title,
    description: 'Browse and discover the latest anime series. Filter by genre, status, and season. High-quality streaming with multiple sources.',
    type: 'website',
    canonicalUrl: '/browse',
  });
}

export default async function Page({ searchParams }: Props) {
  const { genre } = await searchParams;
  const initialGenreIds = genre
    ? genre
        .split(',')
        .map((s) => parseInt(s, 10))
        .filter((n) => !Number.isNaN(n))
    : [];

  return (
    <Suspense fallback={null}>
      <BrowsePage initialGenreIds={initialGenreIds} />
    </Suspense>
  );
}
