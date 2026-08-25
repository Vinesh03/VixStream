import React, { useState, useEffect } from 'react';
import { Tv, Filter } from 'lucide-react';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import useStore from '../store/useStore';

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { filters, setFilters } = useStore();

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadTVShows(1);
  }, [filters]);

  const loadGenres = async () => {
    try {
      const response = await tmdbService.getTVGenres();
      setGenres(response.genres || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadTVShows = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {};
      if (filters.genre) filterParams.with_genres = filters.genre;
      if (filters.year) filterParams.first_air_date_year = filters.year;
      if (filters.rating) filterParams['vote_average.gte'] = filters.rating;
      filterParams.sort_by = filters.sortBy || 'popularity.desc';

      const response = await tmdbService.discoverTVShows(pageNum, filterParams);
      
      if (pageNum === 1) {
        setTvShows(response.results || []);
      } else {
        setTvShows(prev => [...prev, ...(response.results || [])]);
      }
      
      setPage(pageNum);
      setHasMore(pageNum < response.total_pages);
    } catch (err) {
      console.error('Error loading TV shows:', err);
      setError('Impossibile caricare le serie TV. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTVShows(page + 1);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Tv className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold text-white">Serie TV</h1>
      </div>

      {/* Filters */}
      <div className="bg-app-light rounded-card p-6 mb-8 border border-theme">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-white">Filtri</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genere
            </label>
            <select
              value={filters.genre || ''}
              onChange={(e) => setFilters({ genre: e.target.value || null })}
              className="input-field w-full"
            >
              <option value="">Tutti i generi</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anno
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => setFilters({ year: e.target.value || null })}
              className="input-field w-full"
            >
              <option value="">Tutti gli anni</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voto minimo
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => setFilters({ rating: e.target.value || null })}
              className="input-field w-full"
            >
              <option value="">Qualsiasi voto</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
              <option value="9">9+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ordina per
            </label>
            <select
              value={filters.sortBy || 'popularity.desc'}
              onChange={(e) => setFilters({ sortBy: e.target.value })}
              className="input-field w-full"
            >
              <option value="popularity.desc">Più popolari</option>
              <option value="vote_average.desc">Più votate</option>
              <option value="first_air_date.desc">Più recenti</option>
              <option value="name.asc">Titolo (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorMessage message={error} onRetry={() => loadTVShows(1)} />
      ) : (
        <>
          <MediaGrid items={tvShows} mediaType="tv" loading={loading && page === 1} />
          
          {hasMore && !loading && tvShows.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="btn-primary"
              >
                Carica altre
              </button>
            </div>
          )}
          
          {loading && page > 1 && (
            <Loading text="Caricamento..." />
          )}
        </>
      )}
    </div>
  );
};

export default TVShows;
