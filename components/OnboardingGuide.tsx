

import React, { useState, useLayoutEffect, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TourStep } from '../types.ts';

// Corrected XMarkIcon using a standard, filled path
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);


interface HighlightStyle {
  width: number;
  height: number;
  top: number;
  left: number;
}

interface PopoverStyle {
  top: number;
  left: number;
  transform: string;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose, steps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<PopoverStyle | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const currentStep = steps[currentStepIndex];

  const calculatePositions = useCallback(() => {
    if (!isOpen || !currentStep) return;

    if (currentStep.position === 'center' || !currentStep.selector) {
      setHighlightStyle(null);
      const popoverTop = window.innerHeight / 2;
      const popoverLeft = window.innerWidth / 2;
      setPopoverStyle({ top: popoverTop, left: popoverLeft, transform: 'translate(-50%, -50%)'});
      return;
    }

    const targetElement = document.querySelector<HTMLElement>(currentStep.selector);
    if (!targetElement) {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(i => i + 1);
        } else {
            onClose();
        }
        return;
    }
    
    const targetRect = targetElement.getBoundingClientRect();
    const padding = 10;
    const newHighlightStyle: HighlightStyle = {
      width: targetRect.width + padding,
      height: targetRect.height + padding,
      top: targetRect.top - padding / 2,
      left: targetRect.left - padding / 2,
    };
    setHighlightStyle(newHighlightStyle);

    if (popoverRef.current) {
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const popoverOffset = 16;
        const viewportPadding = 16;
        let { position } = currentStep;

        const space = {
            top: targetRect.top - viewportPadding,
            bottom: window.innerHeight - targetRect.bottom - viewportPadding,
            left: targetRect.left - viewportPadding,
            right: window.innerWidth - targetRect.right - viewportPadding,
        };
        
        // Flip if not enough space based on preferred position
        if (position === 'bottom' && space.bottom < popoverRect.height) position = 'top';
        if (position === 'top' && space.top < popoverRect.height) position = 'bottom';
        if (position === 'right' && space.right < popoverRect.width) position = 'left';
        if (position === 'left' && space.left < popoverRect.width) position = 'right';

        let top = 0, left = 0, transform = '';

        switch (position) {
            case 'top':
                top = newHighlightStyle.top - popoverOffset;
                left = newHighlightStyle.left + newHighlightStyle.width / 2;
                transform = 'translate(-50%, -100%)';
                break;
            case 'left':
                top = newHighlightStyle.top + newHighlightStyle.height / 2;
                left = newHighlightStyle.left - popoverOffset;
                transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                top = newHighlightStyle.top + newHighlightStyle.height / 2;
                left = newHighlightStyle.left + newHighlightStyle.width + popoverOffset;
                transform = 'translateY(-50%)';
                break;
            case 'bottom':
            default:
                top = newHighlightStyle.top + newHighlightStyle.height + popoverOffset;
                left = newHighlightStyle.left + newHighlightStyle.width / 2;
                transform = 'translateX(-50%)';
                break;
        }

        // --- Keep inside viewport (robust logic) ---
        let finalTop = top;
        let finalLeft = left;

        const popoverWidth = popoverRect.width;
        const popoverHeight = popoverRect.height;
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        // Calculate the popover's bounding box based on its anchor (top,left) and transform
        let effectiveTop = top;
        let effectiveLeft = left;

        if (transform.includes('translateY(-50%)')) effectiveTop -= popoverHeight / 2;
        else if (transform.includes('translateY(-100%)')) effectiveTop -= popoverHeight;
        
        if (transform.includes('translateX(-50%)')) effectiveLeft -= popoverWidth / 2;
        else if (transform.includes('translateX(-100%)')) effectiveLeft -= popoverWidth;

        const effectiveRight = effectiveLeft + popoverWidth;
        const effectiveBottom = effectiveTop + popoverHeight;

        // Adjust horizontally
        if (effectiveLeft < viewportPadding) {
            finalLeft += viewportPadding - effectiveLeft;
        }
        if (effectiveRight > winWidth - viewportPadding) {
            finalLeft -= effectiveRight - (winWidth - viewportPadding);
        }

        // Adjust vertically
        if (effectiveTop < viewportPadding) {
            finalTop += viewportPadding - effectiveTop;
        }
        if (effectiveBottom > winHeight - viewportPadding) {
            finalTop -= effectiveBottom - (winHeight - viewportPadding);
        }
        
        setPopoverStyle({ top: finalTop, left: finalLeft, transform });
    }

  }, [isOpen, currentStep, currentStepIndex, steps.length, onClose]);
  

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  }, [currentStepIndex, steps.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  useLayoutEffect(() => {
    const timer = setTimeout(() => calculatePositions(), 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex, calculatePositions]);

  useEffect(() => {
    if (!isOpen) return;
    const handleResizeAndScroll = () => calculatePositions();
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('resize', handleResizeAndScroll);
    window.addEventListener('scroll', handleResizeAndScroll, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('resize', handleResizeAndScroll);
        window.removeEventListener('scroll', handleResizeAndScroll, true);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, calculatePositions, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const guideContent = (
    <div className="fixed inset-0 z-[1000]" aria-modal="true" role="dialog">
      <div 
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
      />
      
      {highlightStyle && (
        <div
          className="fixed bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] backdrop-blur-[2px] transition-all duration-300 ease-in-out"
          style={{
            width: `${highlightStyle.width}px`,
            height: `${highlightStyle.height}px`,
            top: `${highlightStyle.top}px`,
            left: `${highlightStyle.left}px`,
          }}
        />
      )}
      
      {!highlightStyle && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      )}

      <div
        ref={popoverRef}
        className={`fixed w-80 bg-[var(--color-surface)] text-[var(--color-text-base)] rounded-lg shadow-2xl p-6 transition-all duration-300 ease-in-out border border-[var(--color-border)] ${popoverStyle ? 'opacity-100' : 'opacity-0'}`}
        style={popoverStyle || { top: -9999, left: -9999 }} 
        role="document"
      >
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 pr-8">{currentStep.title}</h3>
        <p className="text-[var(--color-text-muted)] mb-6">{currentStep.content}</p>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-background)] rounded-md transition-colors"
                aria-label="跳过教程"
              >
                跳过
              </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">{`${currentStepIndex + 1} / ${steps.length}`}</span>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] bg-transparent hover:bg-[var(--color-background)] rounded-md transition-colors"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {currentStepIndex === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:bg-[var(--color-background)] transition-colors" aria-label="关闭教程">
            <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(guideContent, document.body);
};

export default OnboardingGuide;