import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import tmdbService from '../services/tmdb';
import MediaGrid from '../components/MediaGrid/MediaGrid';
import Loading from '../components/Common/Loading';
import { useDebounce } from '../hooks';
import useStore from '../store/useStore';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('movie');
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, activeTab]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      
      const searchResults = activeTab === 'movie'
        ? await tmdbService.searchMovies(searchQuery)
        : await tmdbService.searchTVShows(searchQuery);
      
      setResults(searchResults.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Cerca</h1>
        
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca film o serie TV..."
            className="w-full pl-12 pr-12 py-4 bg-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cancella ricerca"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all tv-focusable ${
              activeTab === 'movie'
                ? 'bg-accent text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/15'
            }`}
          >
            Film
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all tv-focusable ${
              activeTab === 'tv'
                ? 'bg-accent text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/15'
            }`}
          >
            Serie TV
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <Loading text="Ricerca in corso..." />
        ) : results.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              {results.length} risultat{results.length !== 1 ? 'i' : 'o'} per "{query}"
            </p>
            <MediaGrid items={results} mediaType={activeTab} />
          </>
        ) : query.trim() ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Nessun risultato per "{query}"
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Inizia a cercare film o serie TV
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
