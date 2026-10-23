import React from 'react';
import { Clock, Trash2, X, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import MediaCard from '../components/MediaCard/MediaCard';

const ContinueWatching = () => {
  const { continueWatching, removeContinueWatching } = useStore();

  const handleRemove = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    removeContinueWatching(item.id, item.media_type, item.season, item.episode);
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Clock className="w-7 h-7 text-accent" />
          <h1 className="text-2xl font-bold text-white">Continua a guardare</h1>
        </div>
        {continueWatching.length > 0 && (
          <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full font-mono">
            {continueWatching.length} contenut{continueWatching.length !== 1 ? 'i' : 'o'}
          </span>
        )}
      </div>

      {continueWatching.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {continueWatching.map((item, index) => (
            <div key={`${item.id}-${index}`} className="relative group/cw">
              <MediaCard
                item={item}
                mediaType={item.media_type}
                autoFocus={index === 0}
              />
              
              {/* Barra di avanzamento precisa */}
              {item.progress > 0 && (
                <div className="absolute top-[calc(100%*(2/3)-4px)] left-2 right-2 h-1 bg-gray-700/90 rounded-full overflow-hidden pointer-events-none z-10">
                  <div 
                    className="h-full bg-accent"
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  />
                </div>
              )}

              {/* Tasto rimozione istantaneo senza confirm */}
              <button
                onClick={(e) => handleRemove(e, item)}
                className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-red-600 active:scale-90 transition-all border border-white/10"
                title="Rimuovi da Continua a guardare"
                aria-label="Rimuovi da Continua a guardare"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card max-w-md mx-auto p-8 border border-white/5">
          <Clock className="w-14 h-14 text-gray-600 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold text-white mb-1.5">
            Nessun contenuto in corso
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            I film e gli episodi che inizi a guardare compariranno qui automaticamente per riprenderli al volo.
          </p>
          <Link to="/" className="btn-primary text-sm inline-flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            Esplora catalogo
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
