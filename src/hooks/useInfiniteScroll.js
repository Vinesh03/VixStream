import { useEffect, useRef } from 'react';

/**
 * Infinite scroll: chiama onLoadMore quando il sentinel si avvicina al viewport
 * (pre-carico 600px prima del fondo — non aspetti mai il caricamento).
 * Uso: <div ref={sentinelRef} /> in fondo alla lista.
 */
export const useInfiniteScroll = ({ onLoadMore, hasMore, loading, rootMargin = '600px' }) => {
  const sentinelRef = useRef(null);
  const cbRef = useRef(onLoadMore);
  cbRef.current = onLoadMore;

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cbRef.current();
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, rootMargin]);

  return sentinelRef;
};
