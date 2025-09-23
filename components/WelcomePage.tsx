import React, { useState, useEffect } from 'react';
import { DISCLAIMER_TEXT } from '../constants.ts';

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const AGREEMENT_TIMESTAMP_KEY = 'agreementTimestamp';
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const savedTimestamp = localStorage.getItem(AGREEMENT_TIMESTAMP_KEY);
    if (savedTimestamp) {
      const time = parseInt(savedTimestamp, 10);
      if (Date.now() - time < FORTY_EIGHT_HOURS_MS) {
        setAgreed(true);
      } else {
        localStorage.removeItem(AGREEMENT_TIMESTAMP_KEY);
      }
    }
  }, []);

  const handleStart = () => {
    if (agreed) {
      localStorage.setItem(AGREEMENT_TIMESTAMP_KEY, Date.now().toString());
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 py-12 md:py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-base)] mb-4">
          欢迎来到倩倩的美学小屋~ 🏠
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-8">
          你好呀~ 准备好一起探索变美的无限可能了吗？别担心，我会像闺蜜一样陪着你，先告诉我一些你的小秘密吧！😉
        </p>
        
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-bold text-[var(--color-text-base)] mb-3">💖 重要的小约定</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">{DISCLAIMER_TEXT}</p>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              className="w-5 h-5 bg-[var(--color-background)] border-[var(--color-border)] rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] ring-offset-[var(--color-surface)]"
            />
            <span className="text-[var(--color-text-base)]">嗯嗯，我明白啦，我们开始吧！</span>
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={!agreed}
          className="w-full md:w-auto px-12 py-4 bg-[var(--color-primary)] text-white font-bold rounded-lg text-lg hover:bg-[var(--color-primary-hover)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/50 transform hover:scale-105 disabled:hover:scale-100"
        >
          开启我的变美之旅！✨
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;