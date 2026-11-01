'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { List, X, ArrowUpRight } from '@phosphor-icons/react';
import { parseList } from '@/lib/cms/parse';
import { safeHref } from '@/lib/cms/display';
export default function SiteHeader({content}:{content:Record<string,string>}) {
  const siteName=content['brand.siteName'];
  const navItems=parseList<{label:string;href:string}>(content['navigation.items']);
  const pathname=usePathname();
  const [drawerOpen,setDrawerOpen]=useState(false);
  const panel=useRef<HTMLDivElement>(null);
  const menuButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!drawerOpen)return;
    const trigger=menuButton.current;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const items=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button')||[]);
    items()[0]?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape')setDrawerOpen(false);
      if(event.key==='Tab'){
        const all=items();const first=all[0];const last=all[all.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=oldOverflow;trigger?.focus();};
  },[drawerOpen]);
  return <>
    <nav className="navbar" aria-label="Main navigation"><div className="inner">
      <Link href="/" className="logo">{content['brand.logo']&&<span className="logo-icon"><Image src={content['brand.logo']} alt="" width={52} height={52} unoptimized/></span>}<span className="brand-lockup">{siteName}<small>{content['brand.subtitle']}</small></span></Link>
      <div className="nav-links">{navItems.map(item=><Link key={item.href} href={safeHref(item.href)} aria-current={pathname===item.href?'page':undefined} className={pathname===item.href?'active':undefined}>{item.label}</Link>)}</div>
      {content['navigation.ctaLabel']&&<Link href={safeHref(content['navigation.ctaHref'])} className="btn btn-lime">{content['navigation.ctaLabel']} <ArrowUpRight size={18}/></Link>}
      <button className="hamburger-btn" ref={menuButton} onClick={()=>setDrawerOpen(true)} aria-label="Open menu" aria-expanded={drawerOpen} aria-controls="site-mobile-menu"><List size={26}/></button>
    </div></nav>
    <div className={`mobile-drawer ${drawerOpen?'open':''}`} inert={!drawerOpen} aria-hidden={!drawerOpen}>
      <div className="mobile-drawer-backdrop" onClick={()=>setDrawerOpen(false)}/>
      <div className="mobile-drawer-panel" ref={panel} id="site-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="mobile-drawer-header"><span>{content['navigation.mobileHeading']}</span><button className="mobile-drawer-close" onClick={()=>setDrawerOpen(false)} aria-label="Close menu"><X size={24}/></button></div>
        <div className="mobile-drawer-nav">{navItems.map((item)=><Link key={item.href} href={safeHref(item.href)} onClick={()=>setDrawerOpen(false)} aria-current={pathname===item.href?'page':undefined}>{item.label}<ArrowUpRight size={24}/></Link>)}</div>
        {content['navigation.mobileCtaLabel']&&<Link href={safeHref(content['navigation.ctaHref'])} onClick={()=>setDrawerOpen(false)} className="btn btn-lime">{content['navigation.mobileCtaLabel']} <ArrowUpRight size={20}/></Link>}
      </div>
    </div>
  </>;
}
