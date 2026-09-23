'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BellIcon,
  BellOffIcon,
  PackageIcon,
  ShoppingCartIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppNotification } from '@/lib/notifications-types';

const SEEN_KEY = 'bf_notif_seen';

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function NotificationBell({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const t = useTranslations('Notifications');
  const [seen, setSeen] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setSeen(readSeen());
  }, []);

  const unseenIds = useMemo(
    () => notifications.filter((n) => !seen.includes(n.id)).map((n) => n.id),
    [notifications, seen]
  );

  const markAllSeen = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    const next = Array.from(new Set([...readSeen(), ...ids])).slice(-100);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
    setSeen(next);
  }, [notifications]);

  const unreadCount = mounted ? unseenIds.length : notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full transition-all hover:bg-primary/10 hover:text-primary animate-in fade-in duration-300"
          aria-label={t('ariaLabel', { count: unreadCount })}
        >
          <BellIcon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm animate-in zoom-in-75 duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            {t('title')}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={markAllSeen}
            >
              {t('markAllRead')}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <BellOffIcon className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-2">
            {notifications.map((n) => {
              const isNew = mounted && !seen.includes(n.id);
              const Icon = n.kind === 'stock' ? PackageIcon : ShoppingCartIcon;
              return (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={markAllSeen}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted ${
                      isNew ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        n.kind === 'stock'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug">
                        {t(`items.${n.titleKey}`, n.params ?? {})}
                      </span>
                      <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t(`kinds.${n.kind}`)}
                      </span>
                    </span>
                    {isNew && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary animate-in zoom-in-50 duration-300" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
