import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, AlertTriangle } from 'lucide-react';
import vixsrcService from '../../services/vixsrc';
import tmdbService from '../../services/tmdb';
import useStore from '../../store/useStore';

const VideoPlayer = ({ 
  tmdbId, 
  mediaType = 'movie',
  season = null,
  episode = null,
  onClose,
  title = '',
  autoPlay = true
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExternalHint, setShowExternalHint] = useState(true);
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const detailsRef = useRef(null);
  
  const { 
    addContinueWatching, 
    updateProgress,
    addToWatchHistory,
    settings 
  } = useStore();

  // Carica i dettagli TMDB (per il poster in "continua a guardare")
  useEffect(() => {
    let cancelled = false;
    const fetchDetails = mediaType === 'movie'
      ? tmdbService.getMovieDetails(tmdbId)
      : tmdbService.getTVShowDetails(tmdbId);
    fetchDetails
      .then(d => { if (!cancelled) detailsRef.current = d; })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tmdbId, mediaType]);

  useEffect(() => {
    let lastSaved = 0;
    // Setup player event listeners
    const cleanup = vixsrcService.setupPlayerEvents(iframeRef.current, {
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);

        // Salva il progresso ogni 10 secondi effettivi
        if (dur > 0 && time - lastSaved >= 10) {
          lastSaved = time;
          const progress = (time / dur) * 100;
          updateProgress(tmdbId, mediaType, progress, season, episode);
        }
      },
      onPlay: (time, dur) => {
        setShowExternalHint(false);
        // Add to continue watching when playback starts (con poster per la card)
        addContinueWatching({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title,
          poster_path: detailsRef.current?.poster_path,
          backdrop_path: detailsRef.current?.backdrop_path,
          progress: dur > 0 ? (time / dur) * 100 : 0,
          currentTime: time,
          duration: dur
        });
      },
      onEnded: () => {
        // Add to watch history when video ends
        addToWatchHistory({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title
        });
      }
    });

    return cleanup;
  }, [tmdbId, mediaType, season, episode]);

  // Ottieni stream URL fresco dal server (il token scade in ~1 minuto).
  // startAt (secondi) viene passato solo quando l'utente fa un seek manuale.
  useEffect(() => {
    let cancelled = false;
    setStreamUrl(null);
    setStreamError(null);

    const opts = {
      autoplay: autoPlay,
      ...vixsrcService.getDefaultOptions()
    };

    vixsrcService.getStreamUrl(mediaType, tmdbId, season, episode, opts)
      .then(url => { if (!cancelled) setStreamUrl(url); })
      .catch(err => {
        console.error('Stream URL error:', err);
        if (!cancelled) setStreamError('Impossibile ottenere il flusso video. Riprova.');
      });

    return () => { cancelled = true; };
  }, [tmdbId, mediaType, season, episode]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  // Get stream URL (ora async, gestito sopra con useEffect)

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Player Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white truncate max-w-md">
            {title}
            {season && episode && ` - S${season}E${episode}`}
          </h2>
          
          <div className="flex items-center gap-2">
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Apri in nuova finestra"
              title="Il player non funziona? Apri in una nuova finestra"
            >
              <ExternalLink className="w-6 h-6 text-white" />
            </a>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              aria-label={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-6 h-6 text-white" />
              ) : (
                <Maximize2 className="w-6 h-6 text-white" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Chiudi player"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* VixSrc Iframe Player */}
      {streamError ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-white text-lg mb-4">{streamError}</p>
            <a
              href={`https://vixsrc.to/${mediaType}/${tmdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Apri su VixSrc
            </a>
          </div>
        </div>
      ) : !streamUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
        </div>
      ) : (
      <iframe
        ref={iframeRef}
        src={streamUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={`Player - ${title}`}
      />
      )}

      {/* Avviso contenuti esterni */}
      {showExternalHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 max-w-md mx-4">
          <div className="glass-panel border border-theme rounded-2xl p-4 flex items-start gap-3 shadow-2xl">
            <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300 leading-relaxed">
              Stai per accedere a contenuti forniti da{' '}
              <strong className="text-white">VixSrc</strong>, servizio di terze parti non
              gestito da noi. Se qualcosa non funziona, usa il pulsante{' '}
              <ExternalLink className="w-3.5 h-3.5 inline" /> in alto per aprire il player
              in una nuova finestra.
              <button
                onClick={() => setShowExternalHint(false)}
                className="block mt-2 text-accent hover:text-accent-hover font-medium"
              >
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tempo rimanente discreto (la timeline vera è quella del player VixSrc) */}
      {duration > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur rounded-full px-4 py-1.5">
            <span className="text-xs font-mono text-white/90">
              -{formatTime(Math.max(duration - currentTime, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;
