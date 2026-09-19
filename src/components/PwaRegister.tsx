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

    // The service worker caches app assets. In development it serves stale
    // chunks/RSC payloads and makes pages render outdated designs, so it is
    // only enabled in production. In development we actively unregister any
    // previously installed worker and drop its caches.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        if (reg.active) return;

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
