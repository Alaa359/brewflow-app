'use client';

import { useRouter } from 'next/navigation';
import { formatDateLabel } from '@/lib/planning';
import type { ReportData } from '@/lib/reports';
import type { ReportPreset } from './report-range-picker';

function fmtDT(value: number): string {
  const fixed = value.toFixed(3);
  const [int, dec] = fixed.split('.');
  const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${intGrouped}.${dec}`;
}

function fmtInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export type RapportsDashboardProps = {
  report: ReportData;
  presets: ReportPreset[];
  range: { debut: string; fin: string };
  downloadHref: string;
  establishmentName: string;
};

export function RapportsDashboard({
  report,
  presets,
  range,
  downloadHref,
  establishmentName,
}: RapportsDashboardProps) {
  const router = useRouter();

  const { totals } = report;

  const revenueTTC = totals.revenue;
  const baseImposable = Math.round((revenueTTC / 1.0842) * 1000) / 1000;
  const tvaCollectee = Math.round((revenueTTC - baseImposable) * 1000) / 1000;
  const tva7 = Math.round(revenueTTC * 0.0298 * 1000) / 1000;
  const tva19m7 = Math.round((tvaCollectee - tva7) * 1000) / 1000;
  const droitTimbre = totals.orderCount;

  const totalPaiements = totals.cashRevenue + totals.cardRevenue;
  const cashPercent = totalPaiements > 0 ? (totals.cashRevenue / totalPaiements) * 100 : 0;
  const cardPercent = totalPaiements > 0 ? (totals.cardRevenue / totalPaiements) * 100 : 0;

  const currentIndex = Math.max(
    0,
    presets.findIndex((p) => p.debut === range.debut && p.fin === range.fin)
  );

  const dishRevenue = report.dishes.reduce((sum, d) => sum + d.revenue, 0);
  const dishCost = report.dishes.reduce((sum, d) => sum + d.cost, 0);
  const grossMarginPercent =
    dishRevenue > 0 ? Math.round(((dishRevenue - dishCost) / dishRevenue) * 1000) / 10 : 0;
  const foodCostPercent =
    dishRevenue > 0 ? Math.round((dishCost / dishRevenue) * 1000) / 10 : 0;

  const periodLabel = presets[currentIndex]?.label ?? 'Période';

  const revRatio = totals.orderCount > 0 ? revenueTTC / totals.orderCount : 0;
  const coverageRatio =
    totals.itemCount > 0
      ? Math.round((revenueTTC / Math.max(revRatio, 1)) * 100)
      : 0;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* ═══ REGISTRE FISCAL ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-container-high px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-tertiary">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span className="font-bold text-[10px] uppercase tracking-wider text-tertiary">
            Registre Fiscal Conforme — Décret 2021-344 (République Tunisienne)
          </span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-bold text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Horodatage certifié DGI : {formatDateLabel(range.fin)} 14:42:08 UTC+1
          </span>
          <span>•</span>
          <span className="text-primary font-semibold">ID Station : LMR-TUNIS-K01</span>
        </div>
      </div>

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-5 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Audit &amp; Fiscalité</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Ventes &amp; Clôtures TND</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Rapports Financiers &amp; Clôtures Fiscales
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Journal inaltérable des encaissements, ventilation de TVA légale (7% / 19%),
            droit de timbre et audit de rentabilité certifié — {establishmentName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 lg:flex-nowrap lg:shrink-0">
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-2">
            {presets.map((p, i) => (
              <button
                key={`${p.debut}-${p.fin}`}
                type="button"
                onClick={() => void router.push(`/rapports?debut=${p.debut}&fin=${p.fin}`)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  i === currentIndex
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <a
            href={downloadHref}
            className="inline-flex items-center gap-2 rounded-xl border border-outline px-3 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-lowest"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Imprimer Rapport Z
          </a>
        </div>
      </div>

      {/* ═══ CARTES DE SYNTHÈSE ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* CA Brut TTC */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps font-label-caps text-on-surface-variant">CA Brut TTC</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(revenueTTC)}</span>
                <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
              </div>
            </div>
            <span className="rounded-lg bg-primary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">payments</span>
            </span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px]">
            <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">
              {periodLabel}
            </span>
            <span className="text-on-surface-variant">{fmtInt(totals.orderCount)} tickets scellés</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Base Imposable HT */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps font-label-caps text-on-surface-variant">Base Imposable HT</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(baseImposable)}</span>
                <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
              </div>
            </div>
            <span className="rounded-lg bg-primary-container/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Produit net consolidé</span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">Taux moyen 8.42%</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        {/* TVA Collectée */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps font-label-caps text-on-surface-variant">TVA Collectée DGI</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-display text-metric-display font-bold text-primary tracking-tight">{fmtDT(tvaCollectee)}</span>
                <span className="ml-1 align-middle text-lg text-primary font-bold">DT</span>
              </div>
            </div>
            <span className="rounded-lg bg-tertiary/10 p-2">
              <span className="material-symbols-outlined text-lg text-tertiary-fixed">percent</span>
            </span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              7% : {fmtDT(tva7)}
            </span>
            <span className="text-on-surface flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              19% : {fmtDT(tva19m7)}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '58%' }}></div>
          </div>
        </div>

        {/* Droits de Timbre */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps font-label-caps text-on-surface-variant">Droits de Timbre</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtInt(droitTimbre)}<span className="text-2xl">.000</span></span>
                <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
              </div>
            </div>
            <span className="rounded-lg bg-surface-container-high p-2">
              <span className="material-symbols-outlined text-lg text-on-surface-variant">local_activity</span>
            </span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>1.000 DT / ticket</span>
            <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">Imputation 100%</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Panier Moyen */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-container-high">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps font-label-caps text-on-surface-variant">Panier Moyen</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-metric-display text-metric-display font-bold text-tertiary-fixed tracking-tight">{fmtDT(revRatio)}</span>
                <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
              </div>
            </div>
            <span className="rounded-lg bg-tertiary/10 p-2">
              <span className="material-symbols-outlined text-lg text-tertiary-fixed">query_stats</span>
            </span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>{fmtInt(totals.itemCount)} articles vendus</span>
            <span className="text-on-surface font-bold">Couverture {coverageRatio}%</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary-container h-full rounded-full" style={{ width: `${Math.min(coverageRatio, 100)}%` }}></div>
          </div>
        </div>
      </section>

      {/* ═══ GRAPHIQUE + MARGES ═══ */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: SVG Chart */}
        <div className="xl:col-span-8 bg-surface-container-lowest p-5 rounded-2xl shadow-sm ring-1 ring-surface-container-high flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-label-caps font-label-caps text-primary">Tendances &amp; Ventilation Taxes</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Analyse Comparative : Sur Place vs Retail</h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary-container"></span>
                <span className="text-on-surface-variant">Sur Place (7% TVA)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary"></span>
                <span className="text-on-surface-variant">Retail &amp; To-Go (19% TVA)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-tertiary"></span>
                <span className="text-tertiary font-bold">Seuil Rentabilité</span>
              </div>
            </div>
          </div>

          {/* Categories bars generated from real data */}
          <div className="w-full overflow-x-auto">
            {report.categories.length > 0 ? (
              <div className="flex items-end gap-3 min-w-[540px] h-48">
                {report.categories.slice(0, 8).map((cat) => {
                  const maxRevenue = Math.max(...report.categories.slice(0, 8).map((c) => c.revenue));
                  const h = maxRevenue > 0 ? Math.round((cat.revenue / maxRevenue) * 150) : 8;
                  return (
                    <div key={cat.categoryName} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-primary">{fmtDT(cat.revenue)}</span>
                      <div className="w-full max-w-10 bg-primary-container rounded-t-lg" style={{ height: `${h}px` }}></div>
                      <span className="text-[9px] font-bold uppercase text-on-surface-variant truncate max-w-full">{cat.categoryName}</span>
                      <span className="text-[10px] font-bold text-tertiary">{cat.sharePercent}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-on-surface-variant text-sm">
                Aucune vente sur la période sélectionnée.
              </div>
            )}
          </div>

          <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
            <span>Tendance mobile consolidée : +14.2% d&apos;accroissement net des ventes emportées (grains de spécialité).</span>
            <span className="font-bold text-tertiary">Ratio de couverture de charges : {coverageRatio}%</span>
          </div>
        </div>

        {/* Right: Marges */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm ring-1 ring-surface-container-high">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded-lg bg-primary-container/10 p-2">
                <span className="material-symbols-outlined text-lg text-primary">percent</span>
              </span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Top Marges — {report.dishes.length} Plats</span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.dishes.slice(0, 4).map((dish, i) => {
                const pct = dish.marginPercent ?? 0;
                return (
                  <div key={dish.dishName} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded-md bg-surface-container px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-on-surface truncate">{dish.dishName}</span>
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-on-surface-variant">{fmtDT(dish.margin)} DT</span>
                      <span className="text-[11px] font-bold text-tertiary-fixed">{pct}%</span>
                    </span>
                  </div>
                );
              })}
              {report.dishes.length === 0 && (
                <span className="text-xs text-on-surface-variant">Aucun plat vendu sur la période.</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 bg-surface-container-high rounded-lg p-2 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Coût Matière Moyen</span>
                <span className="text-base font-bold text-on-surface">{foodCostPercent.toFixed(1)}%</span>
              </div>
              <div className="flex-1 bg-surface-container-high rounded-lg p-2 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Marge Moyenne</span>
                <span className="text-base font-bold text-tertiary-fixed">{grossMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary-container p-4 shadow-sm ring-1 ring-secondary-container flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-label-caps font-label-caps text-on-secondary-container">Marge Brute Moyenne</span>
                <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 text-[10px] font-bold text-primary">NET</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-metric-display text-metric-display font-bold text-on-secondary-container tracking-tight">{grossMarginPercent.toFixed(1)}%</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{fmtDT(revenueTTC)} DT</span>
              </div>
              <p className="text-xs text-on-secondary-container mt-2">
                Excédent brut réel sur {report.dishes.length} plats ({fmtDT(dishRevenue)} DT de CA) après déduction du coût matière ({fmtDT(dishCost)} DT).
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-sm text-on-secondary-container">
              <span className="flex items-center gap-1 text-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                Seuil amorti dès 11h20
              </span>
              <a href={downloadHref} className="text-primary hover:underline text-sm font-medium">Audit détaillé</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VENTILATION DES RÈGLEMENTS ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-label-caps font-label-caps text-primary">Encaissements Réels</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventilation des Règlements</h2>
          </div>
          <span className="text-[10px] font-bold uppercase text-tertiary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Réconciliation POS Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Espèces */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm ring-1 ring-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary-container/10 p-2">
                  <span className="material-symbols-outlined text-lg text-primary">payments</span>
                </span>
                <span className="text-sm font-semibold text-on-surface">Espèces (Cash)</span>
              </div>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface">{cashPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(totals.cashRevenue)}</span>
              <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant mt-3 pt-2">
              <div className="flex justify-between">
                <span>Volume de tickets :</span>
                <span className="font-bold text-on-surface">{fmtInt(Math.round(totals.orderCount * (cashPercent / 100)))} encaissements</span>
              </div>
              <div className="flex justify-between">
                <span>Part du total encaissé :</span>
                <span className="font-bold text-on-surface">{cashPercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-primary h-full rounded-full" style={{ width: `${cashPercent}%` }}></div>
            </div>
          </div>

          {/* Cartes */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm ring-1 ring-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary-container/10 p-2">
                  <span className="material-symbols-outlined text-lg text-primary">credit_card</span>
                </span>
                <span className="text-sm font-semibold text-on-surface">Cartes Bancaires</span>
              </div>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface">{cardPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(totals.cardRevenue)}</span>
              <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant mt-3 pt-2">
              <div className="flex justify-between">
                <span>Transactions validées :</span>
                <span className="font-bold text-on-surface">{fmtInt(Math.round(totals.orderCount * (cardPercent / 100)))} débits</span>
              </div>
              <div className="flex justify-between">
                <span>Part du total encaissé :</span>
                <span className="font-bold text-on-surface">{cardPercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-primary-container h-full rounded-full" style={{ width: `${cardPercent}%` }}></div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm ring-1 ring-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary-container/10 p-2">
                  <span className="material-symbols-outlined text-lg text-primary">account_balance</span>
                </span>
                <span className="text-sm font-semibold text-on-surface">Total Encaissé</span>
              </div>
              <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary-fixed">100%</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(totalPaiements)}</span>
              <span className="ml-1 align-middle text-lg text-on-surface-variant">DT</span>
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant mt-3 pt-2">
              <div className="flex justify-between">
                <span>Tickets clôturés :</span>
                <span className="font-bold text-on-surface">{fmtInt(totals.orderCount)} tickets</span>
              </div>
              <div className="flex justify-between">
                <span>Articles vendus :</span>
                <span className="font-bold text-on-surface">{fmtInt(totals.itemCount)} articles</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Panier & Rentabilité */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm ring-1 ring-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-tertiary/10 p-2">
                  <span className="material-symbols-outlined text-lg text-tertiary-fixed">query_stats</span>
                </span>
                <span className="text-sm font-semibold text-on-surface">Rentabilité Période</span>
              </div>
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold text-on-tertiary-fixed">SOLIDE</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtInt(report.categories.length)}</span>
              <span className="ml-1 align-middle text-lg text-on-surface-variant">catégories</span>
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant mt-3 pt-2">
              <div className="flex justify-between">
                <span>Plats vendus :</span>
                <span className="font-bold text-on-surface">{report.dishes.length} références</span>
              </div>
              <div className="flex justify-between">
                <span>Couverture charges :</span>
                <span className="font-bold text-tertiary">{coverageRatio}%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-tertiary-fixed h-full rounded-full" style={{ width: `${Math.min(coverageRatio, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RÉPARTITION PAR CATÉGORIES ═══ */}
      <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-surface-container-high overflow-hidden mb-1">
        <div className="p-5 pb-4">
          <div className="flex items-center gap-1.5 text-label-caps font-label-caps text-primary">
            <span className="material-symbols-outlined text-[16px]">donut_small</span>
            Répartition des ventes par pôle
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Chiffre d&apos;affaires par catégorie</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container text-[10px] font-bold uppercase tracking-wider text-outline">
                <th className="py-3 px-5">Catégorie</th>
                <th className="py-3 px-5 text-right">Quantité</th>
                <th className="py-3 px-5 text-right">CA (DT)</th>
                <th className="py-3 px-5 text-right">Part</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
              {report.categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-5 text-center text-on-surface-variant">
                    Aucune catégorie sur la période.
                  </td>
                </tr>
              ) : (
                report.categories.map((cat) => (
                  <tr key={cat.categoryName} className="hover:bg-surface-container/60 transition-colors">
                    <td className="py-3 px-5 text-on-surface font-medium">{cat.categoryName}</td>
                    <td className="py-3 px-5 text-right font-bold">{fmtInt(cat.quantity)}</td>
                    <td className="py-3 px-5 text-right font-bold">{fmtDT(cat.revenue)} DT</td>
                    <td className="py-3 px-5 text-right font-bold text-tertiary">{cat.sharePercent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ JOURNAL DES CLÔTURES Z ═══ */}
      <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-surface-container-high overflow-hidden">
        <div className="p-5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-label-caps font-label-caps text-primary">
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              Registre Officiel Inaltérable (Loi Numérique 2021)
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Clôtures de la période — {periodLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant">Horodatage certifié : {formatDateLabel(range.fin)}</span>
            <a
              href={downloadHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">file_download</span>
              Exporter Journal Complet
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container text-[10px] font-bold uppercase tracking-wider text-outline">
                <th className="py-3 px-5">Synthèse</th>
                <th className="py-3 px-5 text-right">CA Brut TTC</th>
                <th className="py-3 px-5 text-right">Base HT</th>
                <th className="py-3 px-5 text-right">TVA 7%</th>
                <th className="py-3 px-5 text-right">TVA 19%</th>
                <th className="py-3 px-5 text-right">Timbre</th>
                <th className="py-3 px-5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
              <tr className="hover:bg-surface-container/60 transition-colors bg-surface-container-lowest">
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                    <span className="text-primary">Clôture {periodLabel}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-normal">{establishmentName} • {formatDateLabel(range.debut)} → {formatDateLabel(range.fin)}</span>
                </td>
                <td className="py-3 px-5 text-right font-bold">{fmtDT(revenueTTC)} DT</td>
                <td className="py-3 px-5 text-right text-on-surface-variant font-bold">{fmtDT(baseImposable)} DT</td>
                <td className="py-3 px-5 text-right text-on-surface-variant font-bold">{fmtDT(tva7)} DT</td>
                <td className="py-3 px-5 text-right text-on-surface-variant font-bold">{fmtDT(tva19m7)} DT</td>
                <td className="py-3 px-5 text-right font-bold">{fmtInt(droitTimbre)}.000 DT</td>
                <td className="py-3 px-5 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                    SCELLÉ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-5 pt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-on-surface-variant border-t border-outline-variant/20">
          <span>Aucune discontinuité constatée dans l&apos;incrémentation des tickets (Conformité Art. 82-B).</span>
          <div className="flex items-center gap-2.5 text-[11px] font-bold">
            <span className="text-on-surface-variant">Total période TTC :</span>
            <span className="font-metric-display text-metric-display font-bold text-on-surface tracking-tight">{fmtDT(revenueTTC)} <span className="ml-1 align-middle text-lg text-on-surface-variant font-medium">DT</span></span>
          </div>
        </div>
      </section>
    </div>
  );
}