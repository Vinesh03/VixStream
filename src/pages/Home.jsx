import React, { useEffect, useState } from 'react';
import { TrendingUp, Film, Tv, Star, Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import MediaCard from '../components/MediaCard/MediaCard';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import useStore from '../store/useStore';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { continueWatching, removeContinueWatching } = useStore();

  /** Rimuove un contenuto da "Continua a guardare" */
  const handleRemoveCW = (item) => {
    if (confirm(`Rimuovere "${item.title || item.name}" da Continua a guardare?`)) {
      removeContinueWatching(item.id, item.media_type, item.season, item.episode);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trending, topRated, onTheAir, nowPlayingMovies] = await Promise.all([
        tmdbService.getTrending('movie', 'week'),
        tmdbService.getTopRatedMovies(),
        tmdbService.getTrending('tv', 'week'),
        tmdbService.fetchFromTMDB('/movie/now_playing')
      ]);

      setTrendingMovies(trending.results?.slice(0, 12) || []);
      setTopRatedMovies(topRated.results?.slice(0, 12) || []);
      setTrendingTV(onTheAir.results?.slice(0, 12) || []);
      setNowPlaying(nowPlayingMovies.results?.slice(0, 12) || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Impossibile caricare i contenuti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento home..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadContent} fullScreen />;
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-b from-primary-dark to-primary overflow-hidden">
        {trendingMovies[0] && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${tmdbService.getImageUrl(trendingMovies[0].backdrop_path, 'original')})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
            
            <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
              <div className="max-w-2xl w-full">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 break-words">
                  Benvenuto su VixSrc
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-6">
                  Scopri migliaia di film e serie TV in streaming
                </p>
                <Link
                  to={`/details/movie/${trendingMovies[0].id}`}
                  className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3"
                >
                  <Play className="w-5 h-5" />
                  {trendingMovies[0].title || trendingMovies[0].name}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 space-y-12 -mt-12 relative z-10 pb-24">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Film className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">Continua a guardare</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {continueWatching.map((item, i) => (
                <div key={`${item.id}-${i}`} className="relative group/cw animate-slide-up" style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}>
                  <MediaCard item={item} mediaType={item.media_type || 'movie'} />
                  {/* barra progresso */}
                  {item.progress > 0 && (
                    <div className="absolute top-[calc(100%*(2/3)-6px)] left-3 right-3 h-1 bg-gray-700/80 rounded-full overflow-hidden pointer-events-none z-10">
                      <div className="h-full bg-accent" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>
                  )}
                  {/* X rimozione */}
                  <button
                    onClick={() => handleRemoveCW(item)}
                    aria-label="Rimuovi da Continua a guardare"
                    title="Rimuovi da Continua a guardare"
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/70 hover:bg-red-600 opacity-0 group-hover/cw:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Now Playing */}
        {nowPlaying.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">Al cinema ora</h2>
            </div>
            <MediaGrid items={nowPlaying} mediaType="movie" />
          </section>
        )}

        {/* Trending Movies */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Film di tendenza</h2>
          </div>
          <MediaGrid items={trendingMovies} mediaType="movie" />
        </section>

        {/* Trending TV Shows */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Tv className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Serie TV di tendenza</h2>
          </div>
          <MediaGrid items={trendingTV} mediaType="tv" />
        </section>

        {/* Top Rated Movies */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Film più votati</h2>
          </div>
          <MediaGrid items={topRatedMovies} mediaType="movie" />
        </section>
      </div>
    </div>
  );
};

export default Home;
