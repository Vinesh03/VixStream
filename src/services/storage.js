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
    const raw = this.get(this.CONTINUE_WATCHING_KEY) || [];
    // migrazione: le vecchie voci per-episodio (bug poster duplicati) vengono deduplicate
    // per (id, media_type) — resta l'ultima (l'array è ordinato per aggiornamento recente)
    const seen = new Set();
    const deduped = [];
    for (let i = raw.length - 1; i >= 0; i--) {
      const k = `${raw[i].id}|${raw[i].media_type}`;
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.unshift(raw[i]);
    }
    // ripulisci subito il localStorage se la dedupe ha rimosso voci
    if (deduped.length !== raw.length) this.set(this.CONTINUE_WATCHING_KEY, deduped);
    return deduped;
  }

  addContinueWatching(item) {
    const continueWatching = this.getContinueWatching();
    
    // UNA voce per contenuto (id + media_type): le serie NON accumulano un poster
    // per ogni episodio visto (bug dei 4 poster Reacher identici) — resta solo
    // l'episodio più recente.
    const filtered = continueWatching.filter(cw => 
      !(String(cw.id) === String(item.id) && cw.media_type === item.media_type)
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
    // un tap = rimuove TUTTE le voci della serie (incluse le vecchie per-episodio
    // lasciate dal bug dei poster duplicati)
    const filtered = continueWatching.filter(cw => 
      !(String(cw.id) === String(id) && cw.media_type === mediaType)
    );
    this.set(this.CONTINUE_WATCHING_KEY, filtered);
    return filtered;
  }

  updateProgress(id, mediaType, progress, season, episode) {
    const continueWatching = this.getContinueWatching();
    // la voce è UNICA per contenuto: trova quella della serie a prescindere da S/E
    const index = continueWatching.findIndex(cw => 
      String(cw.id) === String(id) && 
      cw.media_type === mediaType
    );
    
    if (index !== -1) {
      continueWatching[index].progress = progress;
      continueWatching[index].season = season ?? continueWatching[index].season;
      continueWatching[index].episode = episode ?? continueWatching[index].episode;
      continueWatching[index].updatedAt = new Date().toISOString();
      this.set(this.CONTINUE_WATCHING_KEY, continueWatching);
    } else {
      // nessuna voce: creala (il primo timeupdate arriva prima del play)
      this.addContinueWatching({ id, media_type: mediaType, season, episode, progress });
    }
  }

  // Settings
  getSettings() {
    // merge con i default: i vecchi settings salvati senza autoRotate la ereditano (true)
    const saved = this.get(this.SETTINGS_KEY) || {};
    // migrazione una-tantum: il VECCHIO default era autoRotate:false (baked al primo avvio,
    // prima che esistesse il toggle) — chi non l'ha mai voluto false esplicitamente rieredita true
    if (saved.autoRotate === false && !this.get('vixsrc.autorotate.user_set')) {
      delete saved.autoRotate;
    }
    const merged = { ...this.getDefaultSettings(), ...saved };
    if (!this.get(this.SETTINGS_KEY) || JSON.stringify(this.get(this.SETTINGS_KEY)) !== JSON.stringify(merged)) {
      // primo avvio o migrazione: persisti il merged così ogni chiave è esplicita
      this.set(this.SETTINGS_KEY, merged);
    }
    return merged;
  }

  getDefaultSettings() {
    return {
      language: 'it',
      autoplay: false,
      quality: 'auto',
      subtitles: true,
      theme: 'dark',
      autoRotate: true,
      accentColor: '#ff3848'
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
