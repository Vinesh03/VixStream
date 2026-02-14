# VixSrc Streaming App

App di streaming multi-piattaforma per Android (TV, telefoni, tablet) e Browser basata su VixSrc e TMDB.

## 🚀 Caratteristiche

- ✅ Streaming video on-demand tramite VixSrc
- ✅ Catalogo completo film e serie TV da TMDB
- ✅ Supporto Android TV con navigazione telecomando
- ✅ Interfaccia responsive per browser, tablet e smartphone
- ✅ Ricerca avanzata con filtri per genere, anno e rating
- ✅ Gestione preferiti locale
- ✅ "Continua a guardare" con tracking progresso
- ✅ Sottotitoli e qualità video adattiva
- ✅ Tema ultra-dark ottimizzato
- ✅ Personalizzazione API key TMDB

## 📋 Prerequisiti

- **Node.js** 18.x o superiore
- **npm** o **yarn**
- **Android Studio** (per build Android)
- **API Key TMDB** (gratuita da https://www.themoviedb.org/settings/api)

## 🛠️ Installazione

### 1. Clona il progetto

```bash
# Estrai il file ZIP nella directory desiderata
# oppure clona il repository Git
cd vixsrc-streaming-app
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura Capacitor

```bash
# Inizializza Capacitor
npx cap init

# Aggiungi la piattaforma Android
npx cap add android
```

## 🎮 Sviluppo

### Browser

```bash
# Avvia il server di sviluppo
npm run dev

# L'app sarà disponibile su http://localhost:3000
```

### Android (Emulatore/Dispositivo)

```bash
# Build dell'app
npm run build

# Sincronizza con Android
npm run android:sync

# Apri in Android Studio
npm run android:open

# Oppure esegui direttamente
npm run android:run
```

## 📱 Build di Produzione

### Browser

```bash
# Build ottimizzato per produzione
npm run build

# I file saranno in /dist
```

### Android APK/AAB

1. Apri il progetto in Android Studio:
```bash
npm run android:open
```

2. In Android Studio:
   - Build > Generate Signed Bundle/APK
   - Scegli APK o AAB
   - Configura keystore (crea uno nuovo se necessario)
   - Build release

3. L'APK/AAB sarà in `android/app/build/outputs/`

## 🎯 Configurazione Android TV

Il progetto include già il supporto per Android TV. Per ottimizzare:

1. Apri `android/app/src/main/AndroidManifest.xml`
2. Verifica che sia presente:

```xml
<uses-feature android:name="android.software.leanback" android:required="false" />
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />

<activity android:name=".MainActivity"
    android:banner="@drawable/banner"
    android:screenOrientation="landscape">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
    </intent-filter>
</activity>
```

## 🔑 Gestione API Key

L'app include una API key TMDB di default, ma puoi personalizzarla:

1. **Tramite interfaccia**: Vai in Impostazioni > Chiave API TMDB
2. **Tramite codice**: Modifica `src/services/tmdb.js`

```javascript
const DEFAULT_API_KEY = 'TUA_CHIAVE_QUI';
```

## 🎨 Personalizzazione

### Colori e Tema

Modifica `tailwind.config.js`:

```javascript
colors: {
  primary: '#1a1a1a',    // Sfondo principale
  accent: '#e50914',      // Colore accent (pulsanti, highlight)
  // ...
}
```

### Branding

Il branding "Fatto con vibecoding e amore da SheetSeeker1486" è nelle impostazioni.
Per modificarlo, vedi `src/pages/Settings.jsx` alla fine della pagina.

## 📂 Struttura del Progetto

```
vixsrc-streaming-app/
├── src/
│   ├── components/         # Componenti React
│   │   ├── Common/        # Loading, Error, etc.
│   │   ├── MediaCard/     # Card per film/serie
│   │   ├── MediaGrid/     # Griglia contenuti
│   │   ├── Navigation/    # Navbar
│   │   └── VideoPlayer/   # Player VixSrc
│   ├── pages/             # Pagine principali
│   │   ├── Home.jsx
│   │   ├── Movies.jsx
│   │   ├── TVShows.jsx
│   │   ├── Search.jsx
│   │   ├── Details.jsx
│   │   ├── Player.jsx
│   │   ├── Favorites.jsx
│   │   ├── ContinueWatching.jsx
│   │   └── Settings.jsx
│   ├── services/          # API e storage
│   │   ├── tmdb.js       # TMDB API
│   │   ├── vixsrc.js     # VixSrc streaming
│   │   └── storage.js    # LocalStorage
│   ├── store/            # State management (Zustand)
│   │   └── useStore.js
│   ├── hooks/            # Custom hooks
│   │   └── index.js
│   ├── styles/           # CSS
│   │   └── index.css
│   ├── App.jsx           # App principale
│   └── main.jsx          # Entry point
├── android/              # Progetto Android (generato)
├── public/               # Asset statici
├── index.html
├── package.json
├── vite.config.js
├── capacitor.config.ts
└── README.md
```

## 🔧 Troubleshooting

### Il player non carica i video
- Verifica la connessione internet
- Controlla che l'ID TMDB sia corretto
- Verifica che VixSrc sia raggiungibile

### Android TV: navigazione non funziona
- Assicurati di essere in modalità TV nel manifest
- Verifica che i componenti abbiano la classe `tv-focusable`

### Build Android fallisce
- Verifica di avere Android Studio aggiornato
- Controlla che Java JDK sia installato
- Sincronizza il progetto Gradle

## 🌐 Deploy Browser

### Netlify/Vercel

1. Collega il repository GitHub
2. Imposta il build command: `npm run build`
3. Imposta la directory di output: `dist`
4. Deploy!

### Server tradizionale

```bash
npm run build
# Carica il contenuto di /dist sul server
```

## 📱 Controlli

### Browser/Desktop
- **Mouse**: Click per navigare
- **Tastiera**: Tab per navigazione, Enter per selezionare

### Android TV
- **Telecomando**: D-pad per navigare, OK per selezionare, Back per tornare indietro
- **Mouse**: Supportato
- **Touchscreen**: Supportato (se disponibile)

### Mobile/Tablet
- **Touch**: Tap per navigare e selezionare
- **Swipe**: Scorrimento naturale

## 📄 Licenza

Progetto personale - Fatto con vibecoding e amore da SheetSeeker1486

## 🙏 Credits

- **VixSrc**: Servizio di streaming
- **TMDB**: Database film e serie TV
- **Capacitor**: Framework multi-piattaforma
- **React**: UI Framework
- **TailwindCSS**: Styling

## 📞 Supporto

Per problemi o domande, crea una issue nel repository GitHub.

---

**Made with ❤️ by SheetSeeker1486**
