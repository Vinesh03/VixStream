import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Youtube } from 'lucide-react';

const TrailerModal = ({ videoKey, title = 'Trailer', onClose }) => {
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
  const watchUrl = `https://www.youtube.com/watch?v=${videoKey}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-surface border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-xs md:text-sm font-semibold text-white truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all active:scale-95"
              title="Apri direttamente nell'app YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Apri su YouTube</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
              aria-label="Chiudi trailer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video iframe */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TrailerModal;
