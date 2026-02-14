import { create } from 'zustand';
import storageService from '../services/storage';

const useStore = create((set, get) => ({
  // Favorites
  favorites: storageService.getFavorites(),
  addFavorite: (item) => {
    const favorites = storageService.addFavorite(item);
    set({ favorites });
  },
  removeFavorite: (id, mediaType) => {
    const favorites = storageService.removeFavorite(id, mediaType);
    set({ favorites });
  },
  isFavorite: (id, mediaType) => {
    return storageService.isFavorite(id, mediaType);
  },

  // Continue Watching
  continueWatching: storageService.getContinueWatching(),
  addContinueWatching: (item) => {
    const continueWatching = storageService.addContinueWatching(item);
    set({ continueWatching });
  },
  removeContinueWatching: (id, mediaType, season, episode) => {
    const continueWatching = storageService.removeContinueWatching(id, mediaType, season, episode);
    set({ continueWatching });
  },
  updateProgress: (id, mediaType, progress, season, episode) => {
    storageService.updateProgress(id, mediaType, progress, season, episode);
    set({ continueWatching: storageService.getContinueWatching() });
  },

  // Settings
  settings: storageService.getSettings(),
  updateSettings: (newSettings) => {
    const settings = storageService.updateSettings(newSettings);
    set({ settings });
  },
  resetSettings: () => {
    const settings = storageService.resetSettings();
    set({ settings });
  },

  // Watch History
  watchHistory: storageService.getWatchHistory(),
  addToWatchHistory: (item) => {
    const watchHistory = storageService.addToWatchHistory(item);
    set({ watchHistory });
  },
  clearWatchHistory: () => {
    const watchHistory = storageService.clearWatchHistory();
    set({ watchHistory });
  },

  // UI State
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Current Playing
  currentPlaying: null,
  setCurrentPlaying: (item) => set({ currentPlaying: item }),

  // Filters
  filters: {
    genre: null,
    year: null,
    rating: null,
    sortBy: 'popularity.desc'
  },
  setFilters: (filters) => set({ 
    filters: { ...get().filters, ...filters } 
  }),
  clearFilters: () => set({ 
    filters: {
      genre: null,
      year: null,
      rating: null,
      sortBy: 'popularity.desc'
    } 
  }),

  // Clear all data
  clearAllData: () => {
    storageService.clearAllData();
    set({
      favorites: [],
      continueWatching: [],
      watchHistory: []
    });
  }
}));

export default useStore;
