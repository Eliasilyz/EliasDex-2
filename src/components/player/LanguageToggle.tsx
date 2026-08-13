import React from 'react';
import { Volume2, Subtitles } from 'lucide-react';

interface LanguageToggleProps {
  value: 'sub' | 'dub';
  onChange: (value: 'sub' | 'dub') => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
      <button
        type="button"
        id="lang-toggle-sub"
        onClick={() => onChange('sub')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          value === 'sub'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Subtitles className="w-3.5 h-3.5" />
        <span>SUB</span>
      </button>

      <button
        type="button"
        id="lang-toggle-dub"
        onClick={() => onChange('dub')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          value === 'dub'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>DUB</span>
      </button>
    </div>
  );
};
