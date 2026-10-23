import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Film, Tv, Sparkles } from 'lucide-react';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import Loading from '../components/Common/Loading';
import { useDebounce, useInfiniteScroll } from '../hooks';

const POPULAR_GENRES = [
  { id: 28, name: 'Azione' },
  { id: 35, name: 'Commedia' },
  { id: 878, name: 'Fantascienza' },
  { id: 27, name: 'Horror' },
  { id: 16, name: 'Animazione' },
  { id: 53, name: 'Thriller' },
  { id: 10749, name: 'Romantico' },
  { id: 18, name: 'Dramma' },
];

const Search = () => {
  const [query, setQuery] = useState(() => sessionStorage.getItem('vixsrc.q') || '');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('vixsrc.tab') || 'movie');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  // Ricerca testuale
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSelectedGenre(null);
      sessionStorage.setItem('vixsrc.q', debouncedQuery);
      sessionStorage.setItem('vixsrc.tab', activeTab);
      setResults([]);
      setHasMore(false);
      performSearch(debouncedQuery, 1);
    } else if (!selectedGenre) {
      sessionStorage.removeItem('vixsrc.q');
      setResults([]);
      setHasMore(false);
    }
  }, [debouncedQuery, activeTab]);

  // Ricerca per Genere rapido
  useEffect(() => {
    if (!selectedGenre) return;
    setQuery('');
    sessionStorage.removeItem('vixsrc.q');
    setResults([]);
    setHasMore(false);
    loadGenreContent(selectedGenre.id, 1);
  }, [selectedGenre, activeTab]);

  const performSearch = async (searchQuery, pageNum = 1) => {
    try {
      setLoading(true);
      const searchResults = activeTab === 'movie'
        ? await tmdbService.searchMovies(searchQuery, pageNum)
        : await tmdbService.searchTVShows(searchQuery, pageNum);

      const newResults = searchResults.results || [];
      if (pageNum === 1) setResults(newResults);
      else setResults(prev => [...prev, ...newResults.filter(n => !prev.some(p => p.id === n.id))]);
      setPage(pageNum);
      setHasMore(pageNum < (searchResults.total_pages || 1));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenreContent = async (genreId, pageNum = 1) => {
    try {
      setLoading(true);
      const res = activeTab === 'movie'
        ? await tmdbService.getMoviesByGenre(genreId, pageNum)
        : await tmdbService.getTVShowsByGenre(genreId, pageNum);

      const newResults = res.results || [];
      if (pageNum === 1) setResults(newResults);
      else setResults(prev => [...prev, ...newResults.filter(n => !prev.some(p => p.id === n.id))]);
      setPage(pageNum);
      setHasMore(pageNum < (res.total_pages || 1));
    } catch (error) {
      console.error('Genre search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sentinelRef = useInfiniteScroll(() => {
    if (!loading && hasMore) {
      if (query.trim()) performSearch(query, page + 1);
      else if (selectedGenre) loadGenreContent(selectedGenre.id, page + 1);
    }
  });

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen pb-24">
      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca film, serie TV, attori..."
            className="w-full pl-12 pr-12 py-3.5 bg-surface text-white placeholder-gray-400 rounded-2xl border border-white/10 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-base shadow-lg"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); sessionStorage.removeItem('vixsrc.q'); }}
              className="absolute right-3.5 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              aria-label="Cancella testo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mt-3.5">
          <button
            onClick={() => setActiveTab('movie')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'movie'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Film
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'tv'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Serie TV
          </button>
        </div>

        {/* Quick Genre Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mt-2">
          {POPULAR_GENRES.map((g) => {
            const isSel = selectedGenre?.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(isSel ? null : g)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSel
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {loading && page === 1 ? (
        <Loading text="Ricerca in corso..." />
      ) : results.length > 0 ? (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {selectedGenre
              ? `Genere: ${selectedGenre.name} (${activeTab === 'movie' ? 'Film' : 'Serie TV'})`
              : `Risultati per "${query}" (${activeTab === 'movie' ? 'Film' : 'Serie TV'})`}
          </p>
          <MediaGrid items={results} mediaType={activeTab} />
          <div ref={sentinelRef} className="h-4 my-6" />
          {loading && page > 1 && (
            <div className="text-center py-4 text-xs text-gray-400">Carico altri risultati...</div>
          )}
        </>
      ) : (query.trim() || selectedGenre) && !loading ? (
        <div className="text-center py-16 card max-w-sm mx-auto p-6 border border-white/5">
          <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-white mb-1">Nessun risultato trovato</h3>
          <p className="text-xs text-gray-400">Verifica l'ortografia o prova un altro genere</p>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 text-sm flex flex-col items-center gap-2">
          <Sparkles className="w-8 h-8 text-gray-600 opacity-60" />
          <span>Digita un titolo o tocca uno dei generi qui sopra</span>
        </div>
      )}
    </div>
  );
};

export default Search;
