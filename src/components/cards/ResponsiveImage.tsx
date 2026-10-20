import React, { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  aspectRatioClass?: string;
  showMatchBadge?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectRatioClass = 'aspect-square',
  showMatchBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${aspectRatioClass}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
      )}

      {/* Actual Image or Fallback */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#70798B] p-2 text-center select-none w-full h-full bg-[#F6F7FB]">
          <div className="w-8 h-8 rounded-full bg-[#E8EEFF] text-[#3559C7] flex items-center justify-center mb-1">
            <ImageOff className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-[#70798B] max-w-[80px] truncate">No photo preview</span>
        </div>
      )}

      {/* Suggested Match Badge on Image */}
      {showMatchBadge && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-amber-500/95 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded text-center flex items-center justify-center gap-0.5 shadow-sm">
          <Sparkles className="w-2.5 h-2.5" />
          <span className="truncate">Sample Match</span>
        </div>
      )}
    </div>
  );
};
