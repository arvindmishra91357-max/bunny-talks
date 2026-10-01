import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'coral' | 'purple' | 'mint';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  accent: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: AccentColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('bunny_theme') as Theme) || 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('bunny_accent') as AccentColor) || 'coral';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let dark = theme === 'dark';
      if (theme === 'system') {
        dark = mediaQuery.matches;
      }
      setIsDark(dark);
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('bunny_theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem('bunny_accent', newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, accent, setTheme, setAccent, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
