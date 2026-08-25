import React from 'react';
import MediaCard from '../MediaCard/MediaCard';
import MediaGridSkeleton from '../Common/MediaGridSkeleton';
import Loading from '../Common/Loading';

const MediaGrid = ({ 
  items = [], 
  mediaType = 'movie',
  mediaTypeOverride = false,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return <MediaGridSkeleton />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Nessun contenuto disponibile</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}
        >
          <MediaCard
            item={item}
            mediaType={mediaTypeOverride ? (item.media_type || mediaType) : mediaType}
            autoFocus={index === 0}
          />
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
