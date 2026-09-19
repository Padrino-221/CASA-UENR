'use client';

import { useEffect } from 'react';

/**
 * Scroll reveal ported from the temp site's js/reveal.js — watches [data-reveal]
 * elements and adds .is-visible, honouring data-reveal-delay. Renders nothing.
 */
export default function SiteReveal() {
  useEffect(() => {
    const items = Array.prototype.slice.call(
      document.querySelectorAll<HTMLElement>('[data-reveal]')
    );

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const show = (el: HTMLElement, delay: number) => {
      if (delay > 0) {
        window.setTimeout(() => el.classList.add('is-visible'), delay);
      } else {
        el.classList.add('is-visible');
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const delay =
            parseInt(
              (entry.target as HTMLElement).getAttribute('data-reveal-delay') || '',
              10
            ) || 0;
          show(entry.target as HTMLElement, delay);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
