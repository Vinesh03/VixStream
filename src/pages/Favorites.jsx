import React from 'react';
import { Heart } from 'lucide-react';
import useStore from '../store/useStore';
import MediaGrid from '../components/MediaGrid/MediaGrid';

const Favorites = () => {
  const { favorites } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-accent fill-accent" />
        <h1 className="text-3xl font-bold text-white">I miei preferiti</h1>
      </div>

      {favorites.length > 0 ? (
        <>
          <p className="text-gray-400 mb-6">
            {favorites.length} contenut{favorites.length !== 1 ? 'i' : 'o'} nei preferiti
          </p>
          <MediaGrid 
            items={favorites} 
            mediaType="movie" // Will be overridden by item's media_type
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Nessun preferito ancora
          </h2>
          <p className="text-gray-400">
            Aggiungi film e serie TV ai tuoi preferiti per trovarli facilmente
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
