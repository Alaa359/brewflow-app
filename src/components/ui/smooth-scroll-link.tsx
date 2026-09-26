'use client';

import type { MouseEvent, ReactNode } from 'react';

type SmoothScrollLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function SmoothScrollLink({
  href,
  className,
  children,
}: SmoothScrollLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith('#')) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
