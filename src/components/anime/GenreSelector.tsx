import React from 'react';
import { Genre } from '../../types';

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreId?: number | null;
  onSelectGenre: (genreId: number | null) => void;
  className?: string;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  genres,
  selectedGenreId,
  onSelectGenre,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}>
      <button
        type="button"
        onClick={() => onSelectGenre(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
          selectedGenreId === null
            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
        }`}
      >
        All Genres
      </button>

      {genres.map((g) => {
        const isSelected = selectedGenreId === g.mal_id;
        return (
          <button
            key={g.mal_id}
            id={`genre-pill-${g.mal_id}`}
            type="button"
            onClick={() => onSelectGenre(g.mal_id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <span>{g.name}</span>
            {g.count && (
              <span className="ml-1 opacity-60 font-normal text-[10px]">
                {g.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
