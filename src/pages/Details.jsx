import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Play, Heart, Clock, ArrowLeft } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useStore from '../store/useStore';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import MediaGrid from '../components/MediaGrid/MediaGrid';

const Details = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isFavorite, addFavorite, removeFavorite } = useStore();
  const isFav = details ? isFavorite(details.id, mediaType) : false;

  useEffect(() => {
    loadDetails();
  }, [id, mediaType]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = mediaType === 'movie'
        ? await tmdbService.getMovieDetails(id)
        : await tmdbService.getTVShowDetails(id);
      
      setDetails(data);

      if (mediaType === 'tv' && data.seasons) {
        setSeasons(data.seasons.filter(s => s.season_number > 0));
        setSelectedSeason(data.seasons.find(s => s.season_number > 0));
      }
    } catch (err) {
      console.error('Error loading details:', err);
      setError('Impossibile caricare i dettagli. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (mediaType === 'movie') {
      navigate(`/player/movie/${id}`);
    } else if (selectedSeason) {
      navigate(`/player/tv/${id}/${selectedSeason.season_number}/1`);
    }
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(details.id, mediaType);
    } else {
      addFavorite({
        ...details,
        media_type: mediaType
      });
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento dettagli..." />;
  }

  if (error || !details) {
    return <ErrorMessage message={error} onRetry={loadDetails} fullScreen />;
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
  const runtime = details.runtime || details.episode_run_time?.[0];
  const backdropUrl = tmdbService.getImageUrl(details.backdrop_path, 'original');
  const posterUrl = tmdbService.getImageUrl(details.poster_path, 'w500');

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/30" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors tv-focusable"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={title}
                className="w-48 rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{rating}</span>
                </div>
                {year && <span>{year}</span>}
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{runtime} min</span>
                  </div>
                )}
                {details.genres?.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-secondary rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handlePlay}
                  className="btn-primary flex items-center gap-2 text-lg"
                >
                  <Play className="w-6 h-6" />
                  Riproduci
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center gap-2 ${
                    isFav ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Rimuovi' : 'Aggiungi'}
                </button>
              </div>

              {details.overview && (
                <div className="max-w-3xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Trama</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 space-y-12">
        {/* Seasons (for TV shows) */}
        {mediaType === 'tv' && seasons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Stagioni</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {seasons.map(season => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all tv-focusable ${
                    selectedSeason?.id === season.id
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-gray-300 hover:bg-secondary-light'
                  }`}
                >
                  Stagione {season.season_number}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Similar Content */}
        {details.similar?.results?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Contenuti simili</h2>
            <MediaGrid 
              items={details.similar.results.slice(0, 12)} 
              mediaType={mediaType}
            />
          </section>
        )}

        {/* Recommendations */}
        {details.recommendations?.results?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Consigliati per te</h2>
            <MediaGrid 
              items={details.recommendations.results.slice(0, 12)} 
              mediaType={mediaType}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Details;
