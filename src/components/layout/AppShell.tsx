'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalMusicPlayer } from '@/components/music/GlobalMusicPlayer';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-orange-600 selection:text-white pb-12">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">{children}</main>
      <Footer />
      <GlobalMusicPlayer />
    </div>
  );
}
