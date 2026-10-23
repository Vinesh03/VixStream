import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Heart, Clock, Search, Settings } from 'lucide-react';
import { useDeviceType } from '../../hooks';

const TAB_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/movies', label: 'Film', icon: Film },
  { path: '/tv-shows', label: 'Serie', icon: Tv },
  { path: '/favorites', label: 'Preferiti', icon: Heart },
  { path: '/continue-watching', label: 'Continua', icon: Clock },
];

const BottomTabBar = ({ pathname }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-white/10 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {TAB_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all active:scale-95 ${
                isActive ? 'text-accent' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] ${isActive ? 'font-semibold text-accent' : 'font-medium'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Navbar = () => {
  const location = useLocation();
  const { deviceType, isTV } = useDeviceType();

  if (deviceType === 'mobile') {
    return (
      <>
        {/* Header compatto mobile */}
        <header className="bg-primary/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 md:hidden">
          <div className="flex items-center justify-between h-13 px-4 py-2">
            <Link to="/" className="text-lg font-bold text-accent tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              VixStream
            </Link>
            <div className="flex items-center gap-1.5">
              <Link
                to="/search"
                className={`p-2 rounded-xl transition-colors ${location.pathname === '/search' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'}`}
                aria-label="Cerca"
              >
                <Search className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/settings"
                className={`p-2 rounded-xl transition-colors ${location.pathname === '/settings' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'}`}
                aria-label="Impostazioni"
              >
                <Settings className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>
        </header>

        <BottomTabBar pathname={location.pathname} />
      </>
    );
  }

  // Navbar orizzontale desktop/tablet/TV
  return (
    <header className="bg-primary/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className={deviceType === 'androidtv' || isTV ? 'container mx-auto px-12' : 'container mx-auto px-4'}>
        <div className={`flex items-center justify-between ${deviceType === 'androidtv' || isTV ? 'h-20' : 'h-16'}`}>
          <Link 
            to="/" 
            className={`font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-2 ${
              deviceType === 'androidtv' || isTV ? 'text-3xl' : 'text-xl'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            VixStream
          </Link>

          <nav className="flex items-center gap-1.5">
            {TAB_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 rounded-xl transition-all tv-focusable
                  ${(deviceType === 'androidtv' || isTV) ? 'px-5 py-3 text-lg' : 'px-3.5 py-2 text-sm'}
                  ${location.pathname === path
                    ? 'bg-accent text-white font-semibold shadow-md shadow-accent/20'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white font-medium'
                  }
                `}
              >
                <Icon className={(deviceType === 'androidtv' || isTV) ? 'w-6 h-6' : 'w-4 h-4'} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/search"
              className={`p-2 ml-1 rounded-xl transition-all tv-focusable ${
                location.pathname === '/search' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
              aria-label="Cerca"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>
            <Link
              to="/settings"
              className={`p-2 rounded-xl transition-all tv-focusable ${
                location.pathname === '/settings' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
              aria-label="Impostazioni"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
