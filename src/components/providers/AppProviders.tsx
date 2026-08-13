'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { WatchProvider } from '@/context/WatchContext';
import { MusicPlayerProvider } from '@/context/MusicPlayerContext';
import { TitleLanguageProvider } from '@/context/TitleLanguageContext';
import { DataSourceProvider } from '@/context/DataSourceContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TitleLanguageProvider>
        <DataSourceProvider>
          <WatchProvider>
            <MusicPlayerProvider>{children}</MusicPlayerProvider>
          </WatchProvider>
        </DataSourceProvider>
      </TitleLanguageProvider>
    </ThemeProvider>
  );
}
