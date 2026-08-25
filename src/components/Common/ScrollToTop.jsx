import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ripristina lo scroll in cima alla pagina ad ogni cambio di rotta.
 * Risolve il caso in cui il WebView riapre l'app/una pagina mantenendo
 * la posizione di scroll precedente (o il focus su una card in fondo).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // immediate + preventScroll false: porta davvero in cima
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
