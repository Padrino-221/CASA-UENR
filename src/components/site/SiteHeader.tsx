'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SiteArrow from './SiteArrow';
import { List, X } from '@phosphor-icons/react';

const NAV_ITEMS = [
  { label: 'Home', href: '/', key: '/' },
  { label: 'About Us', href: '/about', key: '/about' },
  { label: 'Departments', href: '/departments', key: '/departments' },
  { label: 'News & Events', href: '/news', key: '/news' },
  { label: 'Contact', href: '/contact', key: '/contact' },
];

export default function SiteHeader({ siteName = 'CASA UENR' }: { siteName?: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="navbar">
        <div className="inner">
          <Link href="/" className="logo">
            <span className="logo-icon">
              <Image src="/casa-logo-white.png" alt="CASA UENR logo" width={56} height={56} />
            </span>
            {siteName}
          </Link>
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={pathname === item.key ? 'active' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/news" className="btn btn-lime">
            Join us this Sunday
            <SiteArrow stroke="#0D47A1" />
          </Link>
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <List size={24} weight="bold" />
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
        <div className="mobile-drawer-panel">
          <div className="mobile-drawer-header">
            <Link href="/" className="logo">
              <span className="logo-icon">
                <Image src="/casa-logo-white.png" alt="CASA UENR logo" width={56} height={56} />
              </span>
              {siteName}
            </Link>
            <button
              className="mobile-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="mobile-drawer-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={pathname === item.key ? 'active' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mobile-drawer-cta">
            <Link href="/news" className="btn btn-lime">
              Join us this Sunday
              <SiteArrow stroke="#0D47A1" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
