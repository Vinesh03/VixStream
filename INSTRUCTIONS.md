# 🚀 Istruzioni per Setup e GitHub

## 📥 Primi Passi

### 1. Scarica ed estrai il progetto
- Scarica il file ZIP
- Estrai nella directory desiderata (es. `C:\Projects\vixsrc-streaming-app`)

### 2. Apri il terminale nella directory del progetto
```bash
cd percorso/dove/hai/estratto/vixsrc-streaming-app
```

### 3. Installa le dipendenze
```bash
npm install
```

### 4. Prova l'app in locale
```bash
npm run dev
```
Apri il browser su `http://localhost:3000`

## 🔐 Setup GitHub (Repository Privato)

### Opzione A: Tramite GitHub Desktop (Più facile)

1. **Scarica GitHub Desktop**: https://desktop.github.com/
2. **Installa e accedi** con il tuo account GitHub
3. **File > Add Local Repository** e seleziona la cartella del progetto
4. **Publish repository**
   - Dai un nome: `vixsrc-streaming-app`
   - ✅ Spunta "Keep this code private"
   - Click su "Publish repository"

### Opzione B: Tramite Linea di Comando

#### 1. Crea il repository su GitHub.com
- Vai su https://github.com/new
- Nome repository: `vixsrc-streaming-app`
- ✅ Seleziona **Private**
- ❌ NON aggiungere README, .gitignore, o license (già inclusi nel progetto)
- Click "Create repository"

#### 2. Collega il repository locale
Apri il terminale nella directory del progetto ed esegui:

```bash
# Inizializza Git (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Crea il primo commit
git commit -m "Initial commit: VixSrc Streaming App"

# Collega al repository GitHub (sostituisci TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/vixsrc-streaming-app.git

# Pusha il codice
git branch -M main
git push -u origin main
```

#### 3. Inserisci le credenziali quando richiesto
- Username: il tuo username GitHub
- Password: **Personal Access Token** (non la password normale!)

**Come creare un Personal Access Token:**
1. Vai su https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Dai un nome (es. "VixSrc App")
4. Seleziona scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPIA IL TOKEN** (non potrai vederlo di nuovo!)
7. Usalo al posto della password quando Git te lo chiede

## 🔄 Aggiornamenti Futuri

Quando modifichi il codice:

```bash
# Vedi cosa hai modificato
git status

# Aggiungi le modifiche
git add .

# Crea un commit
git commit -m "Descrizione delle modifiche"

# Pusha su GitHub
git push
```

## ⚙️ Build per Produzione

### Browser
```bash
npm run build
# I file saranno in /dist
```

### Android
```bash
# Prima build
npm run build

# Sincronizza con Android
npx cap sync android

# Apri in Android Studio
npx cap open android
```

In Android Studio:
- Build > Generate Signed Bundle/APK
- Segui il wizard per creare l'APK

## 📱 Test su Android

### Su emulatore
1. Apri Android Studio
2. AVD Manager > Create Virtual Device
3. Scegli un dispositivo (es. Pixel 5)
4. Esegui: `npm run android:run`

### Su dispositivo fisico
1. Abilita "Opzioni sviluppatore" sul dispositivo
2. Abilita "Debug USB"
3. Collega il dispositivo al PC
4. Esegui: `npm run android:run`

### Su Android TV
1. Usa un emulatore Android TV in Android Studio
2. Oppure abilita debug ADB su TV fisica
3. Esegui: `npm run android:run`

## 🎨 Personalizzazioni Comuni

### Cambiare i colori
File: `tailwind.config.js`
```javascript
colors: {
  accent: '#TUO_COLORE',
}
```

### Cambiare API key di default
File: `src/services/tmdb.js`
```javascript
const DEFAULT_API_KEY = 'TUA_CHIAVE';
```

### Cambiare nome app
File: `capacitor.config.ts`
```typescript
appName: 'TUO_NOME',
```

File: `package.json`
```json
"name": "tuo-nome",
```

## 🆘 Problemi Comuni

### "npm: command not found"
**Soluzione**: Installa Node.js da https://nodejs.org/

### "capacitor: command not found"
**Soluzione**: 
```bash
npm install -g @capacitor/cli
```

### Build Android fallisce
**Soluzioni**:
1. Assicurati di avere Android Studio installato
2. Installa Android SDK (tramite Android Studio)
3. Imposta ANDROID_HOME nelle variabili d'ambiente

### L'app non si connette a VixSrc
**Soluzioni**:
1. Verifica la connessione internet
2. Prova a disabilitare firewall/antivirus temporaneamente
3. Controlla che VixSrc sia online: https://vixsrc.to

## 📚 Link Utili

- **TMDB API Docs**: https://developer.themoviedb.org/docs
- **VixSrc**: https://vixsrc.to
- **Capacitor Docs**: https://capacitorjs.com/docs
- **React Docs**: https://react.dev
- **TailwindCSS Docs**: https://tailwindcss.com/docs

## 💡 Suggerimenti

1. **Committa spesso**: Fai commit piccoli e frequenti
2. **Branch per feature**: Usa branch separati per nuove funzionalità
3. **Testa su più dispositivi**: Verifica su browser, mobile, e TV
4. **Backup**: GitHub è già il tuo backup, ma fai anche backup locali

## ✅ Checklist Setup Completo

- [ ] Progetto estratto
- [ ] `npm install` completato
- [ ] App funziona in locale (`npm run dev`)
- [ ] Repository GitHub creato (privato)
- [ ] Codice pushato su GitHub
- [ ] Android Studio installato (se necessario)
- [ ] Prima build Android completata (se necessario)
- [ ] App testata su almeno un dispositivo

---

**Fatto! Ora sei pronto a sviluppare! 🎉**

Per domande o problemi, controlla il README.md o cerca online.
