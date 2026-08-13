import React, { useState, useMemo } from 'react';
import { AnimeStaffMember } from '../../types';
import { Badge } from '../ui/Badge';
import { Users, Clapperboard, ExternalLink, Award } from 'lucide-react';

interface StaffListProps {
  staff: AnimeStaffMember[];
  isLoading?: boolean;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, isLoading = false }) => {
  const [filterRole, setFilterRole] = useState<'all' | 'director' | 'music' | 'story'>('all');

  const filteredStaff = useMemo(() => {
    if (filterRole === 'all') return staff;

    return staff.filter((member) => {
      const positions = member.positions.join(' ').toLowerCase();
      if (filterRole === 'director') {
        return positions.includes('director') || positions.includes('series composition');
      }
      if (filterRole === 'music') {
        return positions.includes('music') || positions.includes('sound') || positions.includes('theme');
      }
      if (filterRole === 'story') {
        return positions.includes('original creator') || positions.includes('script') || positions.includes('character design');
      }
      return true;
    });
  }, [staff, filterRole]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
        ))}
      </div>
    );
  }

  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
        <Users className="w-8 h-8 text-zinc-500 mx-auto" />
        <p className="text-sm font-semibold text-zinc-300">No staff information available</p>
        <p className="text-xs text-zinc-500">Production crew details have not been cataloged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterRole('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterRole === 'all'
              ? 'bg-orange-500 text-white font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Staff ({staff.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterRole('director')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterRole === 'director'
              ? 'bg-orange-500 text-white font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Directors & Leads
        </button>
        <button
          type="button"
          onClick={() => setFilterRole('story')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterRole === 'story'
              ? 'bg-orange-500 text-white font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Original Creator & Design
        </button>
        <button
          type="button"
          onClick={() => setFilterRole('music')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterRole === 'music'
              ? 'bg-orange-500 text-white font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Music & Sound
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStaff.map((member, idx) => {
          const imgUrl = member.person.images?.jpg?.image_url;
          return (
            <div
              key={`${member.person.mal_id}-${idx}`}
              className="bg-zinc-900/60 hover:bg-zinc-850/90 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-3.5 flex items-start gap-3.5 transition-all duration-200 shadow-sm"
            >
              {/* Staff Avatar */}
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={member.person.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 rounded-xl object-cover border border-zinc-700/80 shrink-0"
                />
              ) : (
                <div className="w-12 h-14 rounded-xl bg-zinc-800 border border-zinc-750 flex items-center justify-center text-zinc-500 shrink-0">
                  <Clapperboard className="w-5 h-5" />
                </div>
              )}

              {/* Staff Info */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-zinc-100 truncate">
                    {member.person.name}
                  </h4>
                  {member.person.url && (
                    <a
                      href={member.person.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-orange-400 transition-colors p-0.5"
                      title="View Profile on MyAnimeList"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Positions list */}
                <div className="flex flex-wrap gap-1">
                  {member.positions.map((pos, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/90 text-orange-300/90 border border-zinc-750/70"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
