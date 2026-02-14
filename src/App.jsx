import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
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
  return (
    <Router>
      <div className="min-h-screen bg-primary">
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
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/tv-shows" element={<TVShows />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/continue-watching" element={<ContinueWatching />} />
                  <Route path="/details/:mediaType/:id" element={<Details />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
