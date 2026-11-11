import React, { createContext, useContext, useEffect, useState } from 'react';
import { DESIGN_TOKENS } from '../design/tokens';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  dynamicArtworkColor: string | null;
  setDynamicArtworkColor: (color: string | null) => void;
  effectiveAccent: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('liquid_glass_theme_mode');
    return (saved as ThemeMode) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('liquid_glass_accent_color') || '';
  });

  const [dynamicArtworkColor, setDynamicArtworkColor] = useState<string | null>(null);

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('liquid_glass_theme_mode', mode);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('liquid_glass_accent_color', color);
  };

  const defaultAccent = isDark
    ? DESIGN_TOKENS.colors.dark.accent
    : DESIGN_TOKENS.colors.light.accent;

  const effectiveAccent = dynamicArtworkColor || accentColor || defaultAccent;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        isDark,
        accentColor,
        setAccentColor,
        dynamicArtworkColor,
        setDynamicArtworkColor,
        effectiveAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
