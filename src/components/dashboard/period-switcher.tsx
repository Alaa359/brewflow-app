'use client';

import Link from 'next/link';
import { cn } from 'cn';
import { PERIOD_LABEL, type Period } from '@/lib/sales';

const PERIODS: Period[] = ['jour', 'semaine', 'mois'];

export function PeriodSwitcher({ current }: { current: Period }) {
  return (
    <div className="bg-muted inline-flex h-8 w-fit items-center rounded-lg p-[3px]">
      {PERIODS.map((period) => (
        <Link
          key={period}
          href={`/dashboard?periode=${period}`}
          className={cn(
            'text-foreground/60 hover:text-foreground relative inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors',
            current === period && 'bg-background text-foreground shadow-sm'
          )}
        >
          {PERIOD_LABEL[period]}
        </Link>
      ))}
    </div>
  );
}
