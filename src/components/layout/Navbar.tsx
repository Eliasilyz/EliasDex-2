'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Play, Flame, Calendar, Compass, Bookmark, History, Menu, X, Sparkles, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const { watchlist, history, userLevel } = useWatch();
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentPath = pathname || '/';
  const onNavigate = useAppNavigate();

  useEffect(() => {
   setMounted(true);
  }, []);

  useEffect(() => {
   const handleClickOutside = (e: MouseEvent) => {
     if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
       setSettingsOpen(false);
     }
   };
   const handleEsc = (e: KeyboardEvent) => {
     if (e.key === 'Escape') setSettingsOpen(false);
   };
   if (settingsOpen) {
     document.addEventListener('mousedown', handleClickOutside);
     document.addEventListener('keydown', handleEsc);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
       document.removeEventListener('keydown', handleEsc);
     };
   }
  }, [settingsOpen]);

  const handleNav = (path: string) => {
   setMobileMenuOpen(false);
   setSettingsOpen(false);
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
  <header className="sticky top-0 z-40 w-full border-b border-ink-700/80 bg-surface-canvas/80 backdrop-blur-xl transition-all" suppressHydrationWarning>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>

    <div className="flex items-center justify-between h-16 gap-4">
     {/* Logo */}
     <button
      type="button"
      id="nav-logo"
      onClick={() => handleNav('/')}
      className="flex items-center gap-2.5 group cursor-pointer shrink-0"
     >
      <div className="w-9 h-9 rounded-xl bg-orange-700 flex items-center justify-center shadow-lg  transition-transform">
       <Play className="w-4 h-4 text-white fill-white ml-0.5" />
      </div>
      <div className="flex flex-col text-left">
       <span className="font-heading font-extrabold text-lg tracking-tight text-surface-primary flex items-center gap-1">
        Anime<span className="text-orange-400">Stream</span>
       </span>
      </div>
     </button>

      {/* Desktop Navigation — primary links only, tidy */}
      <nav className="hidden lg:flex items-center gap-1" suppressHydrationWarning>
       {navLinks.filter(l => l.label !== 'Home').map((link) => {
        const Icon = link.icon;
        const active = isActive(link.path);
        return (
         <button
          key={link.path}
          id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          type="button"
          onClick={() => handleNav(link.path)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
           active
            ? 'text-surface-primary bg-ink-700/90 shadow-sm'
            : 'text-ink-500 hover:text-ink-300 hover:bg-white/[0.06]'
          }`}
         >
          <Icon className={`w-3.5 h-3.5 ${active ? 'text-orange-400' : 'text-ink-500'}`} />
          <span>{link.label}</span>
          {link.count !== undefined && link.count > 0 && (
           <span
            className="ml-0.5 min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-mono bg-orange-600/20 text-orange-300 border border-orange-500/20 inline-flex items-center justify-center"
            suppressHydrationWarning
           >
            {link.count}
           </span>
          )}
         </button>
        );
       })}
      </nav>

      {/* Search & Actions — roomy */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[180px] max-w-[380px] lg:max-w-[460px] justify-end">
       <div className="flex-1 min-w-0">
        <SearchBar
          compact
          onSearchSubmit={(q) => handleNav(`/search?q=${encodeURIComponent(q)}`)}
          onSelectAnime={(malId) => handleNav(`/anime/${malId}`)}
        />
       </div>

       {/* Settings — grouped (Data Source, Title Language, Theme) */}
       <div ref={settingsRef} className="relative shrink-0" suppressHydrationWarning>
        <button
         id="nav-settings-btn"
         type="button"
         onClick={() => setSettingsOpen(o => !o)}
         aria-expanded={settingsOpen}
         aria-haspopup="menu"
         className={`p-2 rounded-xl border transition-colors ${settingsOpen ? 'bg-ink-700 border-ink-500 text-white' : 'border-transparent text-ink-500 hover:text-white hover:bg-white/[0.06]'}`}
         aria-label="Open settings"
        >
         <Settings className="w-4 h-4" />
        </button>
        {settingsOpen && (
         <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-surface-canvas/95 backdrop-blur-xl border border-ink-700 shadow-2xl p-3 space-y-3 z-50"
         >
          <div className="space-y-1.5">
           <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-300">Data Source</span>
            <span className="text-xs text-ink-500 font-mono">API</span>
           </div>
           <ClientOnly><DataSourceSelector layout="list" /></ClientOnly>
          </div>
          <div className="h-px bg-ink-700/60" />
          <div className="space-y-1.5">
           <span className="text-xs font-semibold text-ink-300">Title Language</span>
           <ClientOnly><TitleLanguageToggle /></ClientOnly>
          </div>
          <div className="h-px bg-ink-700/60" />
          <div className="flex items-center justify-between">
           <span className="text-xs font-semibold text-ink-300">Theme</span>
           <ClientOnly><ThemeToggle /></ClientOnly>
          </div>
         </div>
        )}
       </div>

       {/* User Account / Profile */}
       <div className="shrink-0 hidden sm:flex" suppressHydrationWarning>
        <ClientOnly>
         {session?.user ? (
          <button
           type="button"
           id="nav-profile-btn"
           onClick={() => handleNav('/profile')}
           className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-ink-700/60 hover:bg-ink-700 border border-ink-700 text-xs font-semibold text-ink-300 hover:text-white transition-colors cursor-pointer group"
           aria-label="Go to profile"
          >
           {session.user.avatarUrl ? (
            <img
             src={session.user.avatarUrl}
             alt={session.user.username}
             className="w-7 h-7 rounded-full object-cover"
            />
           ) : (
            <span className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center">
             <UserIcon className="w-3.5 h-3.5 text-ink-500 group-hover:text-white" />
            </span>
           )}
           <span className="hidden lg:inline max-w-[90px] truncate">{session.user.username}</span>
           <LevelBadge level={userLevel ?? session.user.level ?? 0} size="sm" />
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
        className="p-2 rounded-xl text-ink-500 hover:text-surface-primary hover:bg-white/[0.06] lg:hidden transition-colors"
        aria-label="Open menu"
       >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
       </button>
      </div>
    </div>
   </div>

    {/* Mobile Menu Dropdown */}
    {mobileMenuOpen && (
     <div className="lg:hidden border-b border-ink-700 bg-surface-canvas/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
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
           : 'text-ink-300 hover:bg-ink-700/60'
         }`}
        >
         <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-orange-400" />
          <span>{link.label}</span>
         </div>
         {link.count !== undefined && link.count > 0 && (
          <span
           className="px-2 py-0.5 rounded-full text-xs font-mono bg-ink-700 text-ink-300"
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