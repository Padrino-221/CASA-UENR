'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface Leader {
  id?: string;
  image?: string;
  initials?: string;
  name?: string;
  role?: string;
  bio?: string;
  color?: string;
}

const AUTOPLAY_MS = 4500;

export default function LeadersCarousel({ leaders }: { leaders: Leader[] }) {
  const [visible, setVisible] = useState(4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setVisible(width < 640 ? 1 : width < 1024 ? 2 : 4);
    };
    const timer = setTimeout(update, 0);
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', update);
    };
  }, []);

  const maxIndex = Math.max(0, leaders.length - visible);

  useEffect(() => {
    if (paused || maxIndex === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => (Math.min(prev, maxIndex) >= maxIndex ? 0 : Math.min(prev, maxIndex) + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, maxIndex, tick]);

  if (leaders.length === 0) return null;

  const step = 100 / visible;
  const current = Math.min(index, maxIndex);

  const move = (direction: -1 | 1) => {
    setIndex(Math.min(maxIndex, Math.max(0, current + direction)));
    setTick((value) => value + 1);
  };

  return (
    <div
      className="leaders-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="leaders-viewport">
        <div className="leaders-track" style={{ transform: `translateX(-${current * step}%)` }}>
          {leaders.map((leader, i) => (
            <div className="leader-slide" style={{ width: `${step}%` }} key={leader.id ?? i}>
              <div className="leader-card leader-card-media">
                <div className="leader-photo">
                  {leader.image ? (
                    <Image
                      src={leader.image}
                      alt={leader.name || 'Leader'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className={`avatar avatar-xl ${leader.color || 'brand'}`}>{leader.initials}</div>
                  )}
                </div>
                <div className="leader-info">
                  <h3>{leader.name}</h3>
                  <span className="role">{leader.role}</span>
                  <p>{leader.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="leaders-nav">
        <button type="button" onClick={() => move(-1)} disabled={current === 0} aria-label="Previous leaders">
          <CaretLeft size={18} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={current >= maxIndex}
          aria-label="Next leaders"
        >
          <CaretRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
