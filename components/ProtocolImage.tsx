import React, { useState } from 'react';

interface ProtocolImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  expandable?: boolean;
}

export const ProtocolImage: React.FC<ProtocolImageProps> = ({
  src,
  alt,
  caption,
  className = '',
  expandable = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
        <span className="material-symbols-outlined text-2xl mb-2 block">broken_image</span>
        Image unavailable
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 animate-spin">progress_activity</span>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onClick={() => expandable && setIsExpanded(true)}
          className={`rounded-lg w-full max-h-64 object-contain border border-slate-200 dark:border-slate-700 ${
            expandable ? 'cursor-zoom-in hover:opacity-90 transition-opacity' : ''
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
        {caption && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center italic">
            {caption}
          </p>
        )}
        {expandable && !isLoading && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">fullscreen</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
            onClick={() => setIsExpanded(false)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
};
