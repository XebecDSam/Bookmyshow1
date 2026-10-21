import { useState, useEffect } from 'react';
import { checkIsStandalone, promptInstallApp } from './pwaManager';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    setIsStandalone(checkIsStandalone());

    const handleInstallable = (e) => {
      setIsInstallable(e.detail?.installable ?? true);
    };

    const handleInstalled = () => {
      setIsInstallable(false);
      setIsStandalone(true);
    };

    const handleUpdate = () => {
      setHasUpdate(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('pwa:installable', handleInstallable);
    window.addEventListener('pwa:installed', handleInstalled);
    window.addEventListener('pwa:update-ready', handleUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('pwa:installable', handleInstallable);
      window.removeEventListener('pwa:installed', handleInstalled);
      window.removeEventListener('pwa:update-ready', handleUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    const result = await promptInstallApp();
    if (result.outcome === 'accepted') {
      setIsInstallable(false);
    }
    return result;
  };

  return {
    isInstallable,
    isStandalone,
    isOnline,
    hasUpdate,
    installApp,
  };
};
