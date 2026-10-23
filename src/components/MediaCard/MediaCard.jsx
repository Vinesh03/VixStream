import React, { useRef, useEffect, useState } from 'react';
import { Star, Heart, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import tmdbService from '../../services/tmdb';
import useStore from '../../store/useStore';

const MediaCard = ({
  item,
  mediaType,
  onFocus,
  autoFocus = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const { continueWatching } = useStore();
  const { isFavorite, addFavorite, removeFavorite } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);

  const effectiveMediaType = item.media_type || mediaType || 'movie';
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w342');
  const isFav = isFavorite(item.id, effectiveMediaType);

  useEffect(() => {
    if (autoFocus && cardRef.current) {
      cardRef.current.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  const handleClick = () => {
    navigate(`/details/${effectiveMediaType}/${item.id}`);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(item.id, effectiveMediaType);
    } else {
      addFavorite({
        ...item,
        media_type: effectiveMediaType
      });
    }
  };

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (effectiveMediaType === 'tv') {
      const saved = continueWatching.find(
        (w) => String(w.id) === String(item.id) && w.media_type === 'tv'
      );
      const season = saved?.season != null ? saved.season : 1;
      const episode = saved?.episode != null ? saved.episode : 1;
      navigate(`/player/tv/${item.id}/${season}/${episode}`);
      return;
    }
    navigate(`/player/${effectiveMediaType}/${item.id}`);
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onClick={handleClick}
      onFocus={onFocus}
      className={`card card-interactive tv-focusable group cursor-pointer relative overflow-hidden flex flex-col ${className}`}
    >
      <div className="relative aspect-[2/3] bg-secondary overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 skeleton rounded-none" />}
        <img
          src={posterUrl}
          alt={title}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder.svg';
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
        />

        {rating && rating !== '0.0' && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 border border-white/10 text-yellow-400 text-xs font-semibold shadow-md">
            <Star className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}

        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 z-20 p-2 rounded-full transition-all active:scale-90 ${
            isFav
              ? 'bg-red-500/90 text-white shadow-lg'
              : 'bg-black/65 text-white/80 hover:bg-black/90 hover:text-white border border-white/10 opacity-90'
          }`}
          aria-label={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handlePlay}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 group-hover:scale-110 z-10"
          aria-label="Riproduci ora"
          title="Riproduci ora"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      </div>

      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <h3
          className="font-medium text-white text-[13px] leading-snug line-clamp-2 min-h-[2.4em]"
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
          <span>{year || '—'}</span>
          <span className="uppercase text-[9.5px] tracking-wider px-1.5 py-0.5 rounded bg-white/5 font-mono">
            {effectiveMediaType === 'tv' ? 'Serie' : 'Film'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
