import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TrendingUp, Film, Tv, Star, Play, X, Clock, Flame, Youtube, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import MediaRow from '../components/MediaRow/MediaRow';
import PullToRefresh from '../components/Common/PullToRefresh';
import TrailerModal from '../components/Common/TrailerModal';
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
  const [trailer, setTrailer] = useState(null);
  const heroTouchX = useRef(null);
  const heroTouchY = useRef(null);

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

  const heroCount = Math.min(trendingMovies.length, 6);

  useEffect(() => {
    if (heroCount <= 1 || trailer) return;
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % heroCount);
    }, 7000);
    return () => clearInterval(t);
  }, [heroCount, trailer]);

  const stepHero = (dir) => {
    if (heroCount <= 1) return;
    setHeroIdx((i) => (i + dir + heroCount) % heroCount);
  };

  const onHeroTouchStart = (e) => {
    heroTouchX.current = e.touches[0].clientX;
    heroTouchY.current = e.touches[0].clientY;
  };

  const onHeroTouchEnd = (e) => {
    if (heroTouchX.current === null) return;
    const dx = e.changedTouches[0].clientX - heroTouchX.current;
    const dy = e.changedTouches[0].clientY - heroTouchY.current;
    heroTouchX.current = null;
    heroTouchY.current = null;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
      stepHero(dx < 0 ? 1 : -1);
    }
  };

  const openTrailer = async (item, mediaType = 'movie') => {
    const key = await tmdbService.getTrailerKey(mediaType, item.id);
    if (key) {
      setTrailer({ key, title: `Trailer · ${item.title || item.name || ''}` });
    } else {
      alert('Nessun trailer disponibile per questo titolo.');
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
        {/* Hero Section con Swipe Destra/Sinistra */}
        {heroItem && (
          <div
            className="relative h-[50vh] md:h-[64vh] overflow-hidden bg-primary select-none"
            onTouchStart={onHeroTouchStart}
            onTouchEnd={onHeroTouchEnd}
          >
            <div 
              key={heroItem.id}
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 animate-fade-in"
              style={{
                backgroundImage: `url(${tmdbService.getImageUrl(heroItem.backdrop_path, 'w780')})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/30 to-transparent" />

            {/* Frecce laterali discrete */}
            {heroCount > 1 && (
              <>
                <button
                  onClick={() => stepHero(-1)}
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all active:scale-90"
                  aria-label="Precedente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => stepHero(1)}
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all active:scale-90"
                  aria-label="Successivo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="relative container mx-auto px-4 h-full flex items-end pb-8 md:pb-12">
              <div className="max-w-xl w-full">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-2.5">
                  <Flame className="w-3.5 h-3.5" /> In primo piano #{heroIdx + 1} · Scorri ⇄
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
                    onClick={() => openTrailer(heroItem, 'movie')}
                    className="btn-secondary inline-flex items-center gap-1.5 text-sm px-3.5 py-2.5 active:scale-95 transition-transform text-white/90"
                    title="Guarda il trailer"
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

                {/* Dot indicator */}
                {heroCount > 1 && (
                  <div className="flex items-center gap-1.5 mt-5">
                    {trendingMovies.slice(0, heroCount).map((m, idx) => (
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

        {/* Modal Trailer centrato nel viewport via Portal */}
        <TrailerModal
          videoKey={trailer?.key}
          title={trailer?.title}
          onClose={() => setTrailer(null)}
        />

        {/* Sezioni a Carosello Orizzontale con Gesture */}
        <div className="space-y-8 mt-2">
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

          {nowPlaying.length > 0 && (
            <MediaRow
              title="Al cinema ora"
              icon={Star}
              items={nowPlaying}
              mediaType="movie"
              viewAllLink="/movies"
            />
          )}

          <MediaRow
            title="Film di tendenza"
            icon={TrendingUp}
            items={trendingMovies}
            mediaType="movie"
            viewAllLink="/movies"
          />

          <MediaRow
            title="Serie TV di tendenza"
            icon={Tv}
            items={trendingTV}
            mediaType="tv"
            viewAllLink="/tv-shows"
          />

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
