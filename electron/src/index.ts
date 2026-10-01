import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, MenuItem } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';

import { ElectronCapacitorApp, setupReloadWatcher, setupContentSecurityPolicy, setupIpcHandlers } from './setup';

// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  console.log('[BOOT] app ready, initializing...');
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  // CSP disattivato: con scheme non configurato bloccava il caricamento dei contenuti locali
  // Initialize our app, build windows, and load content.
  try {
    await myCapacitorApp.init();
    console.log('[BOOT] myCapacitorApp.init() done');
  } catch (e) {
    console.error('[BOOT] init() failed:', e);
  }
  // FIX: setupContentSecurityPolicy inietta header CORS (Access-Control-Allow-Origin: *)
  // nelle risposte e rimuove Origin dalle richieste in uscita. Senza questo, le fetch da
  // electron a vixsrc.to/api/* e il caricamento dell'iframe vixsrc.to/embed/* falliscono
  // silenziosamente perché lo scheme capacitor-electron:// non è un Origin valido.
  try {
    setupContentSecurityPolicy(capacitorFileConfig.electron?.customUrlScheme ?? 'vixstream');
    console.log('[BOOT] setupContentSecurityPolicy done');
  } catch (e) {
    console.error('[BOOT] setupContentSecurityPolicy failed:', e);
  }
  // FIX: handler IPC per fetch server-side (net.request bypassa CORS strict del renderer)
  try {
    setupIpcHandlers();
    console.log('[BOOT] setupIpcHandlers done');
  } catch (e) {
    console.error('[BOOT] setupIpcHandlers failed:', e);
  }
  // NOTA: auto-update disattivato — la versione portable non ha app-update.yml
  // e gli aggiornamenti vengono distribuiti manualmente via GitHub Releases.
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
