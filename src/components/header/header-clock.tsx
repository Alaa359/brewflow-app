'use client';

import { useEffect, useState } from 'react';
import { ClockIcon } from 'lucide-react';

function formatOffset(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'UTC';
    return name.replace('GMT', 'UTC').replace('UTC+0', 'UTC');
  } catch {
    return 'UTC';
  }
}

export function HeaderClock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now)
    : '--:--:--';

  const offset = formatOffset(timeZone);

  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-medium tabular-nums text-foreground/80 animate-in fade-in duration-300 sm:flex"
      aria-label={`${time} ${offset}`}
    >
      <ClockIcon className="h-3.5 w-3.5 text-primary" />
      <span>{time}</span>
      <span className="text-muted-foreground">{offset}</span>
    </div>
  );
}
