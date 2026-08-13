'use client';

import { use, Suspense } from 'react';
import { WatchPage } from '@/views/WatchPage';

type PageProps = {
  params: Promise<{ malId: string; ep: string }>;
};

function WatchPageContent({ params }: PageProps) {
  const { malId, ep } = use(params);
  const id = parseInt(malId, 10);
  const epNum = parseInt(ep, 10) || 1;

  if (Number.isNaN(id)) {
    return null;
  }

  return <WatchPage malId={id} epNum={epNum} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <WatchPageContent params={params} />
    </Suspense>
  );
}
