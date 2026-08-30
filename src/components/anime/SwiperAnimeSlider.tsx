'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime } from '@/types';
import { AnimeCard } from './AnimeCard';

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
        spaceBetween={14}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 18 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
        }}
        className="w-full py-2 !overflow-visible"
      >
        {items.map((anime) => (
          <SwiperSlide key={anime.mal_id} className="!h-auto flex">
            <AnimeCard
              anime={anime}
              onSelect={onSelectAnime}
              onWatch={onWatchAnime}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slider Controls */}
      <button
        type="button"
        className={`${prevClass} absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface-canvas/90 hover:bg-orange-500 border border-ink-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-200 cursor-pointer`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className={`${nextClass} absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface-canvas/90 hover:bg-orange-500 border border-ink-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-200 cursor-pointer`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
