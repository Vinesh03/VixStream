import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Heart, Clock, Search, Settings, Menu, X } from 'lucide-react';
import { useDeviceType } from '../../hooks';
import useStore from '../../store/useStore';

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
 * con indicatore che scivola sulla voce attiva (stile Apple).
 */
const BottomTabBar = ({ pathname }) => {
  const themeId = useStore((s) => s.settings.theme || 'cinema');
  const isGlass = themeId === 'glass';
  const activeIndex = TAB_ITEMS.findIndex(t => t.path === pathname);

  if (isGlass) {
    return (
      <nav
        className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden animate-nav-float"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div className="glass-panel border border-white/20 rounded-full shadow-2xl overflow-hidden">
          <div className="relative flex items-center px-2 py-1.5">
            {/* Bolla scivolante con riflesso glossy (stile Apple) */}
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 w-16 rounded-full overflow-hidden"
              style={{
                left: '8px',
                transform: `translateX(${Math.max(activeIndex, 0) * 64}px)`,
                transition: 'transform .4s cubic-bezier(.34,1.3,.5,1)',
                opacity: activeIndex >= 0 ? 1 : 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.12) 45%, rgba(255,255,255,.04) 100%)',
                border: '1px solid rgba(255,255,255,.22)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,.35), inset 0 -1px 2px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.25)',
              }}
            >
              {/* Riflesso lucido in alto (highlight) */}
              <span
                className="absolute"
                style={{
                  top: '1px', left: '6px', right: '6px', height: '42%',
                  borderRadius: '9999px 9999px 60% 60%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0))',
                  filter: 'blur(.5px)',
                }}
              />
              {/* Bagliore inferiore */}
              <span
                className="absolute"
                style={{
                  bottom: '2px', left: '25%', right: '25%', height: '22%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,.18), transparent 70%)',
                }}
              />
            </span>
            {TAB_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  aria-label={label}
                  className={`relative z-10 flex flex-col items-center justify-center w-16 h-14 rounded-full transition-colors duration-300 ${
                    isActive ? 'text-[var(--c-accent)]' : 'text-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`} />
                  <span className={`text-[9px] font-medium mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
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

  // Barra classica full-width per gli altri temi (con animazione di morphing)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-theme md:hidden pb-[env(safe-area-inset-bottom)] animate-nav-bar">
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
