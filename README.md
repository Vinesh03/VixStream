# VixSrc Streaming App

App di streaming multi-piattaforma (Android phone/tablet/TV + browser) basata su VixSrc e TMDB.

![stack](https://img.shields.io/badge/React-18-blue) ![capacitor](https://img.shields.io/badge/Capacitor-6-black) ![vite](https://img.shields.io/badge/Vite-5-purple) ![tailwind](https://img.shields.io/badge/TailwindCSS-3-teal)

## ✨ Caratteristiche

### Catalogo e streaming
- 🎬 **Catalogo completo** film e serie TV da TMDB (in italiano)
- ▶️ **Player integrato** VixSrc con token freschi via API (nessun embed scaduto)
- 🔍 **Ricerca avanzata** con filtri per genere, anno, rating e ordinamento
- ❤️ **Preferiti** e **"Continua a guardare"** con tracking del progresso (salvataggio ogni 10s)
- ⏭️ **Al cinema ora**, trending film/serie, top rated

### Layout adattivo
- 📱 **Telefono**: header compatto + bottom tab bar, griglia 2 colonne
- 💻 **Tablet/desktop**: navbar classica, griglia responsive 3–6 colonne
- 📺 **Android TV**: navbar ingrandita, **anello di focus D-pad** (bordo bianco+accento con scale-up), avvio dal launcher Leanback

### Interfaccia
- 🎨 **4 temi**: Cinema Dark *(default)* · Liquid Glass (stile Apple) · One UI (Samsung) · AMOLED Pure Black
- 🌈 **Colore accento personalizzabile** (8 preset + color picker libero)
- ✨ Animazioni: transizioni pagina, card a cascata, skeleton shimmer
- 🍎 Tema Liquid Glass con **navbar floating pill** e bolla elastica glossy stile Apple
- ⚠️ Disclaimer contenuti di terze parti all'avvio ("non mostrare più" disponibile)

### Android
- Gesture/pulsante **back** integrato con la navigazione interna
- Chiusura dalla home con animazione scale-down
- APK leggero (~3,7 MB)

## 🛠️ Sviluppo

### Prerequisiti
- Node.js 18+
- JDK 21 + Android SDK (per la build Android)

```bash
# Installa le dipendenze
npm install

# Sviluppo browser (http://localhost:3000)
npm run dev

# Build produzione web
npm run build

# Build Android
npm run android:build        # build web + sync
cd android && ./gradlew assembleDebug   # APK in android/app/build/outputs/apk/debug/
```

### Configurazione
- **API key TMDB**: modificabile dall'app (Impostazioni → Chiave API TMDB). Il default è già funzionante.
- I contenuti video sono serviti da **VixSrc**: l'app ottiene l'URL embed con token fresco tramite `https://vixsrc.to/api/{movie|tv}/{id}`.

## 📂 Struttura

```
src/
├── components/
│   ├── Common/          # Loading, Error, DisclaimerModal, Skeleton,
│   │                    # PageTransition, ScrollToTop, AndroidBackHandler
│   ├── Navigation/      # Navbar adattiva (bottom bar / pill floating / top bar TV)
│   ├── MediaCard/       # Card poster con overlay play/preferiti
│   ├── MediaGrid/       # Griglia responsive con stagger animation
│   └── VideoPlayer/     # Player VixSrc (token freschi, fullscreen, countdown)
├── pages/               # Home, Movies, TVShows, Search, Details, Player,
│                        # Favorites, ContinueWatching, Settings
├── services/
│   ├── tmdb.js          # API TMDB
│   ├── vixsrc.js        # API VixSrc (+CapacitorHttp per bypass CORS su Android)
│   ├── storage.js       # localStorage (preferiti, progresso, impostazioni)
│   ├── themes.js        # Sistema temi via CSS custom properties
│   └── orientation.js   # Gestione orientamento schermo
├── hooks/index.js       # useDeviceType, useTVNavigation, useDebounce...
└── store/useStore.js    # Stato globale (Zustand)
```

## 📄 Licenza

Progetto personale — fatto con vibecoding e amore da SheetSeeker1486

## 🙏 Credits

- [VixSrc](https://vixsrc.to) — sorgenti streaming
- [TMDB](https://www.themoviedb.org) — database film e serie TV
- [Capacitor](https://capacitorjs.com), [React](https://react.dev), [TailwindCSS](https://tailwindcss.com)

---

> ⚠️ **Avvertenza**: questa app è solo un'interfaccia verso servizi di terze parti. I contenuti video sono forniti e gestiti interamente da VixSrc e non dipendono dagli sviluppatori. Usala in modo consapevole e nel rispetto delle leggi del tuo paese.
