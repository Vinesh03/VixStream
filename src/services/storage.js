// Local Storage Service
class StorageService {
  constructor() {
    this.FAVORITES_KEY = 'vixsrc_favorites';
    this.CONTINUE_WATCHING_KEY = 'vixsrc_continue_watching';
    this.SETTINGS_KEY = 'vixsrc_settings';
    this.WATCH_HISTORY_KEY = 'vixsrc_watch_history';
  }

  // Generic storage methods
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  // Favorites
  getFavorites() {
    return this.get(this.FAVORITES_KEY) || [];
  }

  addFavorite(item) {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => 
      fav.id === item.id && fav.media_type === item.media_type
    );
    
    if (!exists) {
      favorites.unshift({
        ...item,
        addedAt: new Date().toISOString()
      });
      this.set(this.FAVORITES_KEY, favorites);
    }
    return favorites;
  }

  removeFavorite(id, mediaType) {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => 
      !(fav.id === id && fav.media_type === mediaType)
    );
    this.set(this.FAVORITES_KEY, filtered);
    return filtered;
  }

  isFavorite(id, mediaType) {
    const favorites = this.getFavorites();
    return favorites.some(fav => 
      fav.id === id && fav.media_type === mediaType
    );
  }

  // Continue Watching
  getContinueWatching() {
    return this.get(this.CONTINUE_WATCHING_KEY) || [];
  }

  addContinueWatching(item) {
    const continueWatching = this.getContinueWatching();
    
    // Remove existing entry for this item
    const filtered = continueWatching.filter(cw => 
      !(cw.id === item.id && 
        cw.media_type === item.media_type &&
        cw.season === item.season &&
        cw.episode === item.episode)
    );
    
    // Add to beginning
    filtered.unshift({
      ...item,
      updatedAt: new Date().toISOString()
    });
    
    // Keep only last 50 items
    const limited = filtered.slice(0, 50);
    this.set(this.CONTINUE_WATCHING_KEY, limited);
    return limited;
  }

  removeContinueWatching(id, mediaType, season, episode) {
    const continueWatching = this.getContinueWatching();
    const filtered = continueWatching.filter(cw => 
      !(cw.id === id && 
        cw.media_type === mediaType &&
        cw.season === season &&
        cw.episode === episode)
    );
    this.set(this.CONTINUE_WATCHING_KEY, filtered);
    return filtered;
  }

  updateProgress(id, mediaType, progress, season, episode) {
    const continueWatching = this.getContinueWatching();
    const index = continueWatching.findIndex(cw => 
      cw.id === id && 
      cw.media_type === mediaType &&
      cw.season === season &&
      cw.episode === episode
    );
    
    if (index !== -1) {
      continueWatching[index].progress = progress;
      continueWatching[index].updatedAt = new Date().toISOString();
      this.set(this.CONTINUE_WATCHING_KEY, continueWatching);
    }
  }

  // Settings
  getSettings() {
    return this.get(this.SETTINGS_KEY) || this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      language: 'it',
      autoplay: false,
      quality: 'auto',
      subtitles: true,
      theme: 'dark',
      autoRotate: false
    };
  }

  updateSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.set(this.SETTINGS_KEY, updated);
    return updated;
  }

  resetSettings() {
    this.set(this.SETTINGS_KEY, this.getDefaultSettings());
    return this.getDefaultSettings();
  }

  // Watch History
  getWatchHistory() {
    return this.get(this.WATCH_HISTORY_KEY) || [];
  }

  addToWatchHistory(item) {
    const history = this.getWatchHistory();
    
    // Remove existing entry
    const filtered = history.filter(h => 
      !(h.id === item.id && h.media_type === item.media_type)
    );
    
    // Add to beginning
    filtered.unshift({
      ...item,
      watchedAt: new Date().toISOString()
    });
    
    // Keep only last 100 items
    const limited = filtered.slice(0, 100);
    this.set(this.WATCH_HISTORY_KEY, limited);
    return limited;
  }

  clearWatchHistory() {
    this.set(this.WATCH_HISTORY_KEY, []);
    return [];
  }

  // Clear all data
  clearAllData() {
    this.remove(this.FAVORITES_KEY);
    this.remove(this.CONTINUE_WATCHING_KEY);
    this.remove(this.WATCH_HISTORY_KEY);
    // Don't clear settings
  }
}

export default new StorageService();
