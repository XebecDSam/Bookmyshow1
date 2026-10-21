/**
 * BookMyShow PWA Manager & Service Worker Registration
 */

let deferredPrompt = null;
let isAppInstalled = false;

// Check if currently running as an installed PWA (Standalone)
export const checkIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

// Register Service Worker
export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('⚠️ [PWA] Service Workers not supported in this browser.');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ [PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🚀 [PWA] New version of BookMyShow is available.');
                window.dispatchEvent(new CustomEvent('pwa:update-ready'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ [PWA] Service Worker registration failed:', error);
      });
  });

  // Listen for beforeinstallprompt event (Chrome, Edge, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 [PWA] beforeinstallprompt captured. App installable!');
    window.dispatchEvent(new CustomEvent('pwa:installable', { detail: { installable: true } }));
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isAppInstalled = true;
    console.log('🎉 [PWA] BookMyShow app successfully installed on device!');
    window.dispatchEvent(new CustomEvent('pwa:installed'));
  });
};

// Trigger browser native installation prompt
export const promptInstallApp = async () => {
  if (!deferredPrompt) {
    console.log('ℹ️ [PWA] Install prompt not available or app already installed.');
    return { outcome: 'unavailable' };
  }

  try {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log(`📱 [PWA] User response to install prompt: ${choiceResult.outcome}`);
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa:installable', { detail: { installable: false } }));
    return choiceResult;
  } catch (err) {
    console.error('❌ [PWA] Error prompting installation:', err);
    return { outcome: 'error', error: err };
  }
};
