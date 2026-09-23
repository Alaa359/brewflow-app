'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';
import { navForRole } from '@/lib/nav';
import type { CurrentUser } from '@/lib/auth/dal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SearchEntry = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
};

export function HeaderSearch({ user }: { user: CurrentUser }) {
  const t = useTranslations('Nav');
  const tSearch = useTranslations('Search');
  const tSections = useTranslations('Nav.sections');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const entries: SearchEntry[] = [];
  {
    const groups = navForRole(user.role);
    for (const group of groups) {
      for (const item of group.items) {
        entries.push({
          href: item.href,
          label: t(item.key),
          icon: item.icon,
          section: tSections(group.sectionKey),
        });
      }
    }
  }

  const q = query.trim().toLowerCase();
  const results = q
    ? entries.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.href.toLowerCase().includes(q) ||
          e.section.toLowerCase().includes(q)
      )
    : entries;

  const openPalette = useCallback(() => {
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) return false;
          setQuery('');
          setActive(0);
          return true;
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="hidden h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3.5 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex animate-in fade-in duration-300"
        aria-label={tSearch('title')}
      >
        <SearchIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{tSearch('placeholder')}</span>
        <kbd className="pointer-events-none hidden shrink-0 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
          Ctrl K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={openPalette}
        aria-label={tSearch('title')}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[18%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{tSearch('title')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b border-border/50 px-4">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter' && results[active]) {
                  e.preventDefault();
                  go(results[active].href);
                }
              }}
              placeholder={tSearch('placeholder')}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label={tSearch('title')}
            />
            <kbd className="pointer-events-none hidden shrink-0 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {tSearch('empty')}
              </li>
            )}
            {results.map((entry, index) => {
              const Icon = entry.icon;
              return (
                <li key={entry.href} role="option" aria-selected={index === active}>
                  <button
                    type="button"
                    onClick={() => go(entry.href)}
                    onMouseEnter={() => setActive(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      index === active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/80 hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {entry.label}
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {entry.section}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground">
            {tSearch('hint')}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
