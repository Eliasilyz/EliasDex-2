'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAppNavigate() {
  const router = useRouter();

  return useCallback(
    (path: string) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      router.push(normalized);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [router],
  );
}
