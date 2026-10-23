import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, AlertTriangle, SkipForward, ListVideo } from 'lucide-react';
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
  autoPlay = true,
  episodes = [],
  hasNextEpisode = false,
  onNextEpisode = null,
  onSelectEpisode = null,
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExternalHint, setShowExternalHint] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showEpDrawer, setShowEpDrawer] = useState(false);
  const hideTimer = useRef(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [streamDebug, setStreamDebug] = useState(null);

  const {
    addContinueWatching,
    updateProgress,
    addToWatchHistory,
    settings,
  } = useStore();

  useEffect(() => {
    let lastSaved = 0;
    const cleanup = vixsrcService.setupPlayerEvents(iframeRef.current, {
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);

        if (dur > 0 && time - lastSaved >= 10) {
          lastSaved = time;
          const progress = (time / dur) * 100;
          updateProgress(tmdbId, mediaType, progress, season, episode);
        }
      },
      onPlay: (time, dur) => {
        setShowExternalHint(false);
        bumpTopBar();
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
          duration: dur,
        });
      },
      onPause: () => {
        keepTopBar();
      },
      onEnded: () => {
        addToWatchHistory({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title,
        });
        if (hasNextEpisode && onNextEpisode) {
          onNextEpisode();
        }
      },
    });

    return cleanup;
  }, [tmdbId, mediaType, season, episode, hasNextEpisode, onNextEpisode]);

  useEffect(() => {
    let cancelled = false;
    setStreamUrl(null);
    setStreamError(null);

    const opts = {
      ...vixsrcService.getDefaultOptions(),
      autoplay: autoPlay,
      lang: settings.language || 'it',
    };

    vixsrcService.getStreamUrl(mediaType, tmdbId, season, episode, opts)
      .then((url) => {
        if (!cancelled) setStreamUrl(url);
      })
      .catch((err) => {
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
            timestamp: new Date().toISOString(),
          });
        }
      });

    return () => { cancelled = true; };
  }, [tmdbId, mediaType, season, episode]);

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

  useEffect(() => {
    const onBlur = () => {
      if (!showTopBar) bumpTopBar();
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [showTopBar]);

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
    const isNative = Capacitor.isNativePlatform?.();
    try {
      if (isNative) {
        if (!isFullscreen) {
          await ScreenOrientation.lock({ orientation: 'landscape' });
          setIsFullscreen(true);
        } else {
          await ScreenOrientation.unlock();
          setIsFullscreen(false);
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

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      {/* Striscia invisibile per richiamare i controlli */}
      <button
        className="absolute top-0 left-0 right-0 h-16 z-[5] bg-transparent cursor-default"
        aria-label="Mostra controlli player"
        onClick={bumpTopBar}
        onMouseEnter={() => setShowTopBar(true)}
      />

      {/* Top Bar Player */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${showTopBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-lg font-semibold text-white truncate max-w-sm md:max-w-xl">
            {title}
          </h2>

          <div className="flex items-center gap-1.5 md:gap-2">
            {mediaType === 'tv' && episodes.length > 0 && (
              <button
                onClick={() => setShowEpDrawer(true)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white transition-all active:scale-95 border border-white/10 flex items-center gap-1.5 text-xs font-medium"
                title="Lista episodi"
                aria-label="Lista episodi"
              >
                <ListVideo className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                <span className="hidden sm:inline">Episodi</span>
              </button>
            )}

            {mediaType === 'tv' && hasNextEpisode && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-white transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-semibold"
                title="Prossimo episodio"
                aria-label="Prossimo episodio"
              >
                <SkipForward className="w-4 h-4" />
                <span className="hidden sm:inline">Prossimo</span>
              </button>
            )}

            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
              aria-label="Apri in nuova finestra"
              title="Apri sorgente esterna"
            >
              <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
            </a>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
              aria-label={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
              aria-label="Chiudi player"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer / Cassetto Episodi rapido */}
      {showEpDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setShowEpDrawer(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-surface border-l border-white/10 p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Episodi · Stagione {season}
                </h3>
              </div>
              <button
                onClick={() => setShowEpDrawer(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {episodes.map((ep) => {
                const isCurrent = ep.episode_number === episode;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      if (onSelectEpisode) onSelectEpisode(ep.episode_number);
                      setShowEpDrawer(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-accent/20 border-accent text-white font-semibold'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCurrent ? 'bg-accent text-white' : 'bg-secondary text-gray-400'
                    }`}>
                      {ep.episode_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{ep.name || `Episodio ${ep.episode_number}`}</p>
                      {ep.air_date && <p className="text-[10px] text-gray-500">{ep.air_date}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VixSrc Iframe Player */}
      {streamError ? (
        <div className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto">
          <div className="text-center max-w-2xl w-full">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-white text-base md:text-lg mb-4">{streamError}</p>
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

      {showExternalHint && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 max-w-md mx-4">
          <div className="glass-panel border border-theme rounded-2xl p-4 flex items-start gap-3 shadow-2xl">
            <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-gray-300 leading-relaxed">
              Stai riproducendo tramite il catalogo esterno{' '}
              <strong className="text-white">VixStream</strong>. Se il video non si avvia, usa{' '}
              <ExternalLink className="w-3.5 h-3.5 inline text-accent" /> in alto per aprirlo nel browser.
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

      {/* Tempo rimanente discreto */}
      {duration > 0 && showTopBar && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/70 backdrop-blur rounded-full px-3.5 py-1 border border-white/10">
            <span className="text-xs font-mono text-white/90">
              -{formatTime(Math.max(duration - currentTime, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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
