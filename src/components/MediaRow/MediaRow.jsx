import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MediaCard from '../MediaCard/MediaCard';

const MediaRow = ({ title, icon: Icon, items = [], mediaType = 'movie', viewAllLink = null, renderOverlay = null }) => {
  const scrollerRef = useRef(null);

  if (!items || items.length === 0) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.78), behavior: 'smooth' });
  };

  return (
    <section className="relative group/row">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-accent" />}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollBy(-1)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 transition-colors"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 transition-colors"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-xs text-gray-400 hover:text-accent flex items-center gap-0.5 py-1">
              Tutti <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-2"
      >
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="w-[138px] sm:w-[156px] md:w-[172px] flex-shrink-0 snap-start relative group/cw"
          >
            <MediaCard item={item} mediaType={item.media_type || mediaType} />
            {renderOverlay && renderOverlay(item)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MediaRow;
