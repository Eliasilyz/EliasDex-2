'use client';

import React, { useState, useEffect } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime } from '../types';
import { getUnifiedSeasonNow, getUnifiedTopAnime } from '../lib/animeApi';
import { FALLBACK_ANIME_LIST } from '../lib/fallbackData';
import { SwiperHeroCarousel } from '../components/anime/SwiperHeroCarousel';
import { SwiperAnimeSlider } from '../components/anime/SwiperAnimeSlider';
import { ScheduleRow } from '../components/anime/ScheduleRow';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { HeroSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { LazyImage } from '../components/ui/LazyImage';
import { useWatch } from '../context/WatchContext';

import { useDataSource } from '../context/DataSourceContext';
import { Sparkles, Flame, Tv, Play, ChevronRight, History } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const onNavigate = useAppNavigate();
  const { history } = useWatch();
  const { dataSource } = useDataSource();
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [airingAnime, setAiringAnime] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingHero(true);
    setLoadingSections(true);

    // Fetch Featured Hero (Season Now) with active DataSource
    getUnifiedSeasonNow({ source: dataSource, limit: 8 })
      .then((res) => {
        if (isMounted) {
          const items = res.data && res.data.length > 0 ? res.data : FALLBACK_ANIME_LIST.slice(0, 8);
          setFeaturedAnime(items);
          setLoadingHero(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeaturedAnime(FALLBACK_ANIME_LIST.slice(0, 8));
          setLoadingHero(false);
        }
      });

    // Fetch Section content in parallel
    Promise.all([
      getUnifiedTopAnime({ source: dataSource, filter: 'bypopularity', limit: 12 }),
      getUnifiedTopAnime({ source: dataSource, filter: 'airing', limit: 12 }),
      getUnifiedTopAnime({ source: dataSource, filter: 'upcoming', limit: 12 }),
    ])
      .then(([popRes, airRes, upRes]) => {
        if (isMounted) {
          setPopularAnime(popRes.data && popRes.data.length > 0 ? popRes.data : FALLBACK_ANIME_LIST.slice(0, 12));
          setAiringAnime(airRes.data && airRes.data.length > 0 ? airRes.data : FALLBACK_ANIME_LIST.slice(0, 12));
          setUpcomingAnime(upRes.data && upRes.data.length > 0 ? upRes.data : FALLBACK_ANIME_LIST.slice(2, 14));
          setLoadingSections(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPopularAnime(FALLBACK_ANIME_LIST.slice(0, 12));
          setAiringAnime(FALLBACK_ANIME_LIST.slice(0, 12));
          setUpcomingAnime(FALLBACK_ANIME_LIST.slice(2, 14));
          setLoadingSections(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dataSource]);

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Swiper Hero Carousel */}
      <section>
        {loadingHero ? (
          <HeroSkeleton />
        ) : (
          <SwiperHeroCarousel
            items={featuredAnime}
            onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
            onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
          />
        )}
      </section>

      {/* Continue Watching Strip */}
      {history && history.length > 0 && (
        <section className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Continue Watching
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/history')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer jq-ripple"
            >
              View History ({history.length}) →
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.malId}
                onClick={() => onNavigate(`/watch/${item.malId}/${item.episodeNumber}`)}
                className="w-48 sm:w-56 shrink-0 p-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer transition-all flex items-center gap-3 group jq-ripple"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0 relative">
                  {item.image ? (
                    <LazyImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : null}

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-orange-300 font-mono mt-0.5">
                    Episode {item.episodeNumber}
                  </p>
                  <span className="text-[10px] text-zinc-400 uppercase">
                    {item.language}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Airing Schedule Strip */}
      <section>
        <ScheduleRow
          onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
          onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
        />
      </section>

      {/* 3. Top Popular Swiper Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-heading">
                Most Popular Anime
              </h2>
              <p className="text-xs text-zinc-400">All-time top fan favorites</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/top?filter=bypopularity')}
            className="text-xs text-orange-400 hover:text-orange-300 jq-ripple"
          >
            Explore All <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loadingSections ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SwiperAnimeSlider
            items={popularAnime}
            sliderId="popular"
            onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
            onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
          />
        )}
      </section>

      {/* 4. Top Airing Now Swiper Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-heading">
                Top Airing Now
              </h2>
              <p className="text-xs text-zinc-400">Currently broadcasting anime series</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/top?filter=airing')}
            className="text-xs text-orange-400 hover:text-orange-300 jq-ripple"
          >
            Explore Airing <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loadingSections ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SwiperAnimeSlider
            items={airingAnime}
            sliderId="airing"
            onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
            onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
          />
        )}
      </section>

      {/* 5. Top Anticipated & Upcoming Swiper Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-heading">
                Upcoming & Anticipated
              </h2>
              <p className="text-xs text-zinc-400">Exciting anime coming next season</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/top?filter=upcoming')}
            className="text-xs text-orange-400 hover:text-orange-300 jq-ripple"
          >
            View Upcoming <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loadingSections ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SwiperAnimeSlider
            items={upcomingAnime}
            sliderId="upcoming"
            onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
            onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
          />
        )}
      </section>
    </div>
  );
};

