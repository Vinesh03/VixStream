import { useEffect, useRef, useState } from 'react';

// Hook for TV Remote Navigation
export const useTVNavigation = (enabled = true) => {
  const focusableRefs = useRef([]);
  const currentFocusIndex = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const { key, keyCode } = e;
      
      // Map remote control keys
      const isUp = key === 'ArrowUp' || keyCode === 38;
      const isDown = key === 'ArrowDown' || keyCode === 40;
      const isLeft = key === 'ArrowLeft' || keyCode === 37;
      const isRight = key === 'ArrowRight' || keyCode === 39;
      const isEnter = key === 'Enter' || keyCode === 13;
      const isBack = key === 'Backspace' || keyCode === 8 || keyCode === 27;

      if (isUp || isDown || isLeft || isRight) {
        e.preventDefault();
        
        const elements = focusableRefs.current.filter(el => el && !el.disabled);
        if (elements.length === 0) return;

        let newIndex = currentFocusIndex.current;

        if (isDown || isRight) {
          newIndex = (currentFocusIndex.current + 1) % elements.length;
        } else if (isUp || isLeft) {
          newIndex = (currentFocusIndex.current - 1 + elements.length) % elements.length;
        }

        currentFocusIndex.current = newIndex;
        elements[newIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  const registerFocusable = (element) => {
    if (element && !focusableRefs.current.includes(element)) {
      focusableRefs.current.push(element);
    }
  };

  const clearFocusables = () => {
    focusableRefs.current = [];
    currentFocusIndex.current = 0;
  };

  return { registerFocusable, clearFocusables };
};

// Hook for detecting device type (phone / tablet / tv)
// Riesporta anche flag utili: isTV, isTouch, width
export const useDeviceType = () => {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    const detect = () => {
      const userAgent = navigator.userAgent || '';
      const ua = userAgent.toLowerCase();
      const width = window.innerWidth;
      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

      // TV: user agent con "tv" (Android TV, Google TV, Smart TV) o nessun touch + input D-pad
      const isTV = /\b(tv|smarttv|googletv|bravia|aft[a-z]|shield|chromecast)\b/.test(ua);

      let deviceType;
      if (isTV) deviceType = 'androidtv';
      else if (width >= 1024) deviceType = 'desktop';
      else if (width >= 768) deviceType = 'tablet';
      else deviceType = 'mobile';

      return { deviceType, isTV, isTouch, width };
    };

    return detect();
  });

  useEffect(() => {
    const onResize = () => setDeviceInfo(detect());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    // doppia rilevazione: alcuni WebView emettono resize prima che il layout
    // sia aggiornato dopo la rotazione → ricontrolla a rotazione completata
    let t;
    const onOrientationEnd = () => { clearTimeout(t); t = setTimeout(onResize, 250); };
    window.addEventListener('orientationchange', onOrientationEnd);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('orientationchange', onOrientationEnd);
      clearTimeout(t);
    };
  }, []);

  return deviceInfo;
};

// Hook for debouncing
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    const { current: currentObserver } = observer;
    if (node) currentObserver.observe(node);

    return () => currentObserver.disconnect();
  }, [node, options]);

  return [setNode, entry];
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
