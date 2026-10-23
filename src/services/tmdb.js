// TMDB API Service con in-memory cache e timeout
const DEFAULT_API_KEY = '64a3d1c4c823b9c417c07e91b0e668a1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const memCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti

class TMDBService {
  constructor() {
    this.apiKey = this.getApiKey();
  }

  getApiKey() {
    const stored = localStorage.getItem('tmdb_api_key');
    return stored || DEFAULT_API_KEY;
  }

  setApiKey(key) {
    localStorage.setItem('tmdb_api_key', key);
    this.apiKey = key;
    memCache.clear();
  }

  clearCache() {
    memCache.clear();
  }

  resetApiKey() {
    localStorage.removeItem('tmdb_api_key');
    this.apiKey = DEFAULT_API_KEY;
    memCache.clear();
  }

  async fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'it-IT');

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const cacheKey = url.toString();
    const cached = memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }
      const data = await response.json();
      memCache.set(cacheKey, { ts: Date.now(), data });
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: TMDB non risponde (10s)');
      }
      if (error instanceof TypeError) {
        throw new Error('Rete non raggiungibile: controlla la connessione');
      }
      console.error('TMDB Fetch Error:', error);
      throw error;
    } finally {
      clearTimeout(t);
    }
  }

  getImageUrl(path, size = 'original') {
    if (!path) return '/placeholder.svg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  async discoverMovies(page = 1, filters = {}) {
    const params = {
      page,
      sort_by: filters.sortBy || 'popularity.desc',
      ...filters
    };
    return this.fetchFromTMDB('/discover/movie', params);
  }

  async discoverTVShows(page = 1, filters = {}) {
    const params = {
      page,
      sort_by: filters.sortBy || 'popularity.desc',
      ...filters
    };
    return this.fetchFromTMDB('/discover/tv', params);
  }

  async searchMovies(query, page = 1) {
    return this.fetchFromTMDB('/search/movie', { query, page });
  }

  async searchTVShows(query, page = 1) {
    return this.fetchFromTMDB('/search/tv', { query, page });
  }

  async getMovieDetails(movieId) {
    return this.fetchFromTMDB(`/movie/${movieId}`, { 
      append_to_response: 'videos,credits,similar,recommendations' 
    });
  }

  async getTVShowDetails(tvId) {
    return this.fetchFromTMDB(`/tv/${tvId}`, { 
      append_to_response: 'videos,credits,similar,recommendations' 
    });
  }

  async getTVSeasonDetails(tvId, seasonNumber) {
    return this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
  }

  async getTrending(mediaType = 'all', timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  }

  async getPopularMovies(page = 1) {
    return this.fetchFromTMDB('/movie/popular', { page });
  }

  async getPopularTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/popular', { page });
  }

  async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB('/movie/top_rated', { page });
  }

  async getTopRatedTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/top_rated', { page });
  }

  async getMovieGenres() {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres() {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  async getMoviesByGenre(genreId, page = 1) {
    return this.fetchFromTMDB('/discover/movie', { 
      with_genres: genreId,
      page 
    });
  }

  async getTVShowsByGenre(genreId, page = 1) {
    return this.fetchFromTMDB('/discover/tv', { 
      with_genres: genreId,
      page 
    });
  }
}

export default new TMDBService();
