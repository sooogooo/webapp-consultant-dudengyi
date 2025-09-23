import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AppSettings, ThemeName, FontSize, AIPersonality, AIVerbosity } from './types.ts';

interface SettingsContextType extends AppSettings {
  setTheme: (theme: ThemeName) => void;
  setFontSize: (size: FontSize) => void;
  setAIPersonality: (personality: AIPersonality) => void;
  setAIVerbosity: (verbosity: AIVerbosity) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const themes: Record<ThemeName, Record<string, string>> = {
  default: { // Dark theme
    '--color-background': '#111827',
    '--color-surface': '#1f2937',
    '--color-primary': '#3b82f6',
    '--color-primary-hover': '#2563eb',
    '--color-text-base': '#e5e7eb',
    '--color-text-muted': '#9ca3af',
    '--color-border': '#374151',
    '--color-danger': '#ef4444',
    '--color-success': '#22c55e',
    '--color-warning': '#facc15',
    '--color-info': '#60a5fa',
  },
  mint: { // 薄荷微风
    '--color-background': '#f0fdfa',
    '--color-surface': '#ffffff',
    '--color-primary': '#10b981',
    '--color-primary-hover': '#059669',
    '--color-text-base': '#1f2937',
    '--color-text-muted': '#6b7280',
    '--color-border': '#d1d5db',
    '--color-danger': '#ef4444',
    '--color-success': '#10b981',
    '--color-warning': '#f59e0b',
    '--color-info': '#3b82f6',
  },
  peach: { // 蜜桃苏打
    '--color-background': '#fff7f5',
    '--color-surface': '#ffffff',
    '--color-primary': '#f97316',
    '--color-primary-hover': '#ea580c',
    '--color-text-base': '#374151',
    '--color-text-muted': '#6b7280',
    '--color-border': '#fbcfe8',
    '--color-danger': '#ef4444',
    '--color-success': '#22c55e',
    '--color-warning': '#f59e0b',
    '--color-info': '#3b82f6',
  },
  lavender: { // 薰衣草梦境
    '--color-background': '#f5f3ff',
    '--color-surface': '#ffffff',
    '--color-primary': '#8b5cf6',
    '--color-primary-hover': '#7c3aed',
    '--color-text-base': '#374151',
    '--color-text-muted': '#6b7280',
    '--color-border': '#ddd6fe',
    '--color-danger': '#ef4444',
    '--color-success': '#22c55e',
    '--color-warning': '#f59e0b',
    '--color-info': '#3b82f6',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings ? JSON.parse(savedSettings) : {
        theme: 'mint',
        fontSize: 'md',
        aiPersonality: 'serious',
        aiVerbosity: 'detailed',
      };
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return {
        theme: 'mint',
        fontSize: 'md',
        aiPersonality: 'serious',
        aiVerbosity: 'detailed',
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themes[settings.theme];
    for (const [key, value] of Object.entries(selectedTheme)) {
      root.style.setProperty(key, value);
    }

    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(`font-size-${settings.fontSize}`);

  }, [settings.theme, settings.fontSize]);

  const value = useMemo(() => ({
    ...settings,
    setTheme: (theme: ThemeName) => setSettings(s => ({ ...s, theme })),
    setFontSize: (fontSize: FontSize) => setSettings(s => ({ ...s, fontSize })),
    setAIPersonality: (aiPersonality: AIPersonality) => setSettings(s => ({ ...s, aiPersonality })),
    setAIVerbosity: (aiVerbosity: AIVerbosity) => setSettings(s => ({ ...s, aiVerbosity })),
  }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};