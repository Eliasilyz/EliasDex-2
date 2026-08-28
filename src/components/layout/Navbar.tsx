'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Play, Flame, Calendar, Compass, Bookmark, History, Menu, X, Sparkles, User as UserIcon } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { TitleLanguageToggle } from '../ui/TitleLanguageToggle';
import { DataSourceSelector } from '../ui/DataSourceSelector';
import { LevelBadge } from '../ui/LevelBadge';
import { ShadcnButton } from '../ui/shadcn/button';
import { useWatch } from '../../context/WatchContext';
import { useAppNavigate } from '@/lib/useNavigate';

// Komponen pembantu untuk mencegah hidrasi mismatch
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { watchlist, history } = useWatch();
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentPath = pathname || '/';
  const onNavigate = useAppNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Sparkles },
    { label: 'Top Anime', path: '/top', icon: Flame },
    { label: 'Schedule', path: '/schedule', icon: Calendar },
    { label: 'Browse', path: '/browse', icon: Compass },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark, count: mounted ? watchlist.length : 0 },
    { label: 'History', path: '/history', icon: History, count: mounted ? history.length : 0 },
  ];


  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath === '')) return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>

        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            type="button"
            id="nav-logo"
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 group cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Anime<span className="text-orange-400">Stream</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" suppressHydrationWarning>
            {navLinks.map((link) => {

              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleNav(link.path)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-orange-600/30 text-orange-300"
                      suppressHydrationWarning
                    >
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 max-w-xs md:max-w-md justify-end">
            <div className="w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px]">
              <SearchBar compact onSearchSubmit={(q) => handleNav(`/search?q=${encodeURIComponent(q)}`)} />
            </div>

            {/* Data Source Selector (AniList GraphQL / Jikan MAL / Auto) */}
            <div className="shrink-0 hidden xs:block" suppressHydrationWarning>
              <ClientOnly>
                <DataSourceSelector compact />
              </ClientOnly>
            </div>

            {/* Title Language Switcher (EN / JP) */}
            <div className="shrink-0" suppressHydrationWarning>
              <ClientOnly>
                <TitleLanguageToggle />
              </ClientOnly>
            </div>

            <div suppressHydrationWarning>
              <ClientOnly>
                <ThemeToggle />
              </ClientOnly>
            </div>

            {/* User Account / Profile */}
            <div className="shrink-0" suppressHydrationWarning>
              <ClientOnly>
                {session?.user ? (
                  <button
                    type="button"
                    id="nav-profile-btn"
                    onClick={() => handleNav('/profile')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer group"
                    aria-label="Go to profile"
                  >
                    {session.user.avatarUrl ? (
                      <img
                        src={session.user.avatarUrl}
                        alt={session.user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                    )}
                    <LevelBadge level={session.user.level || 0} size="sm" />
                  </button>
                ) : (
                  <ShadcnButton
                    id="nav-signin-btn"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNav('/login')}
                    className="h-8 px-3 text-xs"
                  >
                    Sign In
                  </ShadcnButton>
                )}
              </ClientOnly>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden transition-colors"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-850 pb-3 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-zinc-400 font-medium">Data Source:</span>
              <ClientOnly>
                <DataSourceSelector compact />
              </ClientOnly>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-zinc-400 font-medium">Title Lang:</span>
              <ClientOnly>
                <TitleLanguageToggle />
              </ClientOnly>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNav(link.path)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-orange-600/15 text-orange-400 border border-orange-500/20'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-orange-400" />
                    <span>{link.label}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300"
                      suppressHydrationWarning
                    >
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};