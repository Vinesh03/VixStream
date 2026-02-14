// VixSrc Streaming Service
const VIXSRC_BASE_URL = 'https://vixsrc.to';

class VixSrcService {
  // Get Movie Stream URL
  getMovieStreamUrl(tmdbId, options = {}) {
    const url = new URL(`${VIXSRC_BASE_URL}/movie/${tmdbId}`);
    
    // Add customization parameters
    if (options.primaryColor) {
      url.searchParams.append('primaryColor', options.primaryColor.replace('#', ''));
    }
    if (options.secondaryColor) {
      url.searchParams.append('secondaryColor', options.secondaryColor.replace('#', ''));
    }
    if (options.autoplay !== undefined) {
      url.searchParams.append('autoplay', options.autoplay);
    }
    if (options.startAt) {
      url.searchParams.append('startAt', options.startAt);
    }
    if (options.lang) {
      url.searchParams.append('lang', options.lang);
    }
    
    return url.toString();
  }

  // Get TV Show Episode Stream URL
  getTVStreamUrl(tmdbId, season, episode, options = {}) {
    const url = new URL(`${VIXSRC_BASE_URL}/tv/${tmdbId}/${season}/${episode}`);
    
    // Add customization parameters
    if (options.primaryColor) {
      url.searchParams.append('primaryColor', options.primaryColor.replace('#', ''));
    }
    if (options.secondaryColor) {
      url.searchParams.append('secondaryColor', options.secondaryColor.replace('#', ''));
    }
    if (options.autoplay !== undefined) {
      url.searchParams.append('autoplay', options.autoplay);
    }
    if (options.startAt) {
      url.searchParams.append('startAt', options.startAt);
    }
    if (options.lang) {
      url.searchParams.append('lang', options.lang);
    }
    
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
