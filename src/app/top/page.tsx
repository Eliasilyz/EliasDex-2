'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TopAnimePage } from '@/views/TopAnimePage';

function TopAnimePageContent() {
  const searchParams = useSearchParams();
  const filter = (searchParams?.get('filter') as 'bypopularity' | 'airing' | 'upcoming' | 'favorite') || 'bypopularity';
  return <TopAnimePage initialFilter={filter} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TopAnimePageContent />
    </Suspense>
  );
}
