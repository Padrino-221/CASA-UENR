'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from '@phosphor-icons/react';
import ArticleImage from './ArticleImage';

export default function HeroCarousel({ slides }: { slides: { image: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const current = index % Math.max(1, slides.length);
  useEffect(() => {
    if (slides.length < 2 || paused || hovered || focused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, hovered, focused]);
  if (!slides.length) return null;
  const move = (offset: number) => setIndex((current + offset + slides.length) % slides.length);
  return <div className="hero-carousel" role="region" aria-roledescription="carousel" aria-label="Life at CASA UENR"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
    {slides.map((slide, position) => <div key={`${slide.image}-${position}`} hidden={current !== position} className="hero-carousel-photo" role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${slides.length}`}>
      <ArticleImage src={slide.image} alt={slide.alt} sizes="(max-width: 850px) 100vw, 50vw" priority={position === 0} />
    </div>)}
    {slides.length > 1 && <div className="hero-carousel-controls">
      <button type="button" aria-label="Previous photo" onClick={() => move(-1)}><ArrowLeft size={19} /></button>
      <span className="hero-carousel-dots">{slides.map((slide, position) => <button type="button" key={`${slide.image}-${position}`} aria-label={`Show photo ${position + 1}`} aria-current={current === position ? 'true' : undefined} onClick={() => setIndex(position)}><span /></button>)}</span>
      <button type="button" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
      <button type="button" aria-label="Next photo" onClick={() => move(1)}><ArrowRight size={19} /></button>
    </div>}
  </div>;
}
