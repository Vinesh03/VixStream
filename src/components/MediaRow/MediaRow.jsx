import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MediaCard from '../MediaCard/MediaCard';

const MediaRow = ({ title, icon: Icon, items = [], mediaType = 'movie', viewAllLink = null, renderOverlay = null }) => {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 12);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  };

  useEffect(() => {
    updateEdges();
  }, [items]);

  if (!items || items.length === 0) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.78), behavior: 'smooth' });
  };

  const onMouseDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollStart.current = el.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 6) {
      el.scrollLeft = scrollStart.current - walk;
    }
  };

  const onMouseUp = () => {
    isDown.current = false;
  };

  return (
    <section className="relative group/row select-none">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-5 h-5 text-accent flex-shrink-0" />}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-25 text-gray-300 transition-all active:scale-90"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-25 text-gray-300 transition-all active:scale-90"
            aria-label="Scorri a destra"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-xs text-gray-400 hover:text-accent flex items-center gap-0.5 py-1 pl-1">
              Tutti <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-proximity px-4 pb-2 scroll-smooth"
      >
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="w-[140px] sm:w-[156px] md:w-[172px] flex-shrink-0 snap-start relative group/cw"
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
