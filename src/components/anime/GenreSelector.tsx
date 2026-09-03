import React from 'react';
import { Genre } from '../../types';

interface GenreSelectorProps {
 genres: Genre[];
 selectedGenreIds?: number[];
 onToggleGenre: (genreId: number) => void;
 className?: string;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
 genres,
 selectedGenreIds = [],
 onToggleGenre,
 className = '',
}) => {
 return (
  <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 ${className}`}>
   {genres.map((g) => {
    const isSelected = selectedGenreIds.includes(g.mal_id);
    return (
     <button
      key={g.mal_id}
      id={`genre-pill-${g.mal_id}`}
      type="button"
      onClick={() => onToggleGenre(g.mal_id)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
       isSelected
        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
        : 'bg-surface-canvas/80 hover:bg-ink-700 text-ink-300 border border-ink-700'
      }`}
     >
      {g.name}
     </button>
    );
   })}
  </div>
 );
};
