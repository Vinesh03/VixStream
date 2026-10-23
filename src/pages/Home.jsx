import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TrendingUp, Film, Tv, Star, Play, X, Clock, Flame, Film as MovieIcon, Youtube } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import MediaRow from '../components/MediaRow/MediaRow';
import PullToRefresh from '../components/Common/PullToRefresh';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import useStore from '../store/useStore';

const Home = () => {
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  
  const { continueWatching, removeContinueWatching } = useStore();

  const handleRemoveCW = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    removeContinueWatching(item.id, item.media_type, item.season, item.episode);
  };

  const loadContent = useCallback(async (force = false) => {
    try {
      if (force) tmdbService.clearCache();
      setLoading(true);
      setError(null);

      const [trending, topRated, onTheAir, nowPlayingMovies] = await Promise.all([
        tmdbService.getTrending('movie', 'week'),
        tmdbService.getTopRatedMovies(),
        tmdbService.getTrending('tv', 'week'),
        tmdbService.fetchFromTMDB('/movie/now_playing')
      ]);

      setTrendingMovies(trending.results?.slice(0, 16) || []);
      setTopRatedMovies(topRated.results?.slice(0, 16) || []);
      setTrendingTV(onTheAir.results?.slice(0, 16) || []);
      setNowPlaying(nowPlayingMovies.results?.slice(0, 16) || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Impossibile caricare i contenuti. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Rotazione automatica Hero ogni 7 secondi se l'utente non ha aperto un trailer
  useEffect(() => {
    if (trendingMovies.length <= 1 || trailerKey) return;
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % Math.min(trendingMovies.length, 5));
    }, 7000);
    return () => clearInterval(t);
  }, [trendingMovies.length, trailerKey]);

  const openTrailer = async (movie) => {
    try {
      const data = await tmdbService.fetchFromTMDB(`/movie/${movie.id}/videos`);
      const t = (data.results || []).find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      if (t?.key) setTrailerKey(t.key);
      else alert('Nessun trailer disponibile per questo titolo.');
    } catch {
      alert('Impossibile caricare il trailer.');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento catalogo..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => loadContent(true)} fullScreen />;
  }

  const heroItem = trendingMovies[heroIdx] || trendingMovies[0];

  return (
    <PullToRefresh onRefresh={() => loadContent(true)}>
      <div className="min-h-screen pb-20">
        {/* Hero Section Rotante */}
        {heroItem && (
          <div className="relative h-[50vh] md:h-[64vh] overflow-hidden bg-primary">
            <div 
              key={heroItem.id}
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-fade-in"
              style={{
                backgroundImage: `url(${tmdbService.getImageUrl(heroItem.backdrop_path, 'w780')})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/30 to-transparent" />
            
            <div className="relative container mx-auto px-4 h-full flex items-end pb-8 md:pb-12">
              <div className="max-w-xl w-full">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-2.5">
                  <Flame className="w-3.5 h-3.5" /> In primo piano #{heroIdx + 1}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                  {heroItem.title || heroItem.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-300 line-clamp-2 md:line-clamp-3 mb-5 max-w-lg leading-relaxed">
                  {heroItem.overview}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to={`/details/movie/${heroItem.id}`}
                    className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 shadow-lg active:scale-95 transition-transform"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Guarda ora
                  </Link>
                  <button
                    onClick={() => openTrailer(heroItem)}
                    className="btn-secondary inline-flex items-center gap-1.5 text-sm px-3.5 py-2.5 active:scale-95 transition-transform text-white/90"
                    title="Guarda il trailer su YouTube"
                  >
                    <Youtube className="w-4 h-4 text-red-500" />
                    Trailer
                  </button>
                  <button
                    onClick={() => navigate(`/details/movie/${heroItem.id}`)}
                    className="btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2.5 active:scale-95 transition-transform text-white/90"
                  >
                    Dettagli
                  </button>
                </div>

                {/* Dot indicator per hero rotante */}
                {trendingMovies.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-5">
                    {trendingMovies.slice(0, 5).map((m, idx) => (
                      <button
                        key={m.id}
                        onClick={() => setHeroIdx(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === heroIdx ? 'w-6 bg-accent' : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Vai al film ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Trailer YouTube in overlay */}
        {trailerKey && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in"
            onClick={() => setTrailerKey(null)}
          >
            <div
              className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setTrailerKey(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all active:scale-90"
                aria-label="Chiudi trailer"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Sezioni a Carosello Orizzontale */}
        <div className="space-y-8 mt-2">
          {/* Continua a guardare */}
          {continueWatching.length > 0 && (
            <MediaRow
              title="Continua a guardare"
              icon={Clock}
              items={continueWatching}
              viewAllLink="/continue-watching"
              renderOverlay={(item) => (
                <>
                  {item.progress > 0 && (
                    <div className="absolute top-[calc(100%*(2/3)-4px)] left-2 right-2 h-1 bg-gray-700/90 rounded-full overflow-hidden pointer-events-none z-10">
                      <div className="h-full bg-accent" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>
                  )}
                  <button
                    onClick={(e) => handleRemoveCW(e, item)}
                    aria-label="Rimuovi da Continua a guardare"
                    title="Rimuovi da Continua a guardare"
                    className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-red-600 active:scale-90 transition-all border border-white/10"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </>
              )}
            />
          )}

          {/* Al cinema ora */}
          {nowPlaying.length > 0 && (
            <MediaRow
              title="Al cinema ora"
              icon={Star}
              items={nowPlaying}
              mediaType="movie"
              viewAllLink="/movies"
            />
          )}

          {/* Film di tendenza */}
          <MediaRow
            title="Film di tendenza"
            icon={TrendingUp}
            items={trendingMovies}
            mediaType="movie"
            viewAllLink="/movies"
          />

          {/* Serie TV di tendenza */}
          <MediaRow
            title="Serie TV di tendenza"
            icon={Tv}
            items={trendingTV}
            mediaType="tv"
            viewAllLink="/tv-shows"
          />

          {/* Film più votati */}
          <MediaRow
            title="I più votati di sempre"
            icon={Film}
            items={topRatedMovies}
            mediaType="movie"
            viewAllLink="/movies"
          />
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Home;
