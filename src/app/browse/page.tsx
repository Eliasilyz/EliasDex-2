'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrowsePage } from '@/views/BrowsePage';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const genreParam = searchParams?.get('genre');
  const initialGenreIds = genreParam
    ? genreParam.split(',').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n))
    : [];
  return <BrowsePage initialGenreIds={initialGenreIds} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BrowsePageContent />
    </Suspense>
  );
}
