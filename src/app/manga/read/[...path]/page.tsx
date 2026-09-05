'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MangaReaderPage } from '@/views/MangaReaderPage';

const WEEBCENTRAL_BASE = 'https://weebcentral.com';

function MangaReaderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const path = (params.path as string[]) || [];
  const seriesSlug = searchParams.get('series') || '';

  if (path.length === 0) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md">
          <h2 className="text-xl font-bold mb-2">No Chapter Selected</h2>
          <p className="text-sm text-ink-400">Please select a chapter to start reading.</p>
        </div>
      </div>
    );
  }

  // Reconstruct chapter URL: /chapters/{chapterId}/{chapterSlug}
  const chapterUrl = `${WEEBCENTRAL_BASE}/chapters/${path.join('/')}`;

  // Reconstruct manga URL from series query param
  const mangaUrl = seriesSlug
    ? `${WEEBCENTRAL_BASE}/series/${path[0]}/${seriesSlug}`
    : undefined;

  return <MangaReaderPage chapterUrl={chapterUrl} mangaUrl={mangaUrl} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
      <MangaReaderContent />
    </Suspense>
  );
}
