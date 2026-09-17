'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { shouldEnableBackground, whenIdle } from '@/lib/three/quality';

const Scene = dynamic(() => import('./scene'), { ssr: false });

export function SpatialBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!shouldEnableBackground()) return;
    return whenIdle(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Scene />
    </div>
  );
}
