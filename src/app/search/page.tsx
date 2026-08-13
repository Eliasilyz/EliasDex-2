'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchPage } from '@/views/SearchPage';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') || '';
  return <SearchPage initialQuery={q} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
