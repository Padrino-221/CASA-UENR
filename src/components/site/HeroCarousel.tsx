'use client';

import { useEffect, useState } from 'react';
import ArticleImage from './ArticleImage';

export default function HeroCarousel({ slides }: { slides: { image: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const current = index % Math.max(1, slides.length);
  useEffect(() => {
    if (slides.length < 2 || hovered || focused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length, hovered, focused]);
  if (!slides.length) return null;
  const move = (offset: number) => setIndex((current + offset + slides.length) % slides.length);
  return <div className="hero-carousel" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Life at CASA UENR"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
    {slides.map((slide, position) => <div key={`${slide.image}-${position}`} hidden={current !== position} className="hero-carousel-photo" role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${slides.length}`}>
      <ArticleImage src={slide.image} alt={slide.alt} sizes="(max-width: 850px) 100vw, 50vw" priority={position === 0} />
    </div>)}
  </div>;
}
