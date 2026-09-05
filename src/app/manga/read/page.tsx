'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mangaReadUrl } from '@/lib/mangaApi';

function MangaReaderRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url') || '';
  const mangaUrl = searchParams.get('mangaUrl') || undefined;

  if (url) {
    router.replace(mangaReadUrl(url, mangaUrl));
    return <div className="min-h-screen bg-ink-950" />;
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-md">
        <h2 className="text-xl font-bold mb-2">No Chapter Selected</h2>
        <p className="text-sm text-ink-400">Please select a chapter to start reading.</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
      <MangaReaderRedirect />
    </Suspense>
  );
}
