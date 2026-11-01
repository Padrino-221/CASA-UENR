'use client';

import { useEffect, useRef } from 'react';
import { useNotification } from '@/context/NotificationContext';

export default function PwaRegister() {
  const { confirm } = useNotification();
  const confirmRef = useRef(confirm);

  useEffect(() => {
    confirmRef.current = confirm;
  }, [confirm]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Local origins may have workers from other projects using the same port.
    // Unregister them before reloading once so this document loses its controller.
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    if (process.env.NODE_ENV !== 'production' || isLocal) {
      const controlled = Boolean(navigator.serviceWorker.controller);
      void (async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter(key => isLocal || key.startsWith('casa-')).map(key => caches.delete(key)));
        }
        if (controlled && !sessionStorage.getItem('casa-worker-recovery')) {
          sessionStorage.setItem('casa-worker-recovery', '1');
          window.location.reload();
        }
      })().catch(error => console.warn('Local service worker cleanup failed', error));
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              confirmRef.current({
                title: 'Update available',
                message: 'A new version of CASA UENR is available. Reload to update?',
                confirmText: 'Reload',
                cancelText: 'Later',
                variant: 'info',
                onConfirm: () => window.location.reload(),
              });
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
