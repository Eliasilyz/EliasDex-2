import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { SchedulePage } from '@/views/SchedulePage';

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: 'Anime Release Schedule',
    description: 'Weekly anime airing schedule. Never miss a new episode of your favorite anime series. Updated in real-time.',
    type: 'website',
    canonicalUrl: '/schedule',
  });
}

export default function Page() {
  return <SchedulePage />;
}
