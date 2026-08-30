import React from 'react';
import { Languages } from 'lucide-react';
import { useTitleLanguage, TitleLanguage } from '../../context/TitleLanguageContext';

interface TitleLanguageToggleProps {
 className?: string;
 compact?: boolean;
}

export const TitleLanguageToggle: React.FC<TitleLanguageToggleProps> = ({
 className = '',
 compact = false,
}) => {
 const { titleLanguage, setTitleLanguage, toggleTitleLanguage } = useTitleLanguage();

  if (compact) {
  return (
  <button
   id="title-lang-toggle-compact"
   type="button"
   onClick={toggleTitleLanguage}
   className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
   titleLanguage === 'en'
   ? 'bg-orange-700 text-white hover:bg-orange-600'
   : 'bg-surface-canvas border-ink-500 text-orange-400 hover:border-orange-500/50'
   } ${className}`}
   title={`Title Language: ${titleLanguage === 'en' ? 'English (EN)' : 'Japanese (JP)'}. Click to switch.`}
   aria-label="Toggle anime title language"
  >
  <Languages className="w-3.5 h-3.5 text-ink-300" />
   <span className="uppercase">{titleLanguage}</span>
  </button>
  );
  }

 return (
 <div
  id="title-lang-toggle-group"
  className={`inline-flex items-center p-0.5 rounded-xl bg-surface-canvas/90 border border-ink-700 text-xs font-semibold select-none ${className}`}
  role="group"
  aria-label="Anime Title Language Toggle"
 >
  <button
  id="title-lang-en-btn"
  type="button"
  onClick={() => setTitleLanguage('en')}
  className={`px-2 py-1 rounded-lg transition-all text-xs font-mono font-bold cursor-pointer ${
   titleLanguage === 'en'
   ? 'bg-orange-700 text-white shadow-sm '
   : 'text-ink-500 hover:text-ink-300 hover:bg-ink-700/60'
  }`}
  title="Display titles in English (e.g. Attack on Titan)"
  >
  EN
  </button>

  <button
  id="title-lang-jp-btn"
  type="button"
  onClick={() => setTitleLanguage('jp')}
  className={`px-2 py-1 rounded-lg transition-all text-xs font-mono font-bold cursor-pointer ${
   titleLanguage === 'jp'
   ? 'bg-orange-700 text-white shadow-sm '
   : 'text-ink-500 hover:text-ink-300 hover:bg-ink-700/60'
  }`}
  title="Display titles in Japanese / Romaji (e.g. Shingeki no Kyojin / 進撃の巨人)"
  >
  JP
  </button>
 </div>
 );
};
