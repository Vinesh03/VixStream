import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Youtube, Play } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export function launchYoutubeExternal(videoKey) {
  if (!videoKey) return;
  const url = `https://www.youtube.com/watch?v=${videoKey}`;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const TrailerModal = ({ videoKey, title = 'Trailer', onClose }) => {
  const isNative = Capacitor.isNativePlatform?.();
  const [tryEmbed, setTryEmbed] = useState(!isNative);

  useEffect(() => {
    setTryEmbed(!isNative);
  }, [videoKey, isNative]);

  useEffect(() => {
    if (!videoKey) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [videoKey, onClose]);

  if (!videoKey) return null;

  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : 'https%3A%2F%2Flocalhost';
  const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&playsinline=1&rel=0&modestbranding=1&origin=${origin}`;
  const thumbUrl = `https://i.ytimg.com/vi/${videoKey}/hqdefault.jpg`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-xs md:text-sm font-semibold text-white truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => launchYoutubeExternal(videoKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Apri app YouTube</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
              aria-label="Chiudi trailer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative w-full aspect-video bg-black">
          {!tryEmbed ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
              <img
                src={thumbUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" />
              <div className="relative z-10 flex flex-col items-center text-center px-6">
                <button
                  onClick={() => {
                    launchYoutubeExternal(videoKey);
                    onClose();
                  }}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 mb-3"
                  aria-label="Avvia su YouTube"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
                <p className="text-sm font-semibold text-white mb-1">Guarda il trailer senza blocco login</p>
                <p className="text-xs text-gray-300 max-w-md mb-4">
                  Si apre direttamente nell'app YouTube (o browser di sistema) per evitare la richiesta di accesso anti-bot dei WebView Android.
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      launchYoutubeExternal(videoKey);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg transition-transform active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <Youtube className="w-4 h-4" /> Avvia su YouTube
                  </button>
                  <button
                    onClick={() => setTryEmbed(true)}
                    className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-medium transition-colors"
                  >
                    Prova player interno
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TrailerModal;
