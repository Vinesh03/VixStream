// VixSrc Streaming Service
const VIXSRC_BASE_URL = 'https://vixsrc.to';

class VixSrcService {
  // Costruisce i parametri di personalizzazione comuni
  buildParams(options = {}) {
    const params = new URLSearchParams();
    if (options.primaryColor) params.append('primaryColor', options.primaryColor.replace('#', ''));
    if (options.secondaryColor) params.append('secondaryColor', options.secondaryColor.replace('#', ''));
    if (options.autoplay !== undefined) params.append('autoplay', options.autoplay);
    if (options.startAt) params.append('startAt', options.startAt);
    if (options.lang) params.append('lang', options.lang);
    return params;
  }

  /**
   * Ottiene l'URL embed del player con token FRESCO via API VixSrc.
   * IMPORTANTE: i token scadono in ~60 secondi, quindi va chiamato ogni volta
   * che si apre il player. Non cachare il risultato.
   */
  async getStreamUrl(mediaType, tmdbId, season, episode, options = {}) {
    const apiPath = mediaType === 'movie'
      ? `/api/movie/${tmdbId}`
      : `/api/tv/${tmdbId}/${season}/${episode}`;

    const lang = options.lang || 'it';
    const res = await fetch(`${VIXSRC_BASE_URL}${apiPath}?lang=${lang}`);
    if (!res.ok) throw new Error(`VixSrc API Error: ${res.status}`);
    const data = await res.json();
    if (!data.src) throw new Error('VixSrc: sorgente non disponibile');

    // data.src è tipo "/embed/777603?token=...&expires=..." — aggiungiamo le nostre opzioni
    const separator = data.src.includes('?') ? '&' : '?';
    return `${VIXSRC_BASE_URL}${data.src}${separator}${this.buildParams(options).toString()}`;
  }

  // DEPRECATO: URL diretto senza token (l'embed restituisce 410)
  getMovieStreamUrl(tmdbId, options = {}) {
    const url = new URL(`${VIXSRC_BASE_URL}/movie/${tmdbId}`);
    for (const [k, v] of this.buildParams(options)) url.searchParams.append(k, v);
    return url.toString();
  }

  getTVStreamUrl(tmdbId, season, episode, options = {}) {
    const url = new URL(`${VIXSRC_BASE_URL}/tv/${tmdbId}/${season}/${episode}`);
    for (const [k, v] of this.buildParams(options)) url.searchParams.append(k, v);
    return url.toString();
  }

  // Get VixSrc Catalog
  async getCatalog(type = 'movie', lang = 'it') {
    try {
      const response = await fetch(`${VIXSRC_BASE_URL}/api/list/${type}?lang=${lang}`);
      if (!response.ok) {
        throw new Error(`VixSrc API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('VixSrc Catalog Error:', error);
      throw error;
    }
  }

  // Setup Player Event Listeners
  setupPlayerEvents(iframe, callbacks = {}) {
    const handleMessage = (event) => {
      if (event.origin !== 'https://vixsrc.to') return;
      
      if (event.data.type === 'PLAYER_EVENT') {
        const { event: eventName, currentTime, duration, video_id } = event.data.data;
        
        switch (eventName) {
          case 'play':
            callbacks.onPlay?.(currentTime, duration, video_id);
            break;
          case 'pause':
            callbacks.onPause?.(currentTime, duration, video_id);
            break;
          case 'seeked':
            callbacks.onSeeked?.(currentTime, duration, video_id);
            break;
          case 'ended':
            callbacks.onEnded?.(currentTime, duration, video_id);
            break;
          case 'timeupdate':
            callbacks.onTimeUpdate?.(currentTime, duration, video_id);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }

  // Get default streaming options
  getDefaultOptions() {
    return {
      primaryColor: 'e50914',
      secondaryColor: '831010',
      autoplay: false,
      lang: 'it'
    };
  }
}

export default new VixSrcService();
