
import React, { useMemo } from 'react';

interface PageHeaderProps {
  image: string;
  title: string;
  subtitle?: string;
}

// Define an array of subtle, feminine filter classes
const FEMININE_FILTERS = [
  'bg-pink-300/20 mix-blend-soft-light',
  'bg-purple-300/20 mix-blend-soft-light',
  'bg-rose-400/15 mix-blend-overlay',
  'bg-sky-200/20 mix-blend-soft-light',
  'bg-amber-200/15 mix-blend-overlay',
  'bg-violet-300/20 mix-blend-soft-light',
];

const PageHeader: React.FC<PageHeaderProps> = ({ image, title, subtitle }) => {
  if (!image) return null;

  // Randomly select one filter class when the component mounts
  const randomFilterClass = useMemo(() => FEMININE_FILTERS[Math.floor(Math.random() * FEMININE_FILTERS.length)], []);

  return (
    <div className="relative aspect-[16/9] w-full mb-8 rounded-lg overflow-hidden shadow-lg border border-[var(--color-border)]">
      <img src={image} alt="Header background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
      
      {/* Randomized Feminine Filter Overlay */}
      <div className={`absolute inset-0 ${randomFilterClass}`}></div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-gray-200" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;