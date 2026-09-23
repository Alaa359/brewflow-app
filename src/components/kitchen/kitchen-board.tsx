'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { OrderStatus } from '@/generated/client';
import {
  ChefHatIcon,
  ClockIcon,
  MaximizeIcon,
  MinimizeIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { advanceOrderStatus } from '@/actions/order-status';
import { formatTime } from '@/lib/sales';

export type KitchenOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  status: OrderStatus;
  fromClient: boolean;
  paidByCard: boolean;
  nextStatus: OrderStatus | null;
  items: { dishName: string; quantity: number }[];
};

const COLUMNS: {
  key: string;
  titleKey: string;
  statuses: OrderStatus[];
}[] = [
  {
    key: 'a-preparer',
    titleKey: 'columns.toPrepare',
    statuses: ['EN_ATTENTE', 'CONFIRMEE'],
  },
  {
    key: 'en-preparation',
    titleKey: 'columns.preparing',
    statuses: ['EN_PREPARATION'],
  },
  { key: 'prete', titleKey: 'columns.ready', statuses: ['PRETE'] },
];

const SOUND_STORAGE_KEY = 'brewflow.kitchen.sound';

function elapsedMs(from: Date, now: number): number {
  return Math.max(0, now - from.getTime());
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function elapsedTone(ms: number): string {
  const minutes = ms / 60000;
  if (minutes > 10) return 'text-destructive font-semibold';
  if (minutes >= 5) return 'text-amber-600 font-medium';
  return 'text-emerald-600';
}

export function KitchenBoard({ orders }: { orders: KitchenOrder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const seenRef = useRef<Set<string> | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'client' | 'caisse'>(
    'all'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = useTranslations('Kitchen');
  const tCommon = useTranslations('Common');
  const tStatus = useTranslations('OrderStatus');
  const locale = useLocale();

  function actionLabel(next: OrderStatus): string {
    if (next === 'CONFIRMEE') return tCommon('actions.confirm');
    if (next === 'EN_PREPARATION') return t('action.start');
    if (next === 'PRETE') return tStatus('PRETE');
    return tStatus(next);
  }

  function playChime() {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // audio indisponible — silencieux
    }
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
      if (stored === '1') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSoundOn(true);
        soundOnRef.current = true;
      }
    } catch {
      // stockage indisponible
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    const ids = orders.map((order) => order.id);
    if (seenRef.current === null) {
      seenRef.current = new Set(ids);
      return;
    }
    const fresh = ids.filter((id) => !seenRef.current!.has(id));
    ids.forEach((id) => seenRef.current!.add(id));
    if (fresh.length > 0) {
      setNewIds(new Set(fresh));
      if (soundOnRef.current) playChime();
    }
  }, [orders]);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(document.fullscreenElement !== null);
    }
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    soundOnRef.current = next;
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // stockage indisponible
    }
    if (next) playChime();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => {
        // refusé par le navigateur
      });
    }
  }

  function advance(order: KitchenOrder, status: OrderStatus) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('orderId', order.id);
      formData.set('status', status);
      const result = await advanceOrderStatus(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? t('updatedToast'));
        router.refresh();
      } else {
        toast.error(result?.message ?? t('actionImpossibleToast'));
      }
    });
  }

  const zones = [...new Set(orders.map((o) => o.tableZone).filter((z): z is string => Boolean(z)))].sort();
  const filtered = orders.filter((order) => {
    if (zoneFilter !== 'all' && (order.tableZone ?? '') !== zoneFilter) return false;
    if (sourceFilter === 'client' && !order.fromClient) return false;
    if (sourceFilter === 'caisse' && order.fromClient) return false;
    return true;
  });
  const total = filtered.length;

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ChefHatIcon className="size-5" />
          {t('title')}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {t('count', { count: total })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={soundOn}
            aria-label={soundOn ? t('sound.off') : t('sound.on')}
            title={soundOn ? t('sound.off') : t('sound.on')}
            onClick={toggleSound}
          >
            {soundOn ? (
              <Volume2Icon className="size-4" />
            ) : (
              <VolumeXIcon className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')}
            title={isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <MinimizeIcon className="size-4" />
            ) : (
              <MaximizeIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label={t('filters.zone')}
          className="bg-muted flex rounded-lg p-0.5"
        >
          <FilterChip
            active={zoneFilter === 'all'}
            onClick={() => setZoneFilter('all')}
            label={t('filters.allZones')}
          />
          {zones.map((zone) => (
            <FilterChip
              key={zone}
              active={zoneFilter === zone}
              onClick={() => setZoneFilter(zone)}
              label={zone}
            />
          ))}
        </div>
        <div
          role="group"
          aria-label={t('filters.source')}
          className="bg-muted flex rounded-lg p-0.5"
        >
          <FilterChip
            active={sourceFilter === 'all'}
            onClick={() => setSourceFilter('all')}
            label={t('filters.allSources')}
          />
          <FilterChip
            active={sourceFilter === 'caisse'}
            onClick={() => setSourceFilter('caisse')}
            label={t('filters.fromPos')}
          />
          <FilterChip
            active={sourceFilter === 'client'}
            onClick={() => setSourceFilter('client')}
            label={t('filters.fromClient')}
          />
        </div>
      </div>

      <div className="grid flex-1 items-start gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnOrders = filtered.filter((order) =>
            column.statuses.includes(order.status)
          );
          return (
            <div key={column.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                  {t(column.titleKey)}
                </h2>
                <Badge
                  variant={columnOrders.length > 0 ? 'default' : 'outline'}
                >
                  {columnOrders.length}
                </Badge>
              </div>

              {columnOrders.length === 0 ? (
                <p className="text-muted-foreground rounded-xl border border-dashed px-3 py-8 text-center text-sm">
                  {t('empty')}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {columnOrders.map((order) => {
                    const next = order.nextStatus;
                    const isNew = newIds.has(order.id);
                    const age = elapsedMs(order.createdAt, now);
                    return (
                      <li
                        key={order.id}
                        className={`bg-background flex flex-col gap-2 rounded-xl border p-3 ${
                          isNew
                            ? 'border-destructive ring-destructive/40 animate-pulse ring-2'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {t('tableNumber', { number: order.tableNumber })}
                            {order.tableZone ? ` · ${order.tableZone}` : ''}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs tabular-nums ${elapsedTone(age)}`}
                            title={formatTime(order.createdAt, locale)}
                          >
                            <ClockIcon className="size-3.5" />
                            {formatElapsed(age)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {tStatus(order.status)}
                          </Badge>
                          {order.fromClient && (
                            <Badge variant="outline">{t('clientBadge')}</Badge>
                          )}
                          {order.paidByCard && (
                            <Badge variant="outline">
                              {t('paidOnlineBadge')}
                            </Badge>
                          )}
                        </div>

                        <ul className="text-sm">
                          {order.items.map((item) => (
                            <li key={item.dishName}>
                              <span className="font-medium tabular-nums">
                                {item.quantity} ×
                              </span>{' '}
                              {item.dishName}
                            </li>
                          ))}
                        </ul>

                        {next ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isPending}
                            onClick={() => advance(order, next)}
                          >
                            {actionLabel(next)}
                          </Button>
                        ) : (
                          <p className="text-muted-foreground text-xs">
                            {order.status === 'PRETE'
                              ? t('readyWaiting')
                              : t('awaitingConfirmation')}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
      }`}
    >
      {label}
    </button>
  );
}
