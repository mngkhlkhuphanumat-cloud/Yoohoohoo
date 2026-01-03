
import React from 'react';

interface FloatingTriggerProps {
  isActive: boolean;
  onClick: () => void;
  isCapturing: boolean;
}

export const FloatingTrigger: React.FC<FloatingTriggerProps> = ({ isActive, onClick, isCapturing }) => {
  return (
    <button
      onClick={onClick}
      aria-label={isActive ? "Close AI Dashboard" : "Open AI Dashboard"}
      className={`fixed top-4 left-4 z-[100] w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-90 shadow-2xl
        ${isActive 
          ? 'bg-white text-black rotate-180 border-transparent shadow-white/20' 
          : 'bg-black text-cyan-400 border border-cyan-500/30 shadow-cyan-500/20 hover:border-cyan-400'}
        `}
    >
      {isActive ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
          </svg>
          {isCapturing && (
            <span className="absolute -top-2 -right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </div>
      )}
    </button>
  );
};
