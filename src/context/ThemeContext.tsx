/**
 * Theme Context & Provider
 * Supports Dark, Light, and System (Android auto-sync) modes with HTML class management.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextValue {
  themeMode: ThemeMode;
  actualTheme: 'dark' | 'light';
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const THEME_STORAGE_KEY = 'deckstream_theme_mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved && ['dark', 'light', 'system'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dark'; // Default to dark for broadcast studio
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const actualTheme: 'dark' | 'light' =
    themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  // Apply to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (actualTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Update meta theme-color for Android status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#090a0f' : '#f8fafc');
    }
  }, [actualTheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeModeState(prev => {
      let next: ThemeMode;
      if (prev === 'dark') next = 'light';
      else if (prev === 'light') next = 'system';
      else next = 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    themeMode,
    actualTheme,
    setThemeMode,
    cycleTheme,
  }), [themeMode, actualTheme, setThemeMode, cycleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
