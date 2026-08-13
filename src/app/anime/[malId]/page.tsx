'use client';

import { use } from 'react';
import { AnimeDetailPage } from '@/views/AnimeDetailPage';

type PageProps = {
  params: Promise<{ malId: string }>;
};

export default function Page({ params }: PageProps) {
  const { malId } = use(params);
  const id = parseInt(malId, 10);

  if (Number.isNaN(id)) {
    return null;
  }

  return <AnimeDetailPage malId={id} />;
}
