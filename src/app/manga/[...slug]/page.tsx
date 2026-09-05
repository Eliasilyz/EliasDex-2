'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { MangaDetailPage } from '@/views/MangaDetailPage';

const WEEBCENTRAL_BASE = 'https://weebcentral.com/series';

function MangaDetailContent() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];

  if (slug.length === 0) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">No Manga Selected</h2>
          <p className="text-sm text-ink-400">Please select a manga from the manga catalog.</p>
        </div>
      </div>
    );
  }

  const seriesUrl = `${WEEBCENTRAL_BASE}/${slug.join('/')}`;

  return <MangaDetailPage seriesUrl={seriesUrl} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-canvas" />}>
      <MangaDetailContent />
    </Suspense>
  );
}
