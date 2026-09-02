import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppShell } from '@/components/layout/AppShell';
import { constructMetadata } from '@/lib/metadata';
import { DbStatusBanner } from '@/components/DbStatusBanner';
import { AnnouncementBanner } from '@/components/announcement/AnnouncementBanner';
import { GlobalChatWidget } from '@/components/chat/GlobalChatWidget';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = constructMetadata();


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body
        lang="en"
        className={`${plusJakartaSans.variable} ${outfit.variable}`}
        suppressHydrationWarning
      >
        <div className="tech-grid-background" aria-hidden="true" />
        <AppProviders>
          <AppShell>{children}</AppShell>
          <AnnouncementBanner />
          <GlobalChatWidget />
        </AppProviders>
        <DbStatusBanner />
      </body>
    </html>
  );
}