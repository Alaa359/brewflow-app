'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Gérant / Super-Admin',
  SERVER: 'Barista & Service',
  KITCHEN: 'Chef Pâtissier',
};

const ROLE_CHIPS: Record<string, string> = {
  ADMIN: 'bg-secondary-container/10 text-on-secondary-container',
  SERVER: 'bg-primary-container/10 text-primary-container',
  KITCHEN: 'bg-tertiary-fixed/10 text-tertiary-fixed',
};

const DONUT_COLORS = ['#8b5013', '#c88242', '#2f6a44', '#6c5b53'];

const PERIODS: { key: 'jour' | 'semaine' | 'mois'; label: string }[] = [
  { key: 'jour', label: "Aujourd'hui (En direct)" },
  { key: 'semaine', label: '7 Derniers Jours' },
  { key: 'mois', label: 'Ce Mois' },
];

const STATIONS = [
  { name: 'Espresso Bar', device: 'Synesso MVP 1', icon: 'local_cafe' },
  { name: 'Filtre & Slow Bar', device: 'Mahlkönig EK43', icon: 'coffee_maker' },
  { name: 'Cuisine Chaude Brunch', device: 'Rational 202', icon: 'soup_kitchen' },
  { name: 'Fournil & Pâtisserie', device: 'Four température 2.0', icon: 'bakery_dining' },
];

function fmtInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmtDT(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  const [int, dec] = rounded.toFixed(3).split('.');
  return `${fmtInt(Number(int))}.${dec}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

type HourlyPoint = { hour: number; revenue: number; tickets: number };
type CategorySlice = { name: string; revenue: number; sharePercent: number };
type DishRow = {
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  imageUrl: string | null;
};
type LowStockRow = {
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
};
type StrategicIngredient = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  alert: boolean;
};

export function TableauDeBordDashboard({
  title,
  establishmentName,
  period,
  revenue,
  orderCount,
  averageBasket,
  cashRevenue,
  cardRevenue,
  totalMargin,
  marginRate,
  foodCostRate,
  stockValue,
  ingredientCount,
  stockAlerts,
  hourly,
  categories,
  topDishes,
  lowStock,
  strategicIngredients,
  employees,
}: {
  title: string;
  establishmentName: string;
  period: 'jour' | 'semaine' | 'mois';
  revenue: number;
  orderCount: number;
  averageBasket: number;
  cashRevenue: number;
  cardRevenue: number;
  totalMargin: number;
  marginRate: number;
  foodCostRate: number;
  stockValue: number;
  ingredientCount: number;
  stockAlerts: number;
  hourly: HourlyPoint[];
  categories: CategorySlice[];
  topDishes: DishRow[];
  lowStock: LowStockRow[];
  strategicIngredients: StrategicIngredient[];
  employees: { id: string; name: string; role: string }[];
}) {
  const router = useRouter();
  const [pdfSent, setPdfSent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [occupationTab, setOccupationTab] = useState<'occupation' | 'flux'>(
    'occupation'
  );

  const cashPercent =
    revenue > 0 ? Math.round((cashRevenue / revenue) * 100) : 0;
  const cardPercent =
    revenue > 0 ? Math.round((cardRevenue / revenue) * 100) : 0;
  const badgePercent = Math.max(0, 100 - cashPercent - cardPercent);

  const sendPdf = () => {
    setPdfSent(true);
    window.setTimeout(() => setPdfSent(false), 2600);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      void document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const tableSize = categories.length;
  const donutSlice = categories.slice(0, 4);
  const donutC = 2 * Math.PI * 42;
  const donutSegments = donutSlice
    .map((slice, index) => ({
      ...slice,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      len: (slice.sharePercent / 100) * donutC,
    }))
    .map((seg, index) => {
      const previous = donutSlice
        .slice(0, index)
        .reduce((sum, s) => sum + (s.sharePercent / 100) * donutC, 0);
      return { ...seg, offset: -previous };
    });

  const topThree = topDishes.slice(0, 3);
  const maxDishQuantity = Math.max(...topDishes.map((d) => d.quantity), 1);

  const maxRevenue = Math.max(...hourly.map((h) => h.revenue), 1);
  const peak = hourly.reduce((a, b) =>
    b.revenue > a.revenue ? b : a
  );
  const peakIndex = hourly.indexOf(peak);
  const totalTickets = hourly.reduce((sum, h) => sum + h.tickets, 0);
  const avgTickets = hourly.length ? totalTickets / hourly.length : 0;

  const barPoints = hourly.map((h, i) => {
    const x = 25 + i * 40 + 11;
    const y = 170 - (h.revenue / maxRevenue) * 140;
    return { x, y, value: h.revenue };
  });
  const curvePoints = barPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    `M ${barPoints[0]?.x} 170 L ` +
    barPoints.map((p) => `${p.x} ${p.y}`).join(' L ') +
    (barPoints.length ? ` L ${barPoints[barPoints.length - 1].x} 170 Z` : '');
  const labelIndexes = [0, 2, 4, 6, 8, 10, 12, 14];

  const sortedQ = [...topDishes].map((d) => d.quantity).sort((a, b) => a - b);
  const medQ = sortedQ[Math.floor(sortedQ.length / 2)] ?? 0;
  const marginRates = [...topDishes].map((d) =>
    d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0
  );
  const sortedM = [...marginRates].sort((a, b) => a - b);
  const medM = sortedM[Math.floor(sortedM.length / 2)] ?? 0;

  const bcg = useMemo(
    () =>
      topDishes.map((d) => {
        const marginRateD = d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0;
        const highVolume = d.quantity >= medQ;
        const highMargin = marginRateD >= medM;
        if (highVolume && highMargin) {
          return {
            ...d,
            marginRate: marginRateD,
            cls: 'ETOILE',
            badge: 'bg-primary-fixed-dim text-on-primary-fixed-variant',
            bar: 'bg-primary',
            rec: 'Renforcement de l’offre — volume et marge maîtrisés, sécuriser le stock.',
          };
        }
        if (highVolume && !highMargin) {
          return {
            ...d,
            marginRate: marginRateD,
            cls: 'VACHE',
            badge: 'bg-tertiary-fixed/10 text-tertiary-fixed',
            bar: 'bg-tertiary-fixed',
            rec: 'Volume porteur — réduire le coût matière pour raviver la marge.',
          };
        }
        if (!highVolume && highMargin) {
          return {
            ...d,
            marginRate: marginRateD,
            cls: 'DILEMME',
            badge: 'bg-secondary-container/10 text-on-secondary-container',
            bar: 'bg-secondary',
            rec: 'Marge forte — booster la demande (merchandising, formule dégustation).',
          };
        }
        return {
          ...d,
          marginRate: marginRateD,
          cls: 'POIDS MORT',
          badge: 'bg-surface-container-low text-on-surface-variant',
          bar: 'bg-outline',
          rec: 'Faible volume & marge — retirer ou repenser la recette.',
        };
      }),
    [topDishes, medQ, medM]
  );

  const team = employees.slice(0, 5);
  const alertIngredient = lowStock[0] ?? strategicIngredients[0];
  const healthyIngredient =
    strategicIngredients.find((ing) => !ing.alert) ?? strategicIngredients[1];

  const sparkRevenue = hourly.map((h) => h.revenue);
  const sparkCash = hourly.map((h) => h.revenue * (cashPercent / 100));
  const sparkStock = strategicIngredients.map((ing) => ing.currentStock);

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/15 px-3 py-1.5 text-tertiary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide">
              Synchronisation multi-stations en direct
            </span>
          </span>
        </div>
        <span className="text-xs text-on-surface-variant">
          {String(new Date().getFullYear())} — Données consolidées réseau
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-[260px] flex-col gap-1.5">
          <span className="text-label-caps font-label-caps text-tertiary">
            Aperçu exécutif · Synthèse multi-stations
          </span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">
            {title}
          </h1>
          <p className="text-sm text-on-surface-variant">
            Suivi temps réel de la performance {establishmentName} — ventes,
            marges, stocks & équipes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              onClick={() => void router.push('/dashboard?periode=jour')}
              className={`rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                period === 'jour'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => void router.push('/dashboard?periode=semaine')}
              className={`rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                period === 'semaine'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              7 Jours
            </button>
            <button
              type="button"
              onClick={() => void router.push('/dashboard?periode=mois')}
              className={`rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                period === 'mois'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Ce Mois
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-[38px] items-center gap-2 rounded-xl border border-primary/20 bg-primary-container/10 px-3 text-sm font-semibold text-primary transition hover:bg-primary-container/20"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            {establishmentName}
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold">
              1 site
            </span>
          </button>

          <button
            type="button"
            onClick={sendPdf}
            className="inline-flex h-[38px] items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export PDF
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-[38px] items-center gap-2 rounded-xl border border-outline px-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            Kiosk / TV
          </button>
        </div>
      </div>

      {pdfSent && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-lg">
            <span className="material-symbols-outlined text-[18px] text-tertiary">
              check_circle
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                Rapport consolidé prêt
              </span>
              <span className="text-xs opacity-70">
                {title} · {PERIODS.find((p) => p.key === period)?.label}
              </span>
            </div>
            <button
              type="button"
              onClick={sendPdf}
              className="ml-2 rounded-lg px-2 py-1 text-[12px] font-semibold text-tertiary-fixed transition hover:bg-inverse-on-surface/10"
            >
              Télécharger
            </button>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-primary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">
                storefront
              </span>
            </span>
            <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">
              {orderCount} tickets
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Chiffre Réseau TTC
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            {fmtDT(revenue)}
            <span className="ml-1 align-middle text-lg text-on-surface-variant">
              DT
            </span>
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-tertiary-fixed">+ Flux</span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                Panier moy. {fmtDT(averageBasket)} DT
              </span>
            </div>
            <Sparkline data={sparkRevenue} color="#c88242" id="spark-rev" />
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-tertiary/10 p-2">
              <span className="material-symbols-outlined text-lg text-tertiary-fixed">
                percent
              </span>
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
              {fmtDT(foodCostRate)}% food cost
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Marge Brute
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            {fmtDT(marginRate)}
            <span className="ml-1 align-middle text-lg text-on-surface-variant">
              %
            </span>
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-tertiary-fixed">
                {fmtDT(totalMargin)} DT de marge
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                Coût matière {fmtDT(revenue - totalMargin)} DT
              </span>
            </div>
            <Sparkline data={sparkCash} color="#8b5013" id="spark-margin" />
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-secondary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-on-secondary-container">
                timer
              </span>
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
              En attente KDS
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Cadence KDS
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            —
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant">
                Temps de préparation
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                Télémétrie prochainement
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-primary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">
                inventory_2
              </span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                stockAlerts > 0
                  ? 'bg-error-container/40 text-on-error-container'
                  : 'bg-tertiary/10 text-tertiary-fixed'
              }`}
            >
              {stockAlerts > 0
                ? `${stockAlerts} alertes réassort`
                : `${ingredientCount} actifs`}
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Stocks Actifs — Valeur Inventaire
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            {fmtDT(stockValue)}
            <span className="ml-1 align-middle text-lg text-on-surface-variant">
              DT
            </span>
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-tertiary-fixed">
                {ingredientCount} ingrédients suivis
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                {stockAlerts > 0
                  ? `${stockAlerts} sous le seuil — réassort`
                  : 'Stock nominal'}{' '}
                · {ingredientCount - stockAlerts} sains
              </span>
            </div>
            <Sparkline data={sparkStock} color="#2f6a44" id="spark-stock" />
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-secondary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-on-secondary-container">
                meeting_room
              </span>
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
              En attente sondes
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Occupation & Salles
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            —
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant">
                1 salle opérationnelle
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                Télémétrie prochainement
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-error-container/40 p-2">
              <span className="material-symbols-outlined text-lg text-on-error-container">
                gavel
              </span>
            </span>
            <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">
              {orderCount == hourly.length ? 'Synchro OK' : 'Flux'} DGI
            </span>
          </div>
          <span className="text-label-caps font-label-caps text-on-surface-variant">
            Fiscalité DGI
          </span>
          <span className="font-metric-display text-metric-display font-bold text-on-surface">
            {fmtInt(orderCount)}
            <span className="ml-1 align-middle text-lg text-on-surface-variant">
              / {fmtInt(orderCount)} reçus
            </span>
          </span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-tertiary-fixed">
                Timbre intégré {fmtInt(orderCount)} DT
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                Conformité timbre fiscal POS
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-7">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Dynamique des Ventes par Heure
              </h2>
              <p className="text-xs text-on-surface-variant">
                CA consolidé par créneau horaire · &quot;Pic du Midi&quot; détecté à{' '}
                <span className="font-semibold text-primary">{peak.hour}h</span>
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline">
              insights
            </span>
          </div>

          <div className="relative">
            <svg
              viewBox="0 0 640 200"
              className="h-44 w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Ventes par heure"
            >
              {[30, 70, 110, 150, 170].map((y) => (
                <line
                  key={y}
                  x1="20"
                  x2="620"
                  y1={y}
                  y2={y}
                  stroke="#eae1d3"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.6"
                />
              ))}

              <path d={areaPath} fill="#c88242" opacity="0.12" />

              {hourly.map((h, i) => {
                const isPeak = h.revenue === peak.revenue;
                const x = 25 + i * 40 + 11;
                const y = 170 - (h.revenue / maxRevenue) * 140;
                const barH = 170 - y;
                return (
                  <rect
                    key={h.hour}
                    x={x - 11}
                    y={y}
                    width="22"
                    height={Math.max(barH, 2)}
                    rx="4"
                    fill={
                      isPeak
                        ? '#c88242'
                        : h.revenue / maxRevenue > 0.4
                          ? '#ffdcc2'
                          : '#eae1d3'
                    }
                    opacity={isPeak ? 1 : 0.9}
                  >
                    {isPeak && (
                      <title>
                        {h.hour}h · {fmtDT(h.revenue)} DT · {h.tickets} tickets
                      </title>
                    )}
                  </rect>
                );
              })}

              <polyline
                points={curvePoints}
                fill="none"
                stroke="#8b5013"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {labelIndexes.map((i) => (
                <text
                  key={i}
                  x={25 + i * 40 + 11}
                  y="192"
                  textAnchor="middle"
                  className="fill-on-surface-variant"
                  fontSize="9"
                >
                  {String(hourly[i]?.hour ?? '').padStart(2, '0')}h
                </text>
              ))}

              <g>
                <rect
                  x={barPoints[peakIndex]?.x - 40}
                  y={
                    (barPoints[peakIndex]?.y ?? 170) - 40
                  }
                  width="80"
                  height="32"
                  rx="8"
                  fill="#37302a"
                />
                <text
                  x={barPoints[peakIndex]?.x}
                  y={(barPoints[peakIndex]?.y ?? 170) - 23}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#ffdcc2"
                >
                  PIC · {peak.hour}h
                </text>
                <text
                  x={barPoints[peakIndex]?.x}
                  y={(barPoints[peakIndex]?.y ?? 170) - 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#fdefe5"
                  opacity="0.8"
                >
                  {fmtDT(peak.revenue)} DT
                </text>
              </g>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container-low p-3">
            <div className="flex flex-col">
              <span className="text-label-caps font-label-caps text-on-surface-variant">
                Pic du Midi
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface">
                {peak.hour}h · {fmtDT(peak.revenue)} DT
              </span>
            </div>
            <div className="flex flex-col border-l border-surface-container-high pl-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant">
                Tickets
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface">
                {fmtInt(totalTickets)} reçus
              </span>
            </div>
            <div className="flex flex-col border-l border-surface-container-high pl-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant">
                Flux Moyen
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface">
                {fmtInt(totalTickets / hourly.length)} tk/h
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Mix Ventes
              </h2>
              <p className="text-xs text-on-surface-variant">
                Répartition CA par famille
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-on-surface-variant transition hover:bg-surface-container-high"
              aria-label="Plus de détails"
            >
              <span className="material-symbols-outlined text-lg">more_horiz</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-5">
            <div className="relative h-[128px] w-[128px]">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#eae1d3"
                  strokeWidth="13"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(seg.len - 3, 1)} ${donutC}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                  CA TTC
                </span>
                <span className="font-label-md text-[17px] font-bold text-on-surface">
                  {fmtDT(revenue / 1000)} kDT
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {donutSegments.map((seg) => (
              <div
                key={seg.name}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-[12px] text-on-surface">
                    {seg.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                    {fmtDT(seg.revenue)} DT
                  </span>
                  <span className="w-8 text-right font-label-numeric text-label-numeric text-on-surface">
                    {seg.sharePercent}%
                  </span>
                </div>
              </div>
            ))}
            {tableSize > 4 && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-outline" />
                  <span className="text-[12px] text-on-surface-variant">
                    Autres familles ({tableSize - 4})
                  </span>
                </div>
                <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                  {fmtDT(revenue - donutSlice.reduce((s, c) => s + c.revenue, 0))} DT
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm text-on-surface">
              Top Performers
            </h2>
            <span className="material-symbols-outlined text-[18px] text-outline">
              leaderboard
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {topThree.map((dish, index) => (
              <div key={dish.name} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {dish.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dish.imageUrl}
                      alt=""
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tertiary/10 text-[10px] font-bold text-tertiary-fixed">
                      #{index + 1}
                    </span>
                  )}
                  <span className="flex-1 truncate text-[12px] font-semibold text-on-surface">
                    {dish.name}
                  </span>
                  <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                    {fmtInt(dish.quantity)} u
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min((dish.quantity / maxDishQuantity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-16 text-right font-label-numeric text-[11px] text-on-surface-variant">
                    {fmtDT(dish.revenue)} DT
                  </span>
                </div>
              </div>
            ))}
            {topThree.length === 0 && (
              <p className="text-xs text-on-surface-variant">
                Aucune vente sur la période.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8">
          {STATIONS.map((station, index) => (
            <div
              key={station.name}
              className="flex flex-col gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm ring-1 ring-surface-container-high"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary-container/10 p-1.5">
                    <span className="material-symbols-outlined text-base text-primary">
                      {station.icon}
                    </span>
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">
                      Station {index + 1} · {station.name}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {station.device}
                    </span>
                  </span>
                </div>
                <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-numeric text-label-numeric text-on-surface">
                    {fmtDT(sparkRevenue[index % sparkRevenue.length] ?? 0)} DT
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    CA session · {index + 1} tickets
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-tertiary-fixed">
                  <span className="material-symbols-outlined text-[12px]">
                    wifi_tethering
                  </span>
                  Synchro OK
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm text-on-surface">
              Occupation des Salles
            </h2>
            <div className="flex items-center gap-1 rounded-lg bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => setOccupationTab('occupation')}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                  occupationTab === 'occupation'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                Occupation
              </button>
              <button
                type="button"
                onClick={() => setOccupationTab('flux')}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                  occupationTab === 'flux'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                Flux
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-on-surface">
                {establishmentName} — salle principale
              </span>
              <span className="font-label-numeric text-label-numeric text-on-surface">
                {orderCount} tickets
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${
                    occupationTab === 'occupation'
                      ? Math.min((orderCount / (hourly.length * 8)) * 100, 100)
                      : avgTickets > 0
                        ? Math.min((avgTickets / 8) * 100, 100)
                        : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>
                {occupationTab === 'occupation'
                  ? 'Rotation tables estimée'
                  : `Flux moyen ${fmtDT(avgTickets)} tk/h`}
              </span>
              <span>Télémétrie sondes prochainement</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary-container/10 p-1.5">
              <span className="material-symbols-outlined text-base text-primary">
                payments
              </span>
            </span>
            <h3 className="text-sm font-semibold text-on-surface">
              Caisse & POS
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">Travaux encaissés</span>
              <span className="font-label-numeric text-label-numeric text-on-surface">
                {fmtDT(revenue)} DT
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-14 text-[11px] text-on-surface-variant">Espèces</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${cashPercent}%` }} />
                </div>
                <span className="w-8 text-right font-label-numeric text-[11px] text-on-surface">
                  {cashPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 text-[11px] text-on-surface-variant">TPE</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${cardPercent}%` }} />
                </div>
                <span className="w-8 text-right font-label-numeric text-[11px] text-on-surface">
                  {cardPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 text-[11px] text-on-surface-variant">Badge</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-outline" style={{ width: `${badgePercent}%` }} />
                </div>
                <span className="w-8 text-right font-label-numeric text-[11px] text-on-surface">
                  {badgePercent}%
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-tertiary-fixed">
            Timbre fiscal {fmtInt(orderCount)} DT · {fmtInt(orderCount)} tickets
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-secondary-container/10 p-1.5">
              <span className="material-symbols-outlined text-base text-on-secondary-container">
                precision_manufacturing
              </span>
            </span>
            <h3 className="text-sm font-semibold text-on-surface">
              KDS & Production
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">Files actives</span>
              <span className="font-label-numeric text-label-numeric text-on-surface">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">Temps de ticket</span>
              <span className="font-label-numeric text-label-numeric text-on-surface">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">En production</span>
              <span className="font-label-numeric text-label-numeric text-on-surface">—</span>
            </div>
          </div>
          <span className="text-[10px] text-on-surface-variant">
            Télémétrie KDS prochainement
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-tertiary/10 p-1.5">
              <span className="material-symbols-outlined text-base text-tertiary-fixed">
                eco
              </span>
            </span>
            <h3 className="text-sm font-semibold text-on-surface">
              Stocks & DLC Live
            </h3>
          </div>
          {alertIngredient ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">Alerte prioritaire</span>
                <span className="font-label-numeric text-label-numeric text-on-surface">
                  {alertIngredient.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">Stock / Seuil</span>
                <span
                  className={`font-label-numeric text-label-numeric ${
                    lowStock.length > 0 ? 'text-error' : 'text-on-surface'
                  }`}
                >
                  {fmtDT(alertIngredient.currentStock)} / {fmtDT(alertIngredient.minThreshold)}{' '}
                  {alertIngredient.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">Valeur inventaire</span>
                <span className="font-label-numeric text-label-numeric text-on-surface">
                  {fmtDT(stockValue)} DT
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={`h-full rounded-full ${
                    lowStock.length > 0 ? 'bg-error' : 'bg-tertiary'
                  }`}
                  style={{
                    width: `${Math.min((alertIngredient.currentStock / Math.max(alertIngredient.minThreshold, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-[11px] text-on-surface-variant">
              Aucun ingrédient enregistré.
            </p>
          )}
          <span
            className={`text-[10px] ${
              lowStock.length > 0 ? 'text-error' : 'text-tertiary-fixed'
            }`}
          >
            {lowStock.length > 0
              ? `${lowStock.length} ingrédient(s) sous le seuil`
              : 'Stock nominal — DLC suivies'}
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-error-container/40 p-1.5">
              <span className="material-symbols-outlined text-base text-on-error-container">
                groups
              </span>
            </span>
            <h3 className="text-sm font-semibold text-on-surface">
              RH & Productivité
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {team.slice(0, 3).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${ROLE_CHIPS[employee.role] ?? 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {initials(employee.name)}
                  </span>
                  <span className="text-[12px] font-medium text-on-surface">
                    {employee.name}
                  </span>
                </div>
                <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                  {ROLE_LABELS[employee.role] ?? employee.role}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-tertiary-fixed">
            {team.length} collaborateurs actifs · 1 site
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Ingrédients Stratégiques
              </h2>
              <p className="text-xs text-on-surface-variant">
                Suivi stock & coût unitaire (PMP)
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline">
              inventory_2
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {strategicIngredients.slice(0, 6).map((ing) => {
              const pct = Math.min(
                (ing.currentStock / Math.max(ing.minThreshold, 1)) * 100,
                100
              );
              return (
                <div
                  key={ing.id}
                  className={`flex flex-col gap-1.5 rounded-xl p-2.5 ring-1 ${
                    ing.alert
                      ? 'bg-error-container/40 ring-error/30'
                      : 'bg-surface-container-low ring-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-on-surface">
                      {ing.name}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        ing.alert
                          ? 'bg-error text-on-error-container'
                          : 'bg-tertiary/10 text-tertiary-fixed'
                      }`}
                    >
                      {ing.alert ? 'ALERTE' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>
                      {fmtDT(ing.currentStock)} {ing.unit} / seuil {fmtDT(ing.minThreshold)}
                    </span>
                    <span className="font-label-numeric text-label-numeric text-on-surface">
                      {fmtDT(ing.costPerUnit)} DT
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className={`h-full rounded-full ${ing.alert ? 'bg-error' : 'bg-tertiary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {strategicIngredients.length === 0 && (
              <p className="text-xs text-on-surface-variant">
                Aucun ingrédient suivi sur cette période.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Plats & Menu Engineering
              </h2>
              <p className="text-xs text-on-surface-variant">
                Matrice BCG temporelle · marge vs volume ({topDishes.length} plats)
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-on-surface-variant transition hover:bg-surface-container-high"
              aria-label="Filtrer"
            >
              <span className="material-symbols-outlined text-lg">tune</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-surface-container-high">
                  <th className="px-1 pb-2 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Plat
                  </th>
                  <th className="px-2 pb-2 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Classification
                  </th>
                  <th className="px-2 pb-2 text-right text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Volume
                  </th>
                  <th className="px-2 pb-2 text-right text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Prix TTC
                  </th>
                  <th className="px-2 pb-2 text-right text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Food Cost
                  </th>
                  <th className="px-2 pb-2 text-right text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Marge Brute
                  </th>
                  <th className="px-2 pb-2 text-right text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    CA TTC
                  </th>
                  <th className="px-1 pb-2 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Recommandation
                  </th>
                </tr>
              </thead>
              <tbody>
                {bcg.map((dish, index) => {
                  const avgPrice = dish.quantity > 0 ? dish.revenue / dish.quantity : 0;
                  const foodCost =
                    dish.revenue > 0 ? Math.round((dish.cost / dish.revenue) * 100) : 0;
                  const margin = dish.revenue - dish.cost;
                  const width = Math.min(
                    (dish.quantity / maxDishQuantity) * 100,
                    100
                  );
                  return (
                    <tr
                      key={dish.name}
                      className={`border-b border-surface-container-lowest ${
                        index % 2 === 0 ? 'bg-surface-container-lowest/40' : ''
                      }`}
                    >
                      <td className="py-2.5 pl-1">
                        <div className="flex items-center gap-2">
                          {dish.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={dish.imageUrl}
                              alt=""
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary/10 text-[10px] font-bold text-tertiary-fixed">
                              {initials(dish.name)}
                            </span>
                          )}
                          <span className="max-w-[120px] truncate text-sm font-semibold text-on-surface">
                            {dish.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${dish.badge}`}
                        >
                          {dish.cls}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <span className="flex flex-col items-end gap-1">
                          <span className="font-label-numeric text-label-numeric text-on-surface">
                            {fmtInt(dish.quantity)}
                          </span>
                          <span className="h-1 w-16 overflow-hidden rounded-full bg-surface-container-high">
                            <span
                              className={`block h-full rounded-full ${dish.bar}`}
                              style={{ width: `${width}%` }}
                            />
                          </span>
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-label-numeric text-label-numeric text-on-surface">
                        {fmtDT(avgPrice)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <span
                          className={`font-label-numeric text-label-numeric ${
                            foodCost > 40 ? 'text-error' : 'text-on-surface-variant'
                          }`}
                        >
                          {foodCost}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <span
                          className={`font-label-numeric text-label-numeric ${
                            margin >= 0 ? 'text-tertiary-fixed' : 'text-error'
                          }`}
                        >
                          {fmtDT(dish.marginRate)}%
                        </span>
                        <span className="block text-[10px] text-on-surface-variant">
                          {fmtDT(margin)} DT
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-label-numeric text-label-numeric text-on-surface">
                        {fmtDT(dish.revenue)}
                      </td>
                      <td className="py-2.5 pl-1 text-[9px] leading-tight text-on-surface-variant">
                        {dish.rec}
                      </td>
                    </tr>
                  );
                })}
                {bcg.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-on-surface-variant">
                      Aucune vente sur la période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Équipe & Planning
              </h2>
              <p className="text-xs text-on-surface-variant">
                {team.length} collaborateurs sur {establishmentName}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline">
              groups
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {team.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2.5 ring-1 ring-surface-container-high"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ROLE_CHIPS[employee.role] ?? 'bg-surface-container-high text-on-surface-variant'}`}
                >
                  {initials(employee.name)}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[12px] font-semibold text-on-surface">
                    {employee.name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    {ROLE_LABELS[employee.role] ?? employee.role}
                  </span>
                </span>
                <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[9px] font-bold text-tertiary-fixed">
                  Planifié
                </span>
              </div>
            ))}
            {team.length === 0 && (
              <p className="text-xs text-on-surface-variant">
                Aucun collaborateur affecté.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high xl:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">
                Établissements multi-sites
              </h2>
              <p className="text-xs text-on-surface-variant">
                Bouquet réseau · consolidation temps réel
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline">
              storefront
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-primary-container/10 p-3 ring-1 ring-primary/20">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/10 blur-md" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">
                  <span className="material-symbols-outlined text-[12px]">cloud_done</span>
                  Site principal
                </span>
                <span className="material-symbols-outlined text-lg text-primary">
                  storefront
                </span>
              </div>
              <h3 className="text-base font-semibold text-on-surface">
                {establishmentName}
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Adresse principale · 1 salle de service
              </p>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="flex flex-col rounded-lg bg-surface-container-lowest/60 p-2">
                  <span className="text-[10px] text-on-surface-variant">CA TTC</span>
                  <span className="font-label-numeric text-label-numeric text-on-surface">
                    {fmtDT(revenue)}
                  </span>
                </div>
                <div className="flex flex-col rounded-lg bg-surface-container-lowest/60 p-2">
                  <span className="text-[10px] text-on-surface-variant">Tickets</span>
                  <span className="font-label-numeric text-label-numeric text-on-surface">
                    {fmtInt(orderCount)}
                  </span>
                </div>
                <div className="flex flex-col rounded-lg bg-surface-container-lowest/60 p-2">
                  <span className="text-[10px] text-on-surface-variant">Panier</span>
                  <span className="font-label-numeric text-label-numeric text-on-surface">
                    {fmtDT(averageBasket)}
                  </span>
                </div>
              </div>
            </div>

            {healthyIngredient && (
              <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-surface-container-low p-3 ring-1 ring-surface-container-high">
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
                  Fournisseur stratégique
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-lg text-tertiary-fixed">
                    local_shipping
                  </span>
                  {healthyIngredient.name}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant">
                    PMP unitaire
                  </span>
                  <span className="font-label-numeric text-label-numeric text-on-surface">
                    {fmtDT(healthyIngredient.costPerUnit)} DT
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant">
                    Approvisionnement
                  </span>
                  <span className="font-label-numeric text-label-numeric text-on-surface-variant">
                    {fmtDT(healthyIngredient.currentStock)} / {fmtDT(healthyIngredient.minThreshold)}{' '}
                    {healthyIngredient.unit}
                  </span>
                </div>
                <span className="text-[10px] text-tertiary-fixed">
                  Suivi DLC & réassort automatiques
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-container-high pt-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">
            lan
          </span>
          <span className="text-[10px]">
            BrewFlow Cloud Sync · Latence 12ms · Mode dégradé local activé
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold text-on-surface-variant transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[14px]">lock_reset</span>
            Sécurité & Gestion Accès
          </button>
          <button
            type="button"
            onClick={sendPdf}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary transition hover:bg-primary-container/10"
          >
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            Audit & Export FEC
          </button>
        </div>
      </footer>
    </div>
  );
}

function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 52;
      const y = 20 - (value / max) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `M0 20 L ${points.replace(/ /g, ' L ')} L 52 20 Z`;
  return (
    <svg viewBox="0 0 52 20" className="h-8 w-14" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}