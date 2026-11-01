'use client';
import { useState } from 'react';
import Image from 'next/image';

/** Remote article photos load directly; uploaded photos are already compressed. */
export default function ArticleImage({ src, alt, sizes, priority = false }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = failedSource === src ? '/church-bg.jpg' : src;
  return <Image src={source} alt={alt} fill sizes={sizes} priority={priority} unoptimized onError={() => setFailedSource(src)} />;
}
