'use client';

import { useEffect, type ReactNode } from 'react';

export function PillarTilt({ children }: { children: ReactNode }) {
  useEffect(() => {
    const grid = document.getElementById('pillar-grid');
    if (!grid) return;

    const cleanups: Array<() => void> = [];

    grid.querySelectorAll<HTMLElement>('.group').forEach((card) => {
      const onMouseMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      };

      const onMouseLeave = () => {
        card.style.transform = '';
      };

      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(() => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return <>{children}</>;
}
