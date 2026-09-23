'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { WifiIcon } from 'lucide-react';

export function StationStatus({ name }: { name: string }) {
  const t = useTranslations('Header');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div
      className="hidden min-w-0 items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs animate-in fade-in slide-in-from-left-2 duration-300 md:flex"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {online && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            online ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
      </span>
      <WifiIcon
        className={`h-3.5 w-3.5 shrink-0 ${online ? 'text-emerald-600' : 'text-red-500'}`}
      />
      <span className="min-w-0 truncate font-medium text-foreground/80">
        {t('stationPrefix')} · {name}
      </span>
      <span
        className={`shrink-0 font-semibold ${online ? 'text-emerald-600' : 'text-red-500'}`}
      >
        {online ? t('online') : t('offline')}
      </span>
    </div>
  );
}
