'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrowsePage } from '@/views/BrowsePage';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const genreParam = searchParams?.get('genre');
  const initialGenreId = genreParam ? parseInt(genreParam, 10) : null;
  return <BrowsePage initialGenreId={Number.isNaN(initialGenreId) ? null : initialGenreId} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BrowsePageContent />
    </Suspense>
  );
}
