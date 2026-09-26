'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { OrderStatus } from '@/generated/client';
import { advanceOrderStatus } from '@/actions/order-status';
import { formatTime } from '@/lib/sales';
import {
  KDS_CONTRAST_KEY,
  KDS_SOUND_KEY,
  readKdsPref,
  writeKdsPref,
} from '@/lib/kds-prefs';

export type KitchenOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  status: OrderStatus;
  fromClient: boolean;
  paidByCard: boolean;
  serverName?: string | null;
  nextStatus: OrderStatus | null;
  items: { dishName: string; quantity: number }[];
};

export type KitchenStats = {
  servedToday: number;
  avgDelayMs: number;
};

const URGENT_MS = 10 * 60_000;
const QTY_COLORS = ['text-primary', 'text-tertiary', 'text-caramel-dark'];
const BAR_COLORS = ['bg-primary', 'bg-tertiary', 'bg-outline'];

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

function formatKpi(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}`;
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stripeFor(
  status: OrderStatus,
  urgent: boolean
): {
  className: string;
  icon: string;
} {
  if (urgent) {
    return {
      className: 'bg-error text-white',
      icon: 'crisis_alert',
    };
  }
  switch (status) {
    case 'EN_ATTENTE':
      return {
        className: 'bg-secondary-container text-on-secondary-container',
        icon: 'fiber_new',
      };
    case 'CONFIRMEE':
      return {
        className: 'bg-caramel-dark text-on-primary',
        icon: 'restaurant',
      };
    case 'EN_PREPARATION':
      return { className: 'bg-caramel-dark text-on-primary', icon: 'cooking' };
    case 'PRETE':
      return {
        className: 'bg-tertiary-container text-on-tertiary-container',
        icon: 'takeout_dining',
      };
    default:
      return {
        className: 'bg-surface-container-highest text-on-surface',
        icon: 'receipt_long',
      };
  }
}

function actionStyle(next: OrderStatus): string {
  switch (next) {
    case 'CONFIRMEE':
      return 'bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-on-primary';
    case 'EN_PREPARATION':
      return 'bg-primary text-on-primary hover:bg-caramel-dark';
    default:
      return 'bg-tertiary text-on-tertiary hover:bg-tertiary/90';
  }
}

function actionIcon(next: OrderStatus): string {
  switch (next) {
    case 'CONFIRMEE':
      return 'task_alt';
    case 'EN_PREPARATION':
      return 'cooking';
    case 'PRETE':
      return 'done_all';
    default:
      return 'check_circle';
  }
}

export function KitchenBoard({
  orders,
  stats,
  timezone,
}: {
  orders: KitchenOrder[];
  stats: KitchenStats;
  timezone?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const seenRef = useRef<Set<string> | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [soundOn, setSoundOn] = useState(false);
  const [contrastOn, setContrastOn] = useState(false);
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
    const soundStored = readKdsPref(KDS_SOUND_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(soundStored);
    soundOnRef.current = soundStored;
    setContrastOn(readKdsPref(KDS_CONTRAST_KEY));
    function onStorage(event: StorageEvent) {
      if (event.key === KDS_SOUND_KEY) {
        setSoundOn(event.newValue === '1');
        soundOnRef.current = event.newValue === '1';
      }
      if (event.key === KDS_CONTRAST_KEY) setContrastOn(event.newValue === '1');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
    writeKdsPref(KDS_SOUND_KEY, next);
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

  const zones = [
    ...new Set(
      orders.map((o) => o.tableZone).filter((z): z is string => Boolean(z))
    ),
  ].sort();
  const sourceFiltered = orders.filter((order) => {
    if (sourceFilter === 'client' && !order.fromClient) return false;
    if (sourceFilter === 'caisse' && order.fromClient) return false;
    return true;
  });
  const filtered = sourceFiltered.filter(
    (order) => zoneFilter === 'all' || (order.tableZone ?? '') === zoneFilter
  );
  const total = filtered.length;

  const ages = filtered.map((order) => elapsedMs(order.createdAt, now));
  const avgAge = ages.length
    ? ages.reduce((sum, age) => sum + age, 0) / ages.length
    : 0;
  const urgentCount = orders.filter(
    (order) => elapsedMs(order.createdAt, now) > URGENT_MS
  ).length;

  const zoneCounts = new Map<string, number>();
  sourceFiltered.forEach((order) => {
    const zone = order.tableZone ?? '—';
    zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + 1);
  });
  const zoneLoads = [...zoneCounts.entries()]
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count);
  const maxLoad = Math.max(1, ...zoneLoads.map((z) => z.count));

  return (
    <section className="flex flex-1 flex-col gap-4">
      {/* Bandeau de statut live & KPIs */}
      <header className="bg-surface-container w-full rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="bg-surface-container-lowest flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 shadow-sm">
                <span className="bg-tertiary h-2.5 w-2.5 animate-ping rounded-full" />
                <span className="font-label-caps text-label-caps text-tertiary font-bold tracking-wider">
                  KDS LIVE STREAM
                </span>
                <span className="font-label-numeric text-on-surface-variant text-[11px]">
                  • {t('count', { count: total })}
                </span>
              </div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Suivi de production cuisine
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="bg-surface-container-lowest flex shrink-0 items-center gap-4 rounded-xl px-3 py-2 shadow-sm">
                <div className="flex flex-col">
                  <span className="font-label-caps text-on-surface-variant text-[10px] tracking-wider uppercase">
                    Attente moyenne
                  </span>
                  <span
                    className="font-metric-display text-headline-sm text-tertiary font-bold tracking-tight"
                    suppressHydrationWarning
                  >
                    {formatKpi(avgAge)}
                  </span>
                </div>
                <div className="bg-surface-container-high mx-1 h-8 w-px" />
                <div className="flex flex-col">
                  <span className="font-label-caps text-on-surface-variant text-[10px] tracking-wider uppercase">
                    Actifs au passe
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-metric-display text-headline-sm text-on-surface font-bold">
                      {total}
                    </span>
                    {urgentCount > 0 && (
                      <span className="font-label-caps text-error text-[10px] font-bold">
                        {urgentCount} urgent
                        {urgentCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-surface-container-high mx-1 h-8 w-px" />
                <div className="flex flex-col">
                  <span className="font-label-caps text-on-surface-variant text-[10px] tracking-wider uppercase">
                    Servis (jour)
                  </span>
                  <span className="font-label-numeric text-on-surface font-bold">
                    {stats.servedToday}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest flex items-center gap-1 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  aria-pressed={soundOn}
                  aria-label={soundOn ? t('sound.off') : t('sound.on')}
                  title={soundOn ? t('sound.off') : t('sound.on')}
                  onClick={toggleSound}
                  className={`focus-visible:ring-primary/70 flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    soundOn
                      ? 'bg-tertiary-container text-on-tertiary-container'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {soundOn ? 'volume_up' : 'volume_off'}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={
                    isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')
                  }
                  title={
                    isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')
                  }
                  onClick={toggleFullscreen}
                  className="text-on-surface hover:bg-surface-container-high focus-visible:ring-primary/70 flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtres zone / origine, sur une ligne dédiée sous le bandeau */}
          <div className="border-outline-variant/40 flex flex-col gap-2 border-t pt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="font-label-caps text-on-surface-variant w-16 shrink-0 text-[10px] tracking-wider uppercase">
                {t('filters.zoneLabel')}
              </span>
              <nav
                aria-label={t('filters.zone')}
                className="flex flex-wrap items-center gap-1.5"
              >
                <FilterChip
                  active={zoneFilter === 'all'}
                  onClick={() => setZoneFilter('all')}
                  label={t('filters.allZones')}
                  icon="apps"
                  count={sourceFiltered.length}
                />
                {zones.map((zone) => (
                  <FilterChip
                    key={zone}
                    active={zoneFilter === zone}
                    onClick={() => setZoneFilter(zone)}
                    label={zone}
                    icon="place"
                    count={zoneCounts.get(zone) ?? 0}
                  />
                ))}
              </nav>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="font-label-caps text-on-surface-variant w-16 shrink-0 text-[10px] tracking-wider uppercase">
                {t('filters.sourceLabel')}
              </span>
              <nav
                aria-label={t('filters.source')}
                className="flex flex-wrap items-center gap-1.5"
              >
                <FilterChip
                  active={sourceFilter === 'all'}
                  onClick={() => setSourceFilter('all')}
                  label={t('filters.allSources')}
                  icon="apps"
                />
                <FilterChip
                  active={sourceFilter === 'caisse'}
                  onClick={() => setSourceFilter('caisse')}
                  label={t('filters.fromPos')}
                  icon="point_of_sale"
                />
                <FilterChip
                  active={sourceFilter === 'client'}
                  onClick={() => setSourceFilter('client')}
                  label={t('filters.fromClient')}
                  icon="smartphone"
                />
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Grille live des tickets */}
      {filtered.length === 0 ? (
        <p className="border-outline-variant/50 text-on-surface-variant rounded-2xl border-2 border-dashed px-3 py-10 text-center">
          {t('empty')}
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${
            contrastOn ? 'contrast-125' : ''
          }`}
        >
          {filtered.map((order) => {
            const next = order.nextStatus;
            const isNew = newIds.has(order.id);
            const age = elapsedMs(order.createdAt, now);
            const urgent = age > URGENT_MS;
            const stripe = stripeFor(order.status, urgent);
            const ticketRef = `#${order.id.slice(-4).toUpperCase()}`;
            return (
              <article
                key={order.id}
                className={`group bg-surface-container-lowest relative flex flex-col overflow-hidden rounded-2xl shadow-md transition-transform duration-150 hover:-translate-y-0.5 ${
                  isNew ? 'ring-destructive/60 animate-pulse ring-2' : ''
                }`}
              >
                {/* Bandeau de statut */}
                <div
                  className={`flex items-center justify-between px-2 py-2 ${stripe.className}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {stripe.icon}
                    </span>
                    <span className="font-label-numeric font-bold tracking-wider">
                      TICKET {ticketRef}
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest/30 flex items-center gap-1 rounded-full px-2 py-0.5">
                    <span className="material-symbols-outlined text-[14px]">
                      timer
                    </span>
                    <span
                      className={`font-metric-display text-label-numeric font-bold ${
                        urgent ? 'animate-pulse' : ''
                      }`}
                      title={formatTime(order.createdAt, locale, timezone)}
                      suppressHydrationWarning
                    >
                      {formatElapsed(age)}
                    </span>
                  </div>
                </div>

                {/* Méta ticket */}
                <div className="bg-surface-container flex flex-col gap-1.5 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="bg-surface-container-highest font-label-caps text-label-caps text-on-surface rounded px-2 py-0.5 font-bold whitespace-nowrap">
                        TABLE T{order.tableNumber}
                      </span>
                      {order.tableZone && (
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {order.tableZone}
                        </span>
                      )}
                    </div>
                    {order.status === 'PRETE' ? (
                      <span className="font-label-caps text-tertiary flex shrink-0 items-center gap-1 text-[11px] font-bold">
                        <span className="material-symbols-outlined animate-bounce text-[15px]">
                          notifications_active
                        </span>
                        {tStatus('PRETE')}
                      </span>
                    ) : (
                      <span className="bg-surface-container-highest font-label-caps text-on-surface-variant shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold">
                        {tStatus(order.status)}
                      </span>
                    )}
                  </div>
                  {(order.fromClient ||
                    order.serverName ||
                    order.paidByCard) && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {order.fromClient ? (
                          <span className="bg-primary font-label-caps text-on-primary rounded px-1.5 py-0.5 text-[11px] font-bold">
                            {t('clientBadge')}
                          </span>
                        ) : (
                          order.serverName && (
                            <span
                              title={order.serverName}
                              className="text-on-surface-variant flex min-w-0 items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                person
                              </span>
                              <span className="font-body-sm truncate text-[11px]">
                                {order.serverName}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                      {order.paidByCard && (
                        <span className="bg-primary/10 font-label-caps text-primary shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold">
                          {t('paidOnlineBadge')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Articles */}
                <div className="relative flex flex-1 flex-col gap-2 p-2">
                  <span
                    aria-hidden="true"
                    className="font-headline text-on-surface/5 pointer-events-none absolute right-2 bottom-0 z-0 text-[76px] leading-none font-bold select-none"
                  >
                    T{order.tableNumber}
                  </span>
                  {order.items.length === 0 ? (
                    <div className="border-outline-variant/30 relative flex items-center justify-center rounded-xl border-2 border-dashed p-3 text-center">
                      <span className="font-body-sm text-on-surface-variant/70 text-[12px] italic">
                        Aucun article
                      </span>
                    </div>
                  ) : (
                    order.items.map((item, index) => (
                      <div
                        key={`${item.dishName}-${index}`}
                        className="bg-surface-container-low relative rounded-xl p-2.5 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`font-metric-display text-headline-sm leading-none font-bold ${
                              QTY_COLORS[index % QTY_COLORS.length]
                            }`}
                          >
                            {item.quantity}×
                          </span>
                          <span className="font-headline-sm text-on-surface text-[15px] leading-tight font-bold">
                            {item.dishName}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action */}
                <footer className="bg-surface-container-low flex flex-col gap-1.5 p-2">
                  {next ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => advance(order, next)}
                      className={`font-label-caps text-label-caps flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold shadow-sm transition active:scale-95 disabled:opacity-60 ${
                        urgent
                          ? 'bg-error hover:bg-error/90 text-white'
                          : actionStyle(next)
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {actionIcon(next)}
                      </span>
                      {actionLabel(next)}
                    </button>
                  ) : (
                    <p className="font-body-sm text-on-surface-variant px-1 text-center text-[12px]">
                      {order.status === 'PRETE'
                        ? t('readyWaiting')
                        : t('awaitingConfirmation')}
                    </p>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {/* Bas de page : charge par zone & bilan */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-body-md text-primary">
              monitoring
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Charge par zone
            </span>
          </div>
          {zoneLoads.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              Aucune charge active.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {zoneLoads.map((load, index) => (
                <div
                  key={load.zone}
                  className="bg-surface-container-low rounded-xl p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-label-md text-label-md text-on-surface flex min-w-0 items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-primary shrink-0 text-[16px]">
                        place
                      </span>
                      <span className="truncate">{load.zone}</span>
                    </span>
                    <span className="bg-surface-container-highest font-label-numeric text-label-numeric text-on-surface shrink-0 rounded-full px-2 py-0.5 font-bold">
                      {load.count}
                    </span>
                  </div>
                  <div className="bg-surface-container h-2.5 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                      style={{
                        width: `${Math.round((load.count / maxLoad) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest flex flex-col rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-body-md text-tertiary">
              fact_check
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Bilan du jour (live)
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div className="bg-surface-container flex flex-col gap-1 rounded-xl p-3">
              <span className="font-label-caps text-on-surface-variant flex items-center gap-1 text-[10px] uppercase">
                <span className="material-symbols-outlined text-[14px]">
                  task_alt
                </span>
                Tickets servis
              </span>
              <span className="font-metric-display text-headline-sm text-on-surface font-bold">
                {stats.servedToday}
              </span>
            </div>
            <div className="bg-surface-container flex flex-col gap-1 rounded-xl p-3">
              <span className="font-label-caps text-on-surface-variant flex items-center gap-1 text-[10px] uppercase">
                <span className="material-symbols-outlined text-[14px]">
                  schedule
                </span>
                Délai moyen
              </span>
              <span className="font-metric-display text-headline-sm text-tertiary font-bold">
                {stats.servedToday > 0 ? formatElapsed(stats.avgDelayMs) : '—'}
              </span>
            </div>
            <div className="bg-surface-container flex flex-col gap-1 rounded-xl p-3">
              <span className="font-label-caps text-on-surface-variant flex items-center gap-1 text-[10px] uppercase">
                <span className="material-symbols-outlined text-[14px]">
                  receipt_long
                </span>
                Tickets actifs
              </span>
              <span className="font-metric-display text-headline-sm text-primary font-bold">
                {orders.length}
              </span>
            </div>
            <div className="bg-surface-container flex flex-col gap-1 rounded-xl p-3">
              <span className="font-label-caps text-on-surface-variant flex items-center gap-1 text-[10px] uppercase">
                <span className="material-symbols-outlined text-[14px]">
                  warning
                </span>
                Urgents
              </span>
              <span className="font-metric-display text-headline-sm text-error font-bold">
                {urgentCount}
              </span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`font-label-caps text-label-caps flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors ${
        active
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-semibold'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[16px] ${
          active ? '' : 'text-primary'
        }`}
      >
        {icon}
      </span>
      {label}
      {count !== undefined && (
        <span
          className={`py-0.2 rounded-full px-1.5 text-[10px] ${
            active
              ? 'bg-white/20'
              : 'bg-secondary-container text-on-secondary-container'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
