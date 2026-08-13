import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${className}`}
      title={`Current theme: ${theme} (click to cycle)`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' && <Moon className="w-4 h-4 text-orange-400" />}
      {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
      {theme === 'system' && <Monitor className="w-4 h-4 text-zinc-400" />}
    </button>
  );
};
