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
   className={`relative inline-flex items-center justify-center p-2 rounded-xl text-ink-500 hover:text-surface-primary hover:bg-ink-700/60 transition-colors focus:outline-none focus:ring-2 focus:/50 ${className}`}
   title={`Current theme: ${theme} (click to cycle)`}
   aria-label="Toggle theme"
  >
   {theme === 'dark' && <Moon className="w-4 h-4 text-orange-400" />}
   {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
   {theme === 'system' && <Monitor className="w-4 h-4 text-ink-500" />}
  </button>
 );
};
