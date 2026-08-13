import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Star, Play } from 'lucide-react';
import { Anime } from '../../types';
import { getUnifiedSchedule } from '../../lib/animeApi';
import { useDataSource } from '../../context/DataSourceContext';
import { getFallbackSchedule } from '../../lib/fallbackData';
import { Skeleton } from '../ui/Skeleton';

const DAYS = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const ScheduleRow: React.FC<{
  onSelectAnime?: (malId: number) => void;
  onWatchAnime?: (malId: number, ep?: number) => void;
}> = ({ onSelectAnime, onWatchAnime }) => {
  const { dataSource } = useDataSource();
  // Determine today's day of week in English
  const getTodayId = () => {
    const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[dayIndex];
  };

  const [selectedDay, setSelectedDay] = useState(getTodayId());
  const [scheduleItems, setScheduleItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getUnifiedSchedule({ source: dataSource, filter: selectedDay })
      .then((res) => {
        if (isMounted) {
          const items = res.data && res.data.length > 0 ? res.data : getFallbackSchedule(selectedDay);
          setScheduleItems(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setScheduleItems(getFallbackSchedule(selectedDay));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDay, dataSource]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header & Day Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-600/10 text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-heading">
              Airing Schedule
            </h2>
            <p className="text-xs text-zinc-400">Catch the newest weekly releases</p>
          </div>
        </div>

        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day.id;
            const isToday = getTodayId() === day.id;
            return (
              <button
                key={day.id}
                id={`schedule-day-${day.id}`}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <span>{day.short}</span>
                {isToday && (
                  <span className="ml-1 text-[10px] opacity-80 font-normal">
                    (Today)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Items Carousel Container */}
      <div className="relative group/carousel">
        {/* Left / Right Nav Arrows */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-700 text-white shadow-xl flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-zinc-800 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-700 text-white shadow-xl flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-zinc-800 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Cards Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-64 shrink-0 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 space-y-3"
              >
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-22 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : scheduleItems.length > 0 ? (
            scheduleItems.map((anime) => {
              const img =
                anime.images?.webp?.image_url ||
                anime.images?.jpg?.image_url ||
                '';
              const title = anime.title_english || anime.title;
              const broadcastTime = anime.broadcast?.time
                ? `${anime.broadcast.time} JST`
                : anime.broadcast?.string || 'Today';

              return (
                <div
                  key={anime.mal_id}
                  id={`schedule-card-${anime.mal_id}`}
                  className="w-72 shrink-0 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-800/80 hover:border-zinc-700 p-3 transition-all flex flex-col justify-between group hover:shadow-lg hover:shadow-orange-950/20"
                >
                  <div className="flex gap-3">
                    <div
                      onClick={() => {
                        if (onSelectAnime) onSelectAnime(anime.mal_id);
                        else window.location.hash = `#/anime/${anime.mal_id}`;
                      }}
                      className="w-16 h-22 rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative cursor-pointer"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            if (onSelectAnime) onSelectAnime(anime.mal_id);
                            else window.location.hash = `#/anime/${anime.mal_id}`;
                          }}
                          className="text-xs font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                          title={title}
                        >
                          {title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-400">
                          <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                          <span className="truncate font-mono">{broadcastTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                        {anime.score ? (
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {anime.score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-zinc-500">{anime.type || 'TV'}</span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (onWatchAnime) onWatchAnime(anime.mal_id, 1);
                            else window.location.hash = `#/watch/${anime.mal_id}/1`;
                          }}
                          className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-orange-400" />
                          <span>Watch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 px-4 text-center text-sm text-zinc-400 w-full">
              No anime scheduled for {selectedDay}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
