

import React from 'react';
import { useSettings } from '../SettingsContext.tsx';
import { ThemeName, FontSize, AIPersonality, AIVerbosity } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    theme, setTheme,
    fontSize, setFontSize,
    aiPersonality, setAIPersonality,
    aiVerbosity, setAIVerbosity
  } = useSettings();

  if (!isOpen) return null;

  const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-4 border-b border-[var(--color-border)] sm:flex sm:items-center sm:justify-between">
      <span className="font-medium text-[var(--color-text-base)]">{label}</span>
      <div className="mt-2 sm:mt-0 flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );

  const themeOptions: { value: ThemeName; label: string }[] = [
    { value: 'default', label: '神秘深色' },
    { value: 'mint', label: '薄荷微风' },
    { value: 'peach', label: '蜜桃苏打' },
    { value: 'lavender', label: '薰衣草梦境' },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'sm', label: '小' }, { value: 'md', label: '中' }, { value: 'lg', label: '大' }
  ];
  
  const personalityOptions: { value: AIPersonality; label: string }[] = [
    { value: 'playful', label: '俏皮可爱' },
    { value: 'serious', label: '严肃认真' },
    { value: 'enthusiastic', label: '热情话痨' },
  ];
  
  const verbosityOptions: { value: AIVerbosity; label: string }[] = [
    { value: 'concise', label: '言简意赅' },
    { value: 'detailed', label: '深入浅出' },
    { value: 'medical', label: '严谨医学' },
  ];

  const renderOptionButtons = <T extends string>(
    options: { value: T, label: string }[], 
    currentValue: T, 
    setter: (value: T) => void
  ) => (
    options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setter(value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            currentValue === value 
              ? 'bg-[var(--color-primary)] text-white font-semibold' 
              : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-base)]'
          }`}
        >
          {label}
        </button>
      ))
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">界面设置</h2>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-background)]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
            <SettingRow label="皮肤配色">
              {renderOptionButtons(themeOptions, theme, setTheme)}
            </SettingRow>
            <SettingRow label="字号">
              {renderOptionButtons(fontSizeOptions, fontSize, setFontSize)}
            </SettingRow>
            <SettingRow label="AI 对话风格">
               {renderOptionButtons(personalityOptions, aiPersonality, setAIPersonality)}
            </SettingRow>
            <SettingRow label="AI 内容严谨性">
               {renderOptionButtons(verbosityOptions, aiVerbosity, setAIVerbosity)}
            </SettingRow>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;