
import React from 'react';

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  description?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, description }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-lg shadow-xl flex flex-col items-center justify-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-1 bg-[var(--color-surface)] rounded-full text-[var(--color-text-base)] hover:bg-opacity-80 shadow-lg"
          aria-label="Close image view"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        <figure>
            <img
              src={imageUrl}
              alt={description || 'Full-size view'}
              className="object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: '90vh' }}
            />
            {description && (
              <figcaption className="mt-3 text-center text-white text-lg font-medium" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                {description}
              </figcaption>
            )}
        </figure>
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
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
              animation: scale-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default ImageModal;
