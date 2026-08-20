'use client';

import { useEffect } from 'react';
import { initJQueryEffects } from '@/lib/jquery-effects';

export const JQueryEffectsProvider: React.FC = () => {
  useEffect(() => {
    initJQueryEffects();
  }, []);

  return null;
};
