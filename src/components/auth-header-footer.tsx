'use client';

import { useEffect, useRef, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';

export function AuthHeader() {
  const active = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const clockRef = useRef<HTMLSpanElement>(null);

  function handleLocale(locale: Locale) {
    if (locale === active || pending) return;
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  useEffect(() => {
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (clockRef.current) clockRef.current.textContent = `${h}:${m}:${s}`;
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const localeLabels: Record<Locale, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface/75 backdrop-blur-md border-b border-outline-variant/30">
      <div className="h-16 w-full px-4 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BrewFlow Medallion"
            className="h-8 w-8 object-contain drop-shadow-sm"
            src="/logo-brewflow.svg"
          />
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-sora)] text-sm font-bold tracking-tight text-on-surface leading-none">
              BrewFlow
            </span>
            <span className="text-[10px] uppercase text-secondary tracking-widest mt-0.5 font-semibold">
              Hospitality OS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] uppercase text-tertiary font-semibold tracking-wider">
              Système En Ligne
            </span>
            <span className="text-outline-variant text-[10px]">•</span>
            <span className="text-[10px] text-secondary font-medium">TUN-01</span>
          </div>
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocale(loc)}
                type="button"
                className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-semibold transition-colors ${
                  loc === active
                    ? 'bg-surface-container-highest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {localeLabels[loc]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function AuthFooter() {
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (clockRef.current) clockRef.current.textContent = `${h}:${m}:${s}`;
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="w-full py-3 bg-surface/75 backdrop-blur-md relative z-20 border-t border-outline-variant/30">
      <div className="w-full px-4 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">
            local_cafe
          </span>
          <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">
            BrewFlow OS v4.2 • Système Haute Disponibilité
          </span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-outline">
              schedule
            </span>
            <span ref={clockRef}>00:00:00</span>
            <span>(Tunis UTC+1)</span>
          </span>
          <span className="text-outline-variant">•</span>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Assistance &amp; Support
          </span>
          <span className="text-outline-variant">•</span>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Sécurité
          </span>
        </div>
      </div>
    </footer>
  );
}
