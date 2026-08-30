import React, { useState, useRef, useEffect } from 'react';
import { Database, Sparkles, Server, Check, ChevronDown } from 'lucide-react';
import { useDataSource } from '../../context/DataSourceContext';
import { DataSource } from '../../lib/animeApi';

interface DataSourceSelectorProps {
  compact?: boolean;
  className?: string;
  showDescription?: boolean;
  layout?: 'grid' | 'list';
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  compact = false,
  className = '',
  showDescription = false,
  layout = 'grid',
}) => {
 const { dataSource, setDataSource } = useDataSource();
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    setIsOpen(false);
   }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const sources: Array<{
  id: DataSource;
  label: string;
  badge: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
 }> = [
  {
   id: 'auto',
   label: 'Auto (Hybrid)',
   badge: 'Smart Multi-Source',
   sublabel: 'Auto balancer (AniList GraphQL + Jikan MAL + Fallback)',
   icon: Sparkles,
   accentColor: 'text-amber-400',
   bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  },
  {
   id: 'anilist',
   label: 'AniList',
   badge: 'GraphQL v2',
   sublabel: 'Fast GraphQL queries, high-res banners, live airing counts',
   icon: Server,
   accentColor: 'text-cyan-400',
   bgColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
  },
  {
   id: 'jikan',
   label: 'MyAnimeList',
   badge: 'Jikan v4',
   sublabel: 'Official MAL catalog, extensive character cast & theme songs',
   icon: Database,
   accentColor: 'text-blue-400',
   bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  },
 ];

 const currentSource = sources.find((s) => s.id === dataSource) || sources[0];
 const CurrentIcon = currentSource.icon;

 if (compact) {
  return (
   <div className={`relative inline-block ${className}`} ref={dropdownRef}>
    <button
     type="button"
     id="datasource-selector-btn"
     onClick={() => setIsOpen(!isOpen)}
     className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
      dataSource === 'anilist'
       ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/50 shadow-sm'
       : dataSource === 'jikan'
       ? 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/50 shadow-sm'
       : 'bg-surface-canvas border-ink-700 text-ink-300 hover:bg-surface-raised hover:text-white'
     }`}
     title={`Active Anime Data Source: ${currentSource.label} (${currentSource.badge})`}
    >
     <CurrentIcon className={`w-3.5 h-3.5 ${currentSource.accentColor}`} />
     <span className="hidden sm:inline font-medium">API:</span>
     <span className="font-bold text-xs">{currentSource.label.split(' ')[0]}</span>
     <span className="text-xs font-mono px-1 py-0.2 rounded bg-black/40 text-ink-300 border border-white/10 uppercase">
      {currentSource.badge.split(' ')[0]}
     </span>
     <ChevronDown className="w-3 h-3 text-ink-500 ml-0.5" />
    </button>

    {isOpen && (
     <div className="absolute right-0 mt-2 w-72 p-2 bg-surface-canvas/95 backdrop-blur-2xl border border-ink-700 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="px-3 py-1.5 mb-1 border-b border-ink-700 flex items-center justify-between">
       <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
        Anime Data Source
       </span>
       <span className="text-xs text-ink-500 font-mono">GraphQL / REST</span>
      </div>

      <div className="space-y-1">
       {sources.map((item) => {
        const Icon = item.icon;
        const isSelected = item.id === dataSource;
        return (
         <button
          key={item.id}
          type="button"
          onClick={() => {
           setDataSource(item.id);
           setIsOpen(false);
          }}
          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
           isSelected
            ? 'bg-surface-raised/90 border border-ink-500/60 shadow-sm'
            : 'hover:bg-surface-canvas/70 border border-transparent'
          }`}
         >
          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${item.bgColor}`}>
           <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
           <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-surface-primary">{item.label}</span>
            <span className="text-xs px-1 py-0.2 rounded font-mono bg-ink-700 text-ink-300">
             {item.badge}
            </span>
           </div>
           <p className="text-xs text-ink-500 leading-snug mt-0.5">
            {item.sublabel}
           </p>
          </div>
          {isSelected && (
           <Check className="w-4 h-4 text-orange-400 shrink-0 self-center" />
          )}
         </button>
        );
       })}
      </div>
     </div>
    )}
   </div>
  );
 }

 // Full interactive card toggle (for Settings/Browse/Search)
 return (
  <div className={`space-y-2 ${className}`}>
   <div className="flex items-center justify-between">
    <label className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
     <Database className="w-3.5 h-3.5 text-orange-400" />
     <span>Data Provider</span>
    </label>
    <span className="text-xs font-mono text-ink-500 bg-surface-canvas px-2 py-0.5 rounded-full border border-ink-700">
     3 Providers Ready
    </span>
   </div>

    <div className={`grid gap-2 ${layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
     {sources.map((item) => {
      const Icon = item.icon;
      const isSelected = item.id === dataSource;
      return (
       <button
        key={item.id}
        type="button"
        onClick={() => setDataSource(item.id)}
        className={`p-3 rounded-2xl border text-left flex gap-2.5 transition-all cursor-pointer ${layout === 'list' ? 'items-start' : 'flex-col justify-between'} ${
         isSelected
          ? 'bg-surface-raised border-orange-500/50 shadow-sm'
          : 'bg-surface-canvas/60 border-ink-700 hover:bg-surface-raised/60 hover:border-ink-500/40'
        }`}
       >
        <div className={`p-1.5 rounded-lg shrink-0 ${item.bgColor}`}>
         <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-surface-primary leading-none">{item.label}</span>
          <span className="text-xs px-1 py-0.5 rounded font-mono bg-ink-700 text-ink-300 leading-none">
           {item.badge}
          </span>
         </div>
         <p className="text-xs text-ink-500 leading-snug mt-1">
          {item.sublabel}
         </p>
        </div>
        {isSelected && (
         <Check className="w-4 h-4 text-orange-400 shrink-0 self-center hidden sm:block" />
        )}
       </button>
      );
     })}
    </div>
  </div>
 );
};
