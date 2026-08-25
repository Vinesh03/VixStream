import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Wrapper di transizione pagina: anima l'entrata del contenuto ad ogni cambio rotta.
 * Leggero: solo una classe CSS ri-armata a ogni pathname.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey(k => k + 1);
    // scroll to top gestito da ScrollToTop; qui solo animazione
  }, [location.pathname]);

  return (
    <div key={animKey} className="animate-page-in">
      {children}
    </div>
  );
};

export default PageTransition;
