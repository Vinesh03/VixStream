import React, { useEffect, useState } from 'react';
import { TrendingUp, Film, Tv, Star } from 'lucide-react';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import useStore from '../store/useStore';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { continueWatching } = useStore();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trending, popular, topRated, trendingTvShows] = await Promise.all([
        tmdbService.getTrending('movie', 'week'),
        tmdbService.getPopularMovies(),
        tmdbService.getTopRatedMovies(),
        tmdbService.getTrending('tv', 'week')
      ]);

      setTrendingMovies(trending.results?.slice(0, 12) || []);
      setPopularMovies(popular.results?.slice(0, 12) || []);
      setTopRatedMovies(topRated.results?.slice(0, 12) || []);
      setTrendingTV(trendingTvShows.results?.slice(0, 12) || []);
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
              <div className="max-w-2xl">
                <h1 className="text-5xl font-bold text-white mb-4">
                  Benvenuto su VixSrc
                </h1>
                <p className="text-xl text-gray-200 mb-6">
                  Scopri migliaia di film e serie TV in streaming
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 space-y-12 -mt-24 relative z-10">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Film className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">Continua a guardare</h2>
            </div>
            <MediaGrid 
              items={continueWatching.map(item => ({
                ...item,
                id: item.id,
                poster_path: item.poster_path,
                title: item.title,
                name: item.name
              }))} 
              mediaType="movie"
            />
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

        {/* Popular Movies */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Film popolari</h2>
          </div>
          <MediaGrid items={popularMovies} mediaType="movie" />
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
