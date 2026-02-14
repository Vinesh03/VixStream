import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
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
  
  const { 
    addContinueWatching, 
    updateProgress,
    addToWatchHistory,
    settings 
  } = useStore();

  useEffect(() => {
    // Setup player event listeners
    const cleanup = vixsrcService.setupPlayerEvents(iframeRef.current, {
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
        
        // Update progress every 10 seconds
        if (time % 10 < 0.5) {
          const progress = (time / dur) * 100;
          updateProgress(tmdbId, mediaType, progress, season, episode);
        }
      },
      onPlay: (time, dur) => {
        // Add to continue watching when playback starts
        addContinueWatching({
          id: tmdbId,
          media_type: mediaType,
          season,
          episode,
          title,
          progress: (time / dur) * 100,
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

  // Get stream URL
  const streamUrl = mediaType === 'movie'
    ? vixsrcService.getMovieStreamUrl(tmdbId, {
        autoplay: autoPlay,
        ...vixsrcService.getDefaultOptions()
      })
    : vixsrcService.getTVStreamUrl(tmdbId, season, episode, {
        autoplay: autoPlay,
        ...vixsrcService.getDefaultOptions()
      });

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
      <iframe
        ref={iframeRef}
        src={streamUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={`Player - ${title}`}
      />

      {/* Progress Indicator (optional) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm text-white mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;
