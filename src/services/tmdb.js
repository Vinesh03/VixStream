// TMDB API Service
const DEFAULT_API_KEY = '64a3d1c4c823b9c417c07e91b0e668a1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

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
  }

  resetApiKey() {
    localStorage.removeItem('tmdb_api_key');
    this.apiKey = DEFAULT_API_KEY;
  }

  async fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'it-IT');
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB Fetch Error:', error);
      throw error;
    }
  }

  // Get image URL
  getImageUrl(path, size = 'original') {
    if (!path) return '/placeholder.svg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  // Discover Movies
  async discoverMovies(page = 1, filters = {}) {
    const params = {
      page,
      sort_by: filters.sortBy || 'popularity.desc',
      ...filters
    };
    return this.fetchFromTMDB('/discover/movie', params);
  }

  // Discover TV Shows
  async discoverTVShows(page = 1, filters = {}) {
    const params = {
      page,
      sort_by: filters.sortBy || 'popularity.desc',
      ...filters
    };
    return this.fetchFromTMDB('/discover/tv', params);
  }

  // Search Movies
  async searchMovies(query, page = 1) {
    return this.fetchFromTMDB('/search/movie', { query, page });
  }

  // Search TV Shows
  async searchTVShows(query, page = 1) {
    return this.fetchFromTMDB('/search/tv', { query, page });
  }

  // Get Movie Details
  async getMovieDetails(movieId) {
    return this.fetchFromTMDB(`/movie/${movieId}`, { 
      append_to_response: 'videos,credits,similar,recommendations' 
    });
  }

  // Get TV Show Details
  async getTVShowDetails(tvId) {
    return this.fetchFromTMDB(`/tv/${tvId}`, { 
      append_to_response: 'videos,credits,similar,recommendations' 
    });
  }

  // Get TV Season Details
  async getTVSeasonDetails(tvId, seasonNumber) {
    return this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
  }

  // Get Trending
  async getTrending(mediaType = 'all', timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  }

  // Get Popular Movies
  async getPopularMovies(page = 1) {
    return this.fetchFromTMDB('/movie/popular', { page });
  }

  // Get Popular TV Shows
  async getPopularTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/popular', { page });
  }

  // Get Top Rated Movies
  async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB('/movie/top_rated', { page });
  }

  // Get Top Rated TV Shows
  async getTopRatedTVShows(page = 1) {
    return this.fetchFromTMDB('/tv/top_rated', { page });
  }

  // Get Genres
  async getMovieGenres() {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres() {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  // Get Movies by Genre
  async getMoviesByGenre(genreId, page = 1) {
    return this.fetchFromTMDB('/discover/movie', { 
      with_genres: genreId,
      page 
    });
  }

  // Get TV Shows by Genre
  async getTVShowsByGenre(genreId, page = 1) {
    return this.fetchFromTMDB('/discover/tv', { 
      with_genres: genreId,
      page 
    });
  }
}

export default new TMDBService();
