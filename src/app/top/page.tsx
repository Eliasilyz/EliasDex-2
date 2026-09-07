import { Metadata } from 'next';
import { Suspense } from 'react';
import { constructMetadata } from '@/lib/metadata';
import { TopAnimePage } from '@/views/TopAnimePage';

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { filter } = await searchParams;
  const filterLabel =
    filter === 'airing'
      ? 'Top Airing Anime'
      : filter === 'upcoming'
      ? 'Top Upcoming Anime'
      : filter === 'favorite'
      ? 'Most Favorited Anime'
      : 'Top Anime by Popularity';

  return constructMetadata({
    title: filterLabel,
    description: 'Discover the top-rated anime by popularity, airing, upcoming, and favorites. Stay updated with the best anime of the season.',
    type: 'website',
    canonicalUrl: '/top',
  });
}

export default async function Page({ searchParams }: Props) {
  const { filter } = await searchParams;
  const initialFilter = (filter as 'bypopularity' | 'airing' | 'upcoming' | 'favorite') || 'bypopularity';

  return (
    <Suspense fallback={null}>
      <TopAnimePage initialFilter={initialFilter} />
    </Suspense>
  );
}
