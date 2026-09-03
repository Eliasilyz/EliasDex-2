'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Play, Flame, Calendar, Compass, Bookmark, History, Menu, X, Sparkles, User as UserIcon, Settings, ChevronDown, LogOut, Shield } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { TitleLanguageToggle } from '../ui/TitleLanguageToggle';
import { DataSourceSelector } from '../ui/DataSourceSelector';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { ShadcnButton } from '../ui/shadcn/button';
import { UserNameDisplay } from '@/components/collectibles/UserNameDisplay';
import { useWatch } from '../../context/WatchContext';
import { useAppNavigate } from '@/lib/useNavigate';
import { onCollectiblesChange } from '@/lib/collectibleEvents';
import type { ResolvedCollectibles } from '@/types/models';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const { watchlist, history } = useWatch();
  const { data: session } = useSession();
  const [navCollectibles, setNavCollectibles] = useState<ResolvedCollectibles | null>(null);
  const pathname = usePathname();
  const currentPath = pathname || '/';
  const onNavigate = useAppNavigate();

  useEffect(() => {
   setMounted(true);
  }, []);

  useEffect(() => {
   if (!session?.user) return;
   fetch("/api/user/collectibles")
     .then((r) => (r.ok ? r.json() : null))
     .then((data) => {
       if (data?.equipped) setNavCollectibles(data.equipped);
     })
     .catch(() => {});
  }, [session?.user]);

  // Re-fetch collectibles when they change (equip/unequip in inventory panel)
  useEffect(() => {
   return onCollectiblesChange(() => {
     if (!session?.user) return;
     fetch("/api/user/collectibles")
       .then((r) => (r.ok ? r.json() : null))
       .then((data) => {
         if (data?.equipped) setNavCollectibles(data.equipped);
       })
       .catch(() => {});
   });
  }, [session?.user]);

  useEffect(() => {
   const handleClickOutside = (e: MouseEvent) => {
     const t = e.target as Node;
     if (settingsRef.current && !settingsRef.current.contains(t)) {
       setSettingsOpen(false);
     }
     if (userMenuRef.current && !userMenuRef.current.contains(t)) {
       setUserMenuOpen(false);
     }
   };
   const handleEsc = (e: KeyboardEvent) => {
     if (e.key === 'Escape') {
       setSettingsOpen(false);
       setUserMenuOpen(false);
     }
   };
   if (settingsOpen || userMenuOpen) {
     document.addEventListener('mousedown', handleClickOutside);
     document.addEventListener('keydown', handleEsc);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
       document.removeEventListener('keydown', handleEsc);
     };
   }
  }, [settingsOpen, userMenuOpen]);

  const handleNav = (path: string) => {
   setMobileMenuOpen(false);
   setSettingsOpen(false);
   setUserMenuOpen(false);
   onNavigate(path);
  };

  const handleLogout = async () => {
   setUserMenuOpen(false);
   await signOut({ callbackUrl: '/?loggedOut=1' });
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
        Elias<span className="text-orange-400">Dex</span>
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
          <div className="relative" ref={userMenuRef}>
           <button
            type="button"
            id="nav-profile-btn"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-label="Account menu"
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-ink-700/60 hover:bg-ink-700 border border-ink-700 text-xs font-semibold text-ink-300 hover:text-white transition-colors cursor-pointer group"
             >
              {session.user.avatarUrl ? (
               <img
                src={session.user.avatarUrl}
                alt={session.user.username}
                className={`w-7 h-7 rounded-full object-cover ${navCollectibles?.border ? `ring-2 ${navCollectibles.border.rarity === "legendary" ? "ring-amber-400" : navCollectibles.border.rarity === "epic" ? "ring-purple-500" : navCollectibles.border.rarity === "rare" ? "ring-blue-500" : "ring-ink-500"}` : ""}`}
               />
              ) : (
               <span className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-ink-500 group-hover:text-white" />
               </span>
              )}
             <span className="hidden lg:inline max-w-[90px] truncate">
              <UserNameDisplay
               username={session.user.username}
               nameStyle={navCollectibles?.nameStyle}
               rank={navCollectibles?.rank}
               className="text-xs font-semibold"
              />
             </span>
            {session.user.isVerified && <VerifiedBadge className="hidden lg:inline" />}
            <ChevronDown className={`w-3 h-3 text-ink-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
           </button>

           {userMenuOpen && (
            <div
             role="menu"
             className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-ink-700/70 bg-surface-raised/98 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-4 py-3 border-b border-ink-700/50">
               <p className="text-xs font-semibold text-surface-primary truncate">
                <UserNameDisplay
                 username={session.user.username}
                 nameStyle={navCollectibles?.nameStyle}
                 rank={navCollectibles?.rank}
                />
               </p>
              <p className="text-[11px] text-ink-500 truncate">{session.user.email}</p>
             </div>
             <div className="py-1">
              <button
               type="button"
               role="menuitem"
               onClick={() => handleNav('/profile')}
               className="w-full flex items-center gap-2 px-4 py-2 text-xs text-ink-300 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
               <UserIcon className="w-3.5 h-3.5" /> My Profile
              </button>
              {(session.user.role === 'admin') && (
               <button
                type="button"
                role="menuitem"
                onClick={() => handleNav('/admin/announcements')}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-ink-300 hover:text-white hover:bg-white/[0.05] transition-colors"
               >
                <Shield className="w-3.5 h-3.5" /> Admin Panel
               </button>
              )}
             </div>
             <div className="py-1 border-t border-ink-700/50">
              <button
               type="button"
               role="menuitem"
               onClick={handleLogout}
               className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
               <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
             </div>
            </div>
           )}
          </div>
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

      {/* Mobile account section */}
      <ClientOnly>
       <div className="border-t border-ink-700/50 pt-3 mt-1 space-y-1">
        {session?.user ? (
         <>
          <button
           type="button"
           onClick={() => handleNav('/profile')}
           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-300 hover:bg-ink-700/60 transition-colors"
          >
           <UserIcon className="w-4 h-4 text-orange-400" />
           Profile
          </button>
          {session.user.role === 'admin' && (
           <button
            type="button"
            onClick={() => handleNav('/admin')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-300 hover:bg-ink-700/60 transition-colors"
           >
            <Shield className="w-4 h-4 text-orange-400" />
            Admin
           </button>
          )}
          <button
           type="button"
           onClick={handleLogout}
           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
           <LogOut className="w-4 h-4" />
           Logout
          </button>
         </>
        ) : (
         <ShadcnButton
          variant="default"
          size="sm"
          onClick={() => handleNav('/login')}
          className="w-full"
         >
          Sign In
         </ShadcnButton>
        )}
       </div>
      </ClientOnly>
     </div>
    )}
  </header>
 );
};