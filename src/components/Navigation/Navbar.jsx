import React, { useEffect, useRef, useState } from 'react';
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

  // Bolla elastica: allungamento a due fasi (stretch → collapse), stile Apple
  const [bubble, setBubble] = useState({ index: Math.max(activeIndex, 0), hidden: activeIndex < 0 });
  const prevIndexRef = useRef(Math.max(activeIndex, 0));
  const timerRef = useRef(null);

  useEffect(() => {
    // Se la pagina corrente non è una tab (es. /settings), la bolla sfuma
    // senza animazioni elastiche verso posizioni fantasma
    if (activeIndex < 0) {
      clearTimeout(timerRef.current);
      setBubble(b => ({ ...b, hidden: true }));
      prevIndexRef.current = Math.max(prevIndexRef.current, 0);
      return;
    }
    if (activeIndex === prevIndexRef.current) {
      setBubble(b => ({ ...b, hidden: false }));
      return;
    }
    const from = prevIndexRef.current;
    const to = activeIndex;
    prevIndexRef.current = to;
    clearTimeout(timerRef.current);

    // Fase 1: la bolla si ALLUNGA da "from" ad abbracciare entrambe le posizioni
    const left = Math.min(from, to);
    const span = Math.abs(to - from);
    setBubble({ index: from, stretchLeft: left, stretchSpan: span, hidden: false });
    // Fase 2: si RITIRA sulla voce di destinazione
    timerRef.current = setTimeout(() => {
      setBubble({ index: to, stretchLeft: to, stretchSpan: span, hidden: false });
    }, 140);
    return () => clearTimeout(timerRef.current);
  }, [activeIndex]);

  const TAB_W = 64;

  if (isGlass) {
    // geometria bolla: o normale, oppure in fase stretch
    let bubbleStyle;
    if (bubble.stretchSpan != null && bubble.stretchSpan > 0 && !bubble.hidden) {
      const isStretching = bubble.index !== activeIndex;
      const left = isStretching ? bubble.stretchLeft : activeIndex;
      const w = isStretching ? TAB_W * (bubble.stretchSpan + 1) : TAB_W;
      bubbleStyle = {
        left: `${8 + left * TAB_W}px`,
        width: `${w}px`,
        transition: isStretching
          ? 'left .13s cubic-bezier(.4,0,.6,1), width .13s cubic-bezier(.4,0,.6,1)'
          : 'left .32s cubic-bezier(.34,1.25,.5,1), width .3s cubic-bezier(.34,1.25,.5,1)',
        opacity: 1,
        // leggero schiacciamento verticale durante lo stretch (effetto gomma)
        transform: isStretching ? 'scaleY(.82)' : 'scaleY(1)',
        transitionProperty: 'left, width, transform',
      };
    } else {
      bubbleStyle = {
        left: `${8 + bubble.index * TAB_W}px`,
        width: `${TAB_W}px`,
        opacity: bubble.hidden ? 0 : 1,
        transform: bubble.hidden ? 'scaleY(.6)' : 'scaleY(1)',
        transition: 'left .3s ease, opacity .25s ease, transform .25s ease, width .3s ease',
      };
    }

    return (
      <nav
        className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden animate-nav-float"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div className="glass-panel border border-white/20 rounded-full shadow-2xl overflow-hidden">
          <div className="relative flex items-center px-2 py-1.5">
            {/* Bolla elastica glossy */}
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-full overflow-hidden"
              style={{
                ...bubbleStyle,
                background: 'linear-gradient(180deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.12) 45%, rgba(255,255,255,.04) 100%)',
                border: '1px solid rgba(255,255,255,.22)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,.35), inset 0 -1px 2px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.25)',
              }}
            >
              {/* Riflesso lucido in alto */}
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
