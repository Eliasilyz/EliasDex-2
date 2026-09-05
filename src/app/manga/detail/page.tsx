'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mangaSlug } from '@/lib/mangaApi';

function MangaDetailRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url') || '';

  if (url) {
    // Redirect to clean slug URL
    router.replace(mangaSlug(url));
    return <div className="min-h-screen bg-surface-canvas" />;
  }

  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h2 className="text-xl font-bold text-white mb-2">No Manga Selected</h2>
        <p className="text-sm text-ink-400">Please select a manga from the manga catalog.</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-canvas" />}>
      <MangaDetailRedirect />
    </Suspense>
  );
}
