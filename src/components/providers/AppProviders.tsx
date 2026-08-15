'use client';

import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { WatchProvider } from '@/context/WatchContext';
import { MusicPlayerProvider } from '@/context/MusicPlayerContext';
import { TitleLanguageProvider } from '@/context/TitleLanguageContext';
import { DataSourceProvider } from '@/context/DataSourceContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ThemeProvider>
        <TitleLanguageProvider>
          <DataSourceProvider>
            <WatchProvider>
              <MusicPlayerProvider>{children}</MusicPlayerProvider>
            </WatchProvider>
          </DataSourceProvider>
        </TitleLanguageProvider>
      </ThemeProvider>
    </SmoothScrollProvider>
  );
}

