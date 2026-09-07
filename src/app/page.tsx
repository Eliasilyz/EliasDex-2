import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { HomePage } from '@/views/HomePage';

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: 'EliasDex — Anime Streaming & Discovery',
    description: 'Watch anime online in high quality with multiple streaming sources. Browse, discover, and track your favorite anime series.',
    type: 'website',
    canonicalUrl: '/',
  });
}

export default function Page() {
  return <HomePage />;
}
