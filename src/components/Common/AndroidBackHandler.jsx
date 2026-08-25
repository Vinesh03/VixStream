import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

/**
 * Gestisce il pulsante/gesture "indietro" di Android dentro il WebView Capacitor
 * usando l'evento NATIVO backButton del plugin @capacitor/app.
 * Se c'è storia nell'app → torna indietro; se siamo alla radice → lascia chiudere.
 *
 * Nota predictive back: il manifest ha enableOnBackInvokedCallback=true, così
 * Android 14+ mostra l'anteprima di sistema (slide dell'app) quando si sta per
 * chiudere — cioè solo quando siamo alla radice e non intercettiamo l'evento.
 */
const AndroidBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener;

    const setup = async () => {
      if (!CapacitorApp?.addListener) return;

      listener = await CapacitorApp.addListener('backButton', () => {
        const atRoot = window.location.pathname === '/' || window.location.pathname === '';
        const canGoBack = window.history.length > 1;

        if (!atRoot && canGoBack) {
          navigate(-1);
        } else if (!atRoot && !canGoBack) {
          navigate('/');
        } else {
          // Siamo alla radice: animazione di chiusura stile predictive back
          // (scale-down + fade), poi usciamo.
          const root = document.getElementById('root');
          if (root) {
            root.style.transition = 'transform 220ms cubic-bezier(.3,0,.7,.4), opacity 220ms ease';
            root.style.transformOrigin = '50% 92%';
            root.style.transform = 'scale(0.88)';
            root.style.opacity = '0.35';
            root.style.borderRadius = '24px';
            root.style.overflow = 'hidden';
          }
          setTimeout(() => CapacitorApp.exitApp(), 230);
        }
      });
    };

    setup();
    return () => { listener?.remove?.(); };
  }, [navigate, location.pathname]);

  return null;
};

export default AndroidBackHandler;
