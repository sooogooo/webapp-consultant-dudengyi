import React from 'react';
import Spinner from '../shared/Spinner.tsx';

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  explanation: string;
  isLoading: boolean;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const KeywordModal: React.FC<KeywordModalProps> = ({ isOpen, onClose, keyword, explanation, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-xl p-6 border border-[var(--color-border)] transform animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">{keyword}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-background)]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="min-h-[100px] text-[var(--color-text-base)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
              <Spinner size="md" />
              <p className="text-[var(--color-text-muted)]">AI 正在为您解析...</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{explanation}</p>
          )}
        </div>
        
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
            @keyframes scale-in {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
                animation: scale-in 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};

export default KeywordModal;