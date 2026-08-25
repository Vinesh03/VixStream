import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

/**
 * Gestisce l'orientamento schermo in base all'impostazione autoRotate.
 * - autoRotate ON  → libera l'orientamento (segue il sensore)
 * - autoRotate OFF → blocca in portrait (solo su telefoni)
 */
export async function applyRotationSetting(autoRotate) {
  if (!Capacitor.isNativePlatform?.()) return;
  try {
    if (autoRotate) {
      await ScreenOrientation.unlock();
    } else {
      // lock solo sui telefoni: forzare portrait su tablet sarebbe sbagliato
      const isPhone = window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      if (isPhone) {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      }
    }
  } catch (err) {
    console.warn('Screen orientation:', err);
  }
}
