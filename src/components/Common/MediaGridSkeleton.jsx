import React from 'react';

/**
 * Skeleton grid elegante per il caricamento delle card.
 * Stessa struttura della griglia reale: niente salti di layout al termine.
 */
const MediaGridSkeleton = ({ count = 12, className = '' }) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}
      aria-busy="true"
      aria-label="Caricamento"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3.5 w-4/5 !rounded-md" />
            <div className="skeleton h-3 w-2/5 !rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGridSkeleton;
