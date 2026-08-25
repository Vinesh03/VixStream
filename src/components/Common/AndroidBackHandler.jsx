import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

/**
 * Gestisce il pulsante/gesture "indietro" di Android dentro il WebView Capacitor
 * usando l'evento NATIVO backButton del plugin @capacitor/app.
 * Se c'è storia nell'app → torna indietro; se siamo alla radice → lascia chiudere.
 */
const AndroidBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener;

    const setup = async () => {
      // Il plugin esiste solo su piattaforma nativa (Android/iOS)
      if (!CapacitorApp?.addListener) return;

      listener = await CapacitorApp.addListener('backButton', () => {
        // Se possiamo tornare indietro nella storia dell'app, fallo;
        // altrimenti il default chiude l'app (comportamento atteso in home).
        if (window.history.length > 1 && window.location.pathname !== '/') {
          navigate(-1);
        } else if (window.location.pathname !== '/' && window.history.length <= 1) {
          // nessuna storia ma non siamo in home: vai alla home invece di uscire
          navigate('/');
        }
        // In home senza storia: non fare nulla → Capacitor chiude l'app (default)
      });
    };

    setup();
    return () => { listener?.remove?.(); };
  }, [navigate, location.pathname]);

  return null;
};

export default AndroidBackHandler;
