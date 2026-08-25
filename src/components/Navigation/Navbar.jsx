import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Heart, Clock, Search, Settings, Menu, X } from 'lucide-react';
import { useDeviceType } from '../../hooks';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/movies', label: 'Film', icon: Film },
  { path: '/tv-shows', label: 'Serie TV', icon: Tv },
  { path: '/favorites', label: 'Preferiti', icon: Heart },
  { path: '/continue-watching', label: 'Continua', icon: Clock },
  { path: '/search', label: 'Cerca', icon: Search },
];

// Impostazioni è accessibile dall'icona ingranaggio, non come voce principale

const TAB_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/movies', label: 'Film', icon: Film },
  { path: '/tv-shows', label: 'Serie', icon: Tv },
  { path: '/favorites', label: 'Preferiti', icon: Heart },
  { path: '/continue-watching', label: 'Continua', icon: Clock },
];

/**
 * Bottom tab bar mobile. Nel tema Liquid Glass diventa una pillola floating
 * staccata dai bordi (stile Apple); negli altri temi resta la barra classica.
 */
const BottomTabBar = ({ pathname }) => {
  const isGlass = document.documentElement.dataset.theme === 'glass';

  if (isGlass) {
    return (
      <nav
        className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div className="glass-panel border border-white/20 rounded-full shadow-2xl overflow-hidden">
          <div className="flex items-center px-2 py-1.5 gap-1">
            {TAB_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  aria-label={label}
                  className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300 ${
                    isActive ? 'text-[var(--c-accent)]' : 'text-gray-300'
                  }`}
                >
                  {/* Pillola animata dietro l'icona attiva */}
                  <span
                    className={`absolute inset-x-1 top-1 bottom-1 rounded-full bg-white/10 transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                  />
                  <Icon className={`relative w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`} />
                  <span className={`relative text-[9px] font-medium mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // Barra classica full-width per gli altri temi
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-theme md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {TAB_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? 'text-accent' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { deviceType, isTV } = useDeviceType();

  // Bottom tab bar solo su telefono (mobile)
  if (deviceType === 'mobile') {
    return (
      <>
        {/* Header compatto mobile */}
        <nav className="glass-panel border-b border-theme sticky top-0 z-40 md:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/" className="text-xl font-bold text-accent">
              VixSrc
            </Link>
            <div className="flex items-center gap-1">
              <Link
                to="/search"
                className={`p-2 rounded-lg ${location.pathname === '/search' ? 'bg-accent text-white' : 'text-gray-300'}`}
                aria-label="Cerca"
              >
                <Search className="w-5 h-5" />
              </Link>
              <Link
                to="/settings"
                className={`p-2 rounded-lg ${location.pathname === '/settings' ? 'bg-accent text-white' : 'text-gray-300'}`}
                aria-label="Impostazioni"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Bottom tab bar mobile (floating pill nel tema Liquid Glass) */}
        <BottomTabBar pathname={location.pathname} />
      </>
    );
  }

  // Navbar orizzontale classica per desktop/tablet/TV (D-pad friendly)
  return (
    <nav className="glass-panel border-b border-theme sticky top-0 z-40">
      <div className={deviceType === 'androidtv' || isTV ? 'container mx-auto px-12' : 'container mx-auto px-4'}>
        <div className={`flex items-center justify-between ${deviceType === 'androidtv' || isTV ? 'h-20' : 'h-16'}`}>
          {/* Logo */}
          <Link 
            to="/" 
            className={`font-bold text-accent hover:text-accent-hover transition-colors ${
              deviceType === 'androidtv' || isTV ? 'text-3xl' : 'text-2xl'
            }`}
          >
            VixSrc
          </Link>

          {/* Desktop / Tablet / TV Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 rounded-lg transition-all tv-focusable
                  ${(deviceType === 'androidtv' || isTV) ? 'px-5 py-3 text-lg' : 'px-4 py-2'}
                  ${location.pathname === path
                    ? 'bg-accent text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className={(deviceType === 'androidtv' || isTV) ? 'w-6 h-6' : 'w-5 h-5'} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <Link
              to="/settings"
              className={`p-2 ml-2 rounded-lg transition-all tv-focusable ${
                location.pathname === '/settings'
                  ? 'bg-accent text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              aria-label="Impostazioni"
            >
              <Settings className={(deviceType === 'androidtv' || isTV) ? 'w-6 h-6' : 'w-5 h-5'} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
