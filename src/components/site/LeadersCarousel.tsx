'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

interface Leader {
  id?: string; image?: string; initials?: string; name?: string;
  role?: string; bio?: string; color?: string;
}

export default function LeadersCarousel({ leaders }: { leaders: Leader[] }) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ current: 0, end: false, scrollable: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const cards = Array.from(element.children) as HTMLElement[];
      const start = cards[0]?.offsetLeft || 0;
      const current = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - start - element.scrollLeft) < Math.abs(cards[best].offsetLeft - start - element.scrollLeft) ? index : best, 0);
      const scrollable = element.scrollWidth > element.clientWidth + 2;
      setPosition({ current, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 3, scrollable });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [leaders.length]);
  const moveTo = (index: number) => {
    const element = track.current;
    if (!element) return;
    const first = element.children[0] as HTMLElement;
    const card = element.children[Math.max(0, Math.min(leaders.length - 1, index))] as HTMLElement;
    if (card && first) element.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  if (!leaders.length) return null;
  return <div className="team-carousel" role="region" aria-roledescription="carousel" aria-label="Fellowship leadership">
    <div className="team-toolbar"><span>Our leadership team</span><div className="team-arrows">
      <button type="button" aria-label="Previous leaders" aria-controls={id} disabled={!position.scrollable || position.current === 0} onClick={() => moveTo(position.current - 1)}><ArrowLeft size={20} /></button>
      <button type="button" aria-label="Next leaders" aria-controls={id} disabled={!position.scrollable || position.end} onClick={() => moveTo(position.current + 1)}><ArrowRight size={20} /></button>
    </div></div>
    <div id={id} ref={track} className="team-track" tabIndex={0} aria-label="Leadership portraits, swipe or use arrow keys to browse" onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveTo(position.current + (event.key === 'ArrowRight' ? 1 : -1)); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); moveTo(event.key === 'Home' ? 0 : leaders.length - 1); }
    }}>
      {leaders.map((leader, index) => <article className="team-slide" key={leader.id ?? index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${leaders.length}: ${leader.name || 'Fellowship leader'}`}>
        <div className="team-portrait">{leader.image ? <Image src={leader.image} alt={leader.name || 'Fellowship leader'} fill sizes="(max-width: 640px) 82vw, (max-width: 1000px) 46vw, 32vw" /> : <span className="team-initials">{leader.initials || leader.name?.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>}</div>
        <div className="team-caption"><span className="team-role">{leader.role}</span><h3>{leader.name}</h3>{leader.bio && <p>{leader.bio}</p>}</div>
      </article>)}
    </div>
    <div className="team-footer"><span>{leaders.length} {leaders.length === 1 ? 'leader' : 'leaders'} serving our fellowship</span><span className="team-swipe-hint">Swipe to explore</span></div>
  </div>;
}
