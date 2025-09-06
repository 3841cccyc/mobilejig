import React, { createContext, useState, useContext, useMemo, ReactNode, useEffect } from 'react';

// 定义支持的主题颜色 (使用 HSL 格式，符合你的 shadcn/ui 配置)
export const themes = {
  blue: { '--primary': '221.2 83.2% 53.3%', '--primary-foreground': '210 40% 98%' },
  green: { '--primary': '142.1 76.2% 36.3%', '--primary-foreground': '142.1 76.2% 96.3%' },
  purple: { '--primary': '262.1 83.3% 57.8%', '--primary-foreground': '262.1 83.3% 97.8%' },
  orange: { '--primary': '24.6 95% 53.1%', '--primary-foreground': '24.6 95% 98.1%' },
};

type ThemeName = keyof typeof themes;

interface SettingsState {
  isMusicOn: boolean;
  isSfxOn: boolean;
  theme: ThemeName;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setTheme: (theme: ThemeName) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isSfxOn, setIsSfxOn] = useState(true);
  const [theme, setTheme] = useState<ThemeName>('blue');

  const toggleMusic = () => setIsMusicOn(prev => !prev);
  const toggleSfx = () => setIsSfxOn(prev => !prev);

  const applyTheme = (themeName: ThemeName) => {
    const themeColors = themes[themeName];
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setTheme(themeName);
  };
  
  // 初始化时应用默认主题
  useEffect(() => {
    applyTheme('blue');
  }, []);

  const value = useMemo(() => ({
    isMusicOn,
    isSfxOn,
    theme,
    toggleMusic,
    toggleSfx,
    setTheme: applyTheme,
  }), [isMusicOn, isSfxOn, theme]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};