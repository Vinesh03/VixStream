import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import DisclaimerModal from './components/Common/DisclaimerModal';
import AndroidBackHandler from './components/Common/AndroidBackHandler';
import ScrollToTop from './components/Common/ScrollToTop';
import PageTransition from './components/Common/PageTransition';
import { applyRotationSetting } from './services/orientation';
import { applyTheme } from './services/themes';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import ContinueWatching from './pages/ContinueWatching';
import Details from './pages/Details';
import Player from './pages/Player';
import Settings from './pages/Settings';

function App() {
  // Disclaimer mostrato una sola volta (salvato in localStorage se "non mostrare più")
  const [showDisclaimer, setShowDisclaimer] = useState(
    () => localStorage.getItem('vixsrc_disclaimer_accepted') !== 'true'
  );

  // Applica tema e colore accento salvati all'avvio (la rotazione la decide il dispositivo)
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('vixsrc_settings') || '{}');
    applyTheme(s.theme, s.accentColor || null);
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-primary">
        <AndroidBackHandler />
        <ScrollToTop />
        {/* Applica l'orientamento salvato all'avvio */}
        {showDisclaimer && (
          <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />
        )}
        <Routes>
          {/* Player route - full screen, no navbar */}
          <Route path="/player/:mediaType/:id" element={<Player />} />
          <Route path="/player/:mediaType/:id/:season/:episode" element={<Player />} />
          
          {/* Routes with navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/tv-shows" element={<TVShows />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/continue-watching" element={<ContinueWatching />} />
                    <Route path="/details/:mediaType/:id" element={<Details />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Catch-all: qualsiasi URL sconosciuto torna alla home */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </PageTransition>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
