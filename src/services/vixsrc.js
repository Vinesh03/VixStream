// VixSrc Streaming Service
const VIXSRC_BASE_URL = 'https://vixsrc.to';

import { CapacitorHttp } from '@capacitor/core';

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
   * Fetch che funziona:
   * - su Android nativo: CapacitorHttp (bypassa CORS)
   * - su Electron: net.request via IPC (bypassa CORS strict del renderer)
   * - su browser: fetch standard
   *
   * NOTA: la fetch del renderer su Electron fallisce con "Failed to fetch" perché
   * lo scheme capacitor-electron:// applica CORS strict sul cross-origin. Su
   * Electron usiamo invece l'IPC esposto dal preload (window.electronAPI.vixsrcFetch)
   * che chiama net.request dal main process.
   */
  async _apiGet(url) {
    const isElectron = !!(window.CapacitorCustomPlatform?.name === 'electron'
      || (typeof navigator !== 'undefined' && /Electron/.test(navigator.userAgent)));
    const isNative = !isElectron && !!window.Capacitor?.isNativePlatform?.();

    console.log('[VixSrc] Fetching:', url, 'isElectron=', isElectron, 'isNative=', isNative);

    // Electron: usa IPC server-side (bypassa CORS)
    if (isElectron && window.electronAPI?.vixsrcFetch) {
      try {
        const data = await window.electronAPI.vixsrcFetch(url);
        console.log('[VixSrc] IPC response OK');
        return data;
      } catch (e) {
        console.error('[VixSrc] IPC fetch error:', e);
        throw e;
      }
    }

    // Android nativo: CapacitorHttp
    if (isNative) {
      const res = await CapacitorHttp.get({ url, headers: { 'Accept': 'application/json' } });
      if (res.status >= 400) throw new Error(`VixSrc API Error: ${res.status}`);
      return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    }

    // Browser: fetch standard
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      credentials: 'omit'
    });
    console.log('[VixSrc] Response status:', res.status, res.statusText);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`VixSrc API Error: ${res.status} ${res.statusText} - ${body.slice(0, 200)}`);
    }
    return res.json();
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
    const data = await this._apiGet(`${VIXSRC_BASE_URL}${apiPath}?lang=${lang}`);
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
