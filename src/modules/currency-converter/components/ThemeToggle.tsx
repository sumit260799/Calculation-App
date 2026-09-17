import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { type ThemeMode, getStoredTheme, setStoredTheme } from '../../../utils/storage';
import { playFeedback } from '../../../utils/feedback';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (mode: ThemeMode) => {
      let isDark = true;
      if (mode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = mode === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };

    applyTheme(theme);
    setStoredTheme(theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const handleSelect = (mode: ThemeMode) => {
    playFeedback.click();
    setTheme(mode);
  };

  return (
    <div className="flex items-center gap-0.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
      <button
        type="button"
        onClick={() => handleSelect('light')}
        title="Light Mode"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-amber-400/20 text-amber-300'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleSelect('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleSelect('system')}
        title="System Preference"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
