import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, AlertTriangle } from 'lucide-react';
import vixsrcService from '../../services/vixsrc';
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
  const [seekTarget, setSeekTarget] = useState(null);   // % visualizzata durante il drag
  const [seekSeconds, setSeekSeconds] = useState(null); // secondi per il prossimo seek
  const [seekNonce, setSeekNonce] = useState(0);        // forza reload stream al seek
  const [isDragging, setIsDragging] = useState(false);
  const barRef = useRef(null);
  
  const { 
    addContinueWatching, 
    updateProgress,
    addToWatchHistory,
    settings 
  } = useStore();

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
        // Add to continue watching when playback starts
        addContinueWatching({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title,
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
      autoplay: true,
      ...vixsrcService.getDefaultOptions()
    };
    if (seekSeconds !== null && seekSeconds !== undefined) {
      opts.startAt = Math.floor(seekSeconds);
      opts.autoplay = true;
    }

    vixsrcService.getStreamUrl(mediaType, tmdbId, season, episode, opts)
      .then(url => { if (!cancelled) setStreamUrl(url); })
      .catch(err => {
        console.error('Stream URL error:', err);
        if (!cancelled) setStreamError('Impossibile ottenere il flusso video. Riprova.');
      });

    return () => { cancelled = true; };
  }, [tmdbId, mediaType, season, episode, seekNonce]);

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

  // ---- Seek sulla barra del tempo ----
  const progressPct = (() => {
    const base = isDragging && seekSeconds !== null ? seekSeconds : currentTime;
    if (!duration || duration <= 0) return 0;
    return Math.min(Math.max((base / duration) * 100, 0), 100);
  })();

  const computeSeekSeconds = (e) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !duration) return 0;
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    return ratio * duration;
  };

  const updateSeekFromEvent = (e) => {
    setSeekTarget(computeSeekSeconds(e)); // % visiva durante il drag
    setSeekSeconds(computeSeekSeconds(e));
  };

  const doSeek = (secs) => {
    if (!secs && secs !== 0) return;
    setSeekSeconds(secs);
    setSeekNonce(n => n + 1); // ricarica il flusso con startAt=secs
  };

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
          <div className="bg-primary-light/95 border border-secondary rounded-xl p-4 flex items-start gap-3 shadow-2xl">
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

      {/* Progress Indicator interattivo (tap o trascina per il seek) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-5 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm text-white mb-2">
              <span className="font-mono">{formatTime(seekSeconds !== null && isDragging ? seekSeconds : currentTime)}</span>
              <span className="font-mono opacity-70">-{formatTime(Math.max(duration - (seekSeconds !== null && isDragging ? seekSeconds : currentTime), 0))}</span>
            </div>
            <div
              ref={barRef}
              role="slider"
              aria-label="Barra di avanzamento"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(isDragging && seekSeconds !== null ? seekSeconds : currentTime)}
              tabIndex={0}
              className="relative h-6 flex items-center cursor-pointer touch-none select-none group"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture?.(e.pointerId);
                setIsDragging(true);
                updateSeekFromEvent(e);
              }}
              onPointerMove={(e) => {
                if (isDragging) updateSeekFromEvent(e);
              }}
              onPointerUp={(e) => {
                if (!isDragging) return;
                const secs = computeSeekSeconds(e);
                setIsDragging(false);
                doSeek(secs);
              }}
              onKeyDown={(e) => {
                // Supporto D-pad/telecomando: left/right = ±10s
                const base = isDragging && seekSeconds !== null ? seekSeconds : currentTime;
                if (e.key === 'ArrowLeft') { e.preventDefault(); setSeekTarget(null); setSeekSeconds(Math.max(base - 10, 0)); setSeekNonce(n => n + 1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); setSeekTarget(null); setSeekSeconds(Math.min(base + 10, duration)); setSeekNonce(n => n + 1); }
              }}
            >
              {/* Traccia */}
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-visible relative">
                <div
                  className="h-full bg-accent rounded-full pointer-events-none"
                  style={{ width: `${progressPct}%` }}
                />
                {/* Handle */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-lg transition-transform pointer-events-none ${
                    isDragging ? 'w-4 h-4 scale-110' : 'w-3.5 h-3.5 group-hover:scale-125'
                  }`}
                  style={{ left: `${progressPct}%` }}
                />
              </div>
            </div>
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
