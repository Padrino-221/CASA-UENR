'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll reveal for [data-reveal] elements.
 *
 * Content is hidden by CSS until `.is-visible` is added, so this must be
 * resilient: it re-runs on navigation, watches for elements added later
 * (streamed content / client-side navigation), and has a safety net so content
 * can never remain permanently invisible.
 */
export default function SiteReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = (el: HTMLElement) => el.classList.add('is-visible');
    const delayOf = (el: Element) =>
      parseInt((el as HTMLElement).getAttribute('data-reveal-delay') || '', 10) || 0;

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(reveal);
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsObserver = 'IntersectionObserver' in window;

    if (reduceMotion || !supportsObserver) {
      revealAll();
      return;
    }

    const observed = new WeakSet<Element>();

    const show = (el: HTMLElement) => {
      const delay = delayOf(el);
      if (delay > 0) {
        window.setTimeout(() => reveal(el), delay);
      } else {
        reveal(el);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          show(entry.target as HTMLElement);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        observer.observe(el);
      });
    };

    observeAll();

    // Catch elements rendered after this effect ran (streaming / route changes).
    const mutationObserver = new MutationObserver(() => observeAll());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Safety net: if anything is still hidden while in view, reveal it.
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) show(el);
      });
    }, 1200);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
