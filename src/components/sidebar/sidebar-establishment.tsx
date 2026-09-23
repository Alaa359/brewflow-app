'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { CheckIcon, ChevronDownIcon, StoreIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { switchEstablishment } from '@/actions/establishments';

export function SidebarEstablishment({
  currentId,
  establishments,
}: {
  currentId: string;
  establishments: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const t = useTranslations('Establishments');
  const current =
    establishments.find((est) => est.id === currentId) ?? establishments[0];

  return (
    <div className="px-2 pb-1 animate-in fade-in slide-in-from-left-2 duration-300">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={pending}
            className="group flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={t('switcherLabel')}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
              <StoreIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground/90">
                {current?.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {t('switcherLabel')}
              </span>
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-56 p-1.5"
        >
          {establishments.map((est) => (
            <button
              key={est.id}
              type="button"
              disabled={est.id === currentId || pending}
              onClick={() => startTransition(() => switchEstablishment(est.id))}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                est.id === currentId
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-foreground/80 hover:bg-muted'
              } disabled:cursor-default`}
            >
              {est.id === currentId ? (
                <CheckIcon className="h-4 w-4 shrink-0" />
              ) : (
                <span className="h-4 w-4 shrink-0" />
              )}
              <span className="min-w-0 truncate">{est.name}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
