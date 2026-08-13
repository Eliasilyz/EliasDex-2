import React from 'react';
import { Play, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shadow-md shadow-orange-600/20">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </div>
              <span className="font-heading font-bold text-lg text-white">
                Anime<span className="text-orange-400">Stream</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Minimalist, fast, and modern anime directory and video player application. Browse seasons, weekly schedules, top charts, and stream episodes with sub and dub options.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3 font-mono">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#/" className="hover:text-orange-400 transition-colors">Home & Trending</a>
              </li>
              <li>
                <a href="#/top" className="hover:text-orange-400 transition-colors">Top Airing & Popular</a>
              </li>
              <li>
                <a href="#/schedule" className="hover:text-orange-400 transition-colors">Airing Schedule</a>
              </li>
              <li>
                <a href="#/browse" className="hover:text-orange-400 transition-colors">Browse by Genre</a>
              </li>
              <li>
                <a href="#/watchlist" className="hover:text-orange-400 transition-colors">My Watchlist</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3 font-mono">
              Data & Providers
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <a
                  href="https://jikan.moe"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  Jikan API (MyAnimeList) <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a
                  href="https://megaplay.buzz"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  MegaPlay Streams <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-500 text-xs mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Token-Bucket Rate Limited Proxy
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AnimeStream. All anime metadata belongs to MyAnimeList.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision & passion</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
