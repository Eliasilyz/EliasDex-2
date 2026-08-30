'use client';

import React, { useState, useEffect } from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { Anime } from '../types';
import { getUnifiedSchedule } from '../lib/animeApi';
import { useDataSource } from '../context/DataSourceContext';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Calendar, Clock, Star } from 'lucide-react';

const DAYS = [
 { id: 'monday', label: 'Monday' },
 { id: 'tuesday', label: 'Tuesday' },
 { id: 'wednesday', label: 'Wednesday' },
 { id: 'thursday', label: 'Thursday' },
 { id: 'friday', label: 'Friday' },
 { id: 'saturday', label: 'Saturday' },
 { id: 'sunday', label: 'Sunday' },
];

export const SchedulePage: React.FC = () => {
 const onNavigate = useAppNavigate();
 const { dataSource } = useDataSource();
 const getTodayId = () => {
  const dayIndex = new Date().getDay();
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[dayIndex];
 };

 const [selectedDay, setSelectedDay] = useState(getTodayId());
 const [items, setItems] = useState<Anime[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  let isMounted = true;
  setLoading(true);
  setError(null);

  getUnifiedSchedule({ source: dataSource, filter: selectedDay, limit: 30 })
   .then((res) => {
    if (isMounted) {
     setItems(res.data || []);
     setLoading(false);
    }
   })
   .catch((err) => {
    if (isMounted) {
     console.error('Schedule page error:', err);
     setError('Could not load weekly schedule');
     setLoading(false);
    }
   });

  return () => {
   isMounted = false;
  };
 }, [selectedDay, dataSource]);

 return (
  <div className="space-y-8 pb-16">
   {/* Header */}
   <div className="space-y-2">
    <div className="flex items-center gap-2.5">
     <div className="p-2 rounded-xl bg-orange-600/10 text-orange-400">
      <Calendar className="w-5 h-5" />
     </div>
     <div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-surface-primary font-heading tracking-tight">
       Weekly Airing Schedule
      </h1>
      <p className="text-xs text-ink-500">Discover when new episodes air across the week</p>
     </div>
    </div>
   </div>

   {/* Weekday Switcher Tabs */}
   <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
    {DAYS.map((day) => {
     const isSelected = selectedDay === day.id;
     const isToday = getTodayId() === day.id;

     return (
      <button
       key={day.id}
       id={`schedule-tab-${day.id}`}
       type="button"
       onClick={() => setSelectedDay(day.id)}
       className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
        isSelected
         ? 'bg-orange-600 text-white border-orange-500 shadow-lg '
         : 'bg-surface-canvas/80 hover:bg-surface-raised text-ink-300 border-ink-700'
       }`}
      >
       <span>{day.label}</span>
       {isToday && <span className="ml-1.5 opacity-75 font-normal text-xs">(Today)</span>}
      </button>
     );
    })}
   </div>

   {/* Grid of Airing Anime */}
   <section className="space-y-4">
    <div className="text-xs text-ink-500">
     Showing anime broadcasting on <span className="text-surface-primary font-semibold capitalize">{selectedDay}</span>
    </div>

    <AnimeGrid
     items={items}
     loading={loading}
     error={error}
     onRetry={() => setSelectedDay(selectedDay)}
     onSelectAnime={(malId) => onNavigate(`/anime/${malId}`)}
     onWatchAnime={(malId, ep) => onNavigate(`/watch/${malId}/${ep || 1}`)}
    />
   </section>
  </div>
 );
};
