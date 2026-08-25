import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Gestisce il pulsante/gesture "indietro" di Android dentro il WebView Capacitor:
 * pusha uno stato sentinella ad ogni navigazione e intercetta popstate,
 * così il back naviga nella storia dell'app invece di chiudere l'activity.
 */
const AndroidBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ad ogni cambio rotta, aggiungi una voce di history extra.
    // Il primo popstate la consuma: se ne resta un'altra, navighiamo indietro;
    // se siamo alla radice, lasciamo chiudere (comportamento nativo atteso).
    window.history.pushState({ vixRoute: location.pathname }, '');

    const onPopState = () => {
      // C'è ancora una voce sentinella? Allora torna indietro nell'app
      if (window.history.state?.vixRoute || window.history.length > 2) {
        navigate(-1);
        // ri-arma la sentinella per la vista precedente
        setTimeout(() => window.history.pushState({ vixRoute: 'back' }, ''), 0);
      }
      // altrimenti: nessuna sentinella → default (l'app si può chiudere)
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [location.pathname, navigate]);

  return null;
};

export default AndroidBackHandler;
