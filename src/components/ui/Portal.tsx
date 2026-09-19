'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(handle);
      setMounted(false);
    };
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}
