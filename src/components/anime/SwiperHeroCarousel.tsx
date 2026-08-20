'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Play, Info, Star, Calendar, Flame } from 'lucide-react';
import { Anime } from '@/types';
import { ShadcnButton } from '../ui/shadcn/button';
import { ShadcnBadge } from '../ui/shadcn/badge';
import { LazyImage } from '../ui/LazyImage';


import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperHeroCarouselProps {
  items: Anime[];
  onSelectAnime: (malId: number) => void;
  onWatchAnime: (malId: number, ep?: number) => void;
}

export const SwiperHeroCarousel: React.FC<SwiperHeroCarouselProps> = ({
  items,
  onSelectAnime,
  onWatchAnime,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden group shadow-2xl border border-zinc-800/60 bg-zinc-950">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-orange-500 !w-8',
          bulletClass: 'swiper-pagination-bullet !bg-white/40 !opacity-100 !w-2.5 !h-2.5 !rounded-full transition-all duration-300',
        }}
        navigation={{
          nextEl: '.swiper-hero-next',
          prevEl: '.swiper-hero-prev',
        }}
        loop={items.length > 1}
        className="w-full h-[400px] sm:h-[460px] md:h-[520px]"
      >
        {items.map((anime) => {
          const bgImage =
            anime.images?.webp?.large_image_url ||
            anime.images?.jpg?.large_image_url ||
            anime.images?.webp?.image_url ||
            anime.images?.jpg?.image_url ||
            '';
          const displayTitle = anime.title_english || anime.title;
          const genres = anime.genres ? anime.genres.slice(0, 3) : [];

          return (
            <SwiperSlide key={anime.mal_id} className="relative w-full h-full overflow-hidden">
              {/* Background Image with Gradient Overlays */}
              <div className="absolute inset-0">
                {bgImage ? (
                  <LazyImage
                    src={bgImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover object-center scale-105 filter brightness-90 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/40" />
                )}

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
              </div>

              {/* Slide Content */}
              <div className="relative z-10 h-full max-w-4xl flex flex-col justify-end p-6 sm:p-10 md:p-12 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ShadcnBadge variant="default" className="gap-1 bg-orange-500 text-white font-bold px-3 py-1">
                    <Flame className="w-3.5 h-3.5" /> Featured
                  </ShadcnBadge>
                  {anime.score && (
                    <ShadcnBadge variant="emerald" className="gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {anime.score.toFixed(1)}
                    </ShadcnBadge>
                  )}
                  {anime.year && (
                    <ShadcnBadge variant="secondary" className="gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {anime.year}
                    </ShadcnBadge>
                  )}
                </div>

                <h1
                  onClick={() => onSelectAnime(anime.mal_id)}
                  className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-heading hover:text-orange-400 cursor-pointer transition-colors line-clamp-2"
                >
                  {displayTitle}
                </h1>

                {anime.synopsis && (
                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl font-sans leading-relaxed drop-shadow">
                    {anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, '')}
                  </p>
                )}

                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {genres.map((g) => (
                      <span
                        key={g.mal_id}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 backdrop-blur-sm"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <ShadcnButton
                    onClick={() => onWatchAnime(anime.mal_id, 1)}
                    size="lg"
                    className="gap-2 bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 jq-ripple"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Watch Episode 1</span>
                  </ShadcnButton>

                  <ShadcnButton
                    onClick={() => onSelectAnime(anime.mal_id)}
                    variant="glass"
                    size="lg"
                    className="gap-2 jq-ripple"
                  >
                    <Info className="w-5 h-5" />
                    <span>Details</span>
                  </ShadcnButton>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Custom Buttons */}
      <button
        type="button"
        className="swiper-hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-orange-500 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        aria-label="Previous Slide"
      >
        ‹
      </button>
      <button
        type="button"
        className="swiper-hero-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-orange-500 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        aria-label="Next Slide"
      >
        ›
      </button>
    </div>
  );
};
