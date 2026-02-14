import React, { useState, useEffect } from 'react';
import { Film, Filter } from 'lucide-react';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import useStore from '../store/useStore';

const Movies = () => {
  const [movies, setMovies] = useState([]);
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
    loadMovies(1);
  }, [filters]);

  const loadGenres = async () => {
    try {
      const response = await tmdbService.getMovieGenres();
      setGenres(response.genres || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadMovies = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {};
      if (filters.genre) filterParams.with_genres = filters.genre;
      if (filters.year) filterParams.primary_release_year = filters.year;
      if (filters.rating) filterParams['vote_average.gte'] = filters.rating;
      filterParams.sort_by = filters.sortBy || 'popularity.desc';

      const response = await tmdbService.discoverMovies(pageNum, filterParams);
      
      if (pageNum === 1) {
        setMovies(response.results || []);
      } else {
        setMovies(prev => [...prev, ...(response.results || [])]);
      }
      
      setPage(pageNum);
      setHasMore(pageNum < response.total_pages);
    } catch (err) {
      console.error('Error loading movies:', err);
      setError('Impossibile caricare i film. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadMovies(page + 1);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Film className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold text-white">Film</h1>
      </div>

      {/* Filters */}
      <div className="bg-primary-light rounded-lg p-6 mb-8 border border-secondary">
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
              <option value="vote_average.desc">Più votati</option>
              <option value="release_date.desc">Più recenti</option>
              <option value="title.asc">Titolo (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorMessage message={error} onRetry={() => loadMovies(1)} />
      ) : (
        <>
          <MediaGrid items={movies} mediaType="movie" loading={loading && page === 1} />
          
          {hasMore && !loading && movies.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="btn-primary"
              >
                Carica altri
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

export default Movies;
