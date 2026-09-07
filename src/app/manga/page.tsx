import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { MangaPage } from '@/views/MangaPage';

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: 'Read Manga Online',
    description: 'Browse and read manga chapters online for free. Discover popular manga series with high-quality scans and fast updates.',
    type: 'website',
    canonicalUrl: '/manga',
  });
}

export default function Page() {
  return <MangaPage />;
}
