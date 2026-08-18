'use client';

import '@/lib/polyfills';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { WatchProvider } from '@/context/WatchContext';
import { MusicPlayerProvider } from '@/context/MusicPlayerContext';
import { TitleLanguageProvider } from '@/context/TitleLanguageContext';
import { DataSourceProvider } from '@/context/DataSourceContext';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { JQueryEffectsProvider } from '@/components/common/JQueryEffectsProvider';
import { Toaster } from '@/components/ui/shadcn/toaster';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ThemeProvider>
        <TitleLanguageProvider>
          <DataSourceProvider>
            <WatchProvider>
              <MusicPlayerProvider>
                <PWAInstaller />
                <JQueryEffectsProvider />
                {children}
                <PWAInstallBanner />
                <Toaster />
              </MusicPlayerProvider>
            </WatchProvider>
          </DataSourceProvider>
        </TitleLanguageProvider>
      </ThemeProvider>
    </SmoothScrollProvider>
  );
}


