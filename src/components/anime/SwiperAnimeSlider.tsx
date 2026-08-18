'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime } from '@/types';
import { LazyImage } from '../ui/LazyImage';


import 'swiper/css';
import 'swiper/css/navigation';

interface SwiperAnimeSliderProps {
  items: Anime[];
  sliderId: string;
  onSelectAnime: (malId: number) => void;
  onWatchAnime: (malId: number, ep?: number) => void;
}

export const SwiperAnimeSlider: React.FC<SwiperAnimeSliderProps> = ({
  items,
  sliderId,
  onSelectAnime,
  onWatchAnime,
}) => {
  if (!items || items.length === 0) return null;

  const prevClass = `swiper-prev-${sliderId}`;
  const nextClass = `swiper-next-${sliderId}`;

  return (
    <div className="relative group/slider">
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: `.${nextClass}`,
          prevEl: `.${prevClass}`,
        }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 18 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
        }}
        className="w-full py-2 !overflow-visible"
      >
        {items.map((anime) => {
          const displayTitle = anime.title_english || anime.title;
          const imageUrl =
            anime.images?.webp?.large_image_url ||
            anime.images?.jpg?.large_image_url ||
            anime.images?.webp?.image_url ||
            anime.images?.jpg?.image_url ||
            '';

          return (
            <SwiperSlide key={anime.mal_id}>
              <div className="group relative flex flex-col h-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                {/* Poster */}
                <div
                  onClick={() => onSelectAnime(anime.mal_id)}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950 cursor-pointer"
                >
                  <LazyImage
                    src={imageUrl}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />


                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Rating Badge */}
                  {anime.score && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {anime.score.toFixed(1)}
                    </div>
                  )}

                  {/* Watch Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-orange-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWatchAnime(anime.mal_id, 1);
                      }}
                      className="p-3 rounded-full bg-orange-500 text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-orange-600 cursor-pointer jq-ripple"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col justify-between flex-1 space-y-1">
                  <h3
                    onClick={() => onSelectAnime(anime.mal_id)}
                    className="text-xs font-bold text-zinc-100 line-clamp-2 hover:text-orange-400 cursor-pointer transition-colors font-heading"
                  >
                    {displayTitle}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                    <span>{anime.type || 'TV'}</span>
                    <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Slider Controls */}
      <button
        type="button"
        className={`${prevClass} absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-orange-500 border border-zinc-700 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-200 cursor-pointer`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className={`${nextClass} absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-orange-500 border border-zinc-700 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-200 cursor-pointer`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
