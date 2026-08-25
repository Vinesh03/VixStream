import React, { useRef, useEffect } from 'react';
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
  const { isFavorite, addFavorite, removeFavorite } = useStore();
  
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const posterUrl = tmdbService.getImageUrl(item.poster_path, 'w500');
  const isFav = isFavorite(item.id, mediaType);

  useEffect(() => {
    if (autoFocus && cardRef.current) {
      // preventScroll: evita che la pagina salti fino alla card all'avvio
      cardRef.current.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  const handleClick = () => {
    navigate(`/details/${mediaType}/${item.id}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(item.id, mediaType);
    } else {
      addFavorite({
        ...item,
        media_type: mediaType
      });
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/player/${mediaType}/${item.id}`);
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onClick={handleClick}
      onFocus={onFocus}
      className={`card card-interactive tv-focusable group cursor-pointer ${className}`}
    >
      <div className="relative aspect-[2/3] bg-secondary">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder.svg';
          }}
        />
        
        {/* Overlay on hover/focus */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">{rating}</span>
              </div>
              <button
                onClick={handleFavorite}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                aria-label={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              >
                <Heart 
                  className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
            </div>
            
            <button
              onClick={handlePlay}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Riproduci
            </button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3
          className="font-semibold text-white line-clamp-2 leading-snug mb-1 min-h-[2.6em]"
          title={title}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          {year}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
