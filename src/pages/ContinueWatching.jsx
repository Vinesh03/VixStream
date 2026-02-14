import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import MediaCard from '../components/MediaCard/MediaCard';

const ContinueWatching = () => {
  const { continueWatching, removeContinueWatching } = useStore();

  const handleRemove = (item) => {
    if (confirm('Rimuovere questo contenuto da "Continua a guardare"?')) {
      removeContinueWatching(item.id, item.media_type, item.season, item.episode);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold text-white">Continua a guardare</h1>
      </div>

      {continueWatching.length > 0 ? (
        <>
          <p className="text-gray-400 mb-6">
            {continueWatching.length} contenut{continueWatching.length !== 1 ? 'i' : 'o'} in corso
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative group">
                <MediaCard
                  item={item}
                  mediaType={item.media_type}
                  autoFocus={index === 0}
                />
                
                {/* Progress bar */}
                {item.progress > 0 && (
                  <div className="absolute bottom-20 left-3 right-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/70 hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Rimuovi"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Nessun contenuto in corso
          </h2>
          <p className="text-gray-400">
            Inizia a guardare film e serie TV per vederli apparire qui
          </p>
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
