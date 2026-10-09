import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, AlertTriangle } from 'lucide-react';
import vixsrcService from '../../services/vixsrc';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { applyRotationSetting } from '../../services/orientation';
import tmdbService from '../../services/tmdb';
import useStore from '../../store/useStore';

const VideoPlayer = ({
  tmdbId,
  mediaType = 'movie',
  season = null,
  episode = null,
  onClose,
  title = '',
  posterPath = null,
  backdropPath = null,
  autoPlay = true
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExternalHint, setShowExternalHint] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const hideTimer = useRef(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [streamDebug, setStreamDebug] = useState(null);
  
  const { 
    addContinueWatching, 
    updateProgress,
    addToWatchHistory,
    settings 
  } = useStore();

  // Dettagli TMDB arrivano come props da Player.jsx (UN solo fetch condiviso)

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
        bumpTopBar(); // barra visibile 3.5s poi auto-hide
        // Add to continue watching when playback starts (con poster per la card)
        addContinueWatching({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          progress: dur > 0 ? (time / dur) * 100 : 0,
          currentTime: time,
          duration: dur
        });
      },
      onPause: () => {
        keepTopBar(); // in pausa la barra resta
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

    // NB: i default PRIMA, i valori espliciti DOPO — lo spread inverso cancellava
    // autoplay (getDefaultOptions ha autoplay: false e sovrascriveva autoPlay)
    const opts = {
      ...vixsrcService.getDefaultOptions(),
      autoplay: autoPlay,
      lang: settings.language || 'it', // la lingua scelta nelle Impostazioni
    };

    vixsrcService.getStreamUrl(mediaType, tmdbId, season, episode, opts)
      .then(url => {
        console.log('[Player] Stream URL OK:', url?.slice(0, 120));
        if (!cancelled) setStreamUrl(url);
      })
      .catch(err => {
        console.error('[Player] Stream URL error:', err);
        console.error('[Player] Error message:', err?.message);
        console.error('[Player] Error stack:', err?.stack);
        const msg = err?.message || err?.toString() || 'Errore sconosciuto';
        if (!cancelled) {
          setStreamError(`Impossibile ottenere il flusso video: ${msg}`);
          setStreamDebug({
            type: err?.name || 'Error',
            message: msg,
            stack: err?.stack || '',
            url: `https://vixsrc.to/api/${mediaType}/${tmdbId}${mediaType === 'tv' ? `/${season}/${episode}` : ''}?lang=it`,
            isElectron: !!(window.CapacitorCustomPlatform?.name === 'electron' || /Electron/.test(navigator.userAgent || '')),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      });

    return () => { cancelled = true; };
  }, [tmdbId, mediaType, season, episode]);

  // All'unmount (chiusura player): sblocca l'orientamento e ripristina l'impostazione
  // dell'app — chiudendo mentre è bloccato landscape, il telefono tornerebbe altrimenti
  // a restare in orizzontale anche fuori dal player.
  useEffect(() => {
    return () => {
      if (!Capacitor.isNativePlatform?.()) return;
      try {
        ScreenOrientation.unlock().then(() => {
          const s = JSON.parse(localStorage.getItem('vixsrc_settings') || '{}');
          applyRotationSetting(s.autoRotate);
        }).catch(() => {});
      } catch { /* unlock */ }
    };
  }, []);

  // ===== Auto-hide barra superiore (come un player normale) =====
  // Al play: visibile 3.5s poi sparisce. In pausa: torna. Tap sulla striscia in alto
  // (i tap sull'iframe non bubblano al documento: serve una zona nostra) la richiama.
  const bumpTopBar = () => {
    setShowTopBar(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowTopBar(false), 3500);
  };

  const keepTopBar = () => {
    clearTimeout(hideTimer.current);
    setShowTopBar(true);
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Tap sul VIDEO (iframe): i tap su un iframe cross-origin non arrivano all'app, ma il
  // focus passa all'iframe → il parent riceve 'blur'. È il segnale standard per rilevare
  // il tap sul player: con la barra nascosta, tocchi dove vuoi del video e la barra torna.
  useEffect(() => {
    const onBlur = () => {
      if (!showTopBar) bumpTopBar();
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [showTopBar]);

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
    // UN solo full screen (quello dell'app). Su Android il WebView non supporta il
    // fullscreen nativo (né per l'iframe né per i div): l'app È già a tutto schermo
    // (fixed inset-0), quindi il bottone fa il lock/unlock LANDSCAPE via plugin
    // nativo ScreenOrientation (l'API web window.screen.orientation.lock rifiuta il
    // lock fuori dal fullscreen: era quella la causa del bottone morto).
    const isNative = Capacitor.isNativePlatform?.();
    try {
      if (isNative) {
        if (!isFullscreen) {
          await ScreenOrientation.lock({ orientation: 'landscape' });
          setIsFullscreen(true);
        } else {
          await ScreenOrientation.unlock();
          setIsFullscreen(false);
          // ripristina l'impostazione di rotazione dell'app (portrait se autoRotate OFF)
          const s = JSON.parse(localStorage.getItem('vixsrc_settings') || '{}');
          applyRotationSetting(s.autoRotate);
        }
      } else {
        if (!document.fullscreenElement) {
          await containerRef.current?.requestFullscreen();
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn('Fullscreen:', e);
    }
  };

  // Get stream URL (ora async, gestito sopra con useEffect)

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Striscia per richiamare la barra quando nascosta (sotto la barra, sempre attiva) */}
      <button
        className="absolute top-0 left-0 right-0 h-14 z-[5] bg-transparent cursor-default"
        aria-label="Mostra controlli player"
        onClick={bumpTopBar}
        onMouseEnter={() => setShowTopBar(true)}
      />

      {/* Player Controls Overlay — auto-hide: sparisce dopo 3.5s di play */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showTopBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
        <div className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto">
          <div className="text-center max-w-2xl w-full">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-white text-lg mb-4">{streamError}</p>
            {streamDebug && (
              <details className="text-left bg-black/70 border border-white/10 rounded-lg p-3 mb-4 text-xs font-mono text-gray-300 max-h-60 overflow-y-auto">
                <summary className="cursor-pointer text-accent mb-2 font-sans text-sm">
                  Dettagli tecnici (clicca per espandere)
                </summary>
                <div className="space-y-1 break-all">
                  <div><b>Tipo errore:</b> {streamDebug.type}</div>
                  <div><b>URL chiamato:</b> {streamDebug.url}</div>
                  <div><b>Electron:</b> {String(streamDebug.isElectron)}</div>
                  <div><b>User-Agent:</b> {streamDebug.userAgent}</div>
                  <div><b>Timestamp:</b> {streamDebug.timestamp}</div>
                  <div className="mt-2"><b>Stack:</b><pre className="whitespace-pre-wrap text-red-300">{streamDebug.stack}</pre></div>
                </div>
              </details>
            )}
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              <strong className="text-white">VixStream</strong>, servizio di terze parti non
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

      {/* Tempo rimanente discreto — visibile solo con la barra (copre i controlli VixSrc) */}
      {duration > 0 && showTopBar && (
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
