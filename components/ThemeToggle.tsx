'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    setAnimating(true);
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTimeout(() => setAnimating(false), 500);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="fixed top-5 right-5 z-50 p-2.5 rounded-xl
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
        border border-gray-200/60 dark:border-gray-700/60
        shadow-soft hover:shadow-medium
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        group"
    >
      <div className={animating ? 'animate-icon-spin' : ''}>
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600 transition-colors" />
        )}
      </div>
    </button>
  );
}
