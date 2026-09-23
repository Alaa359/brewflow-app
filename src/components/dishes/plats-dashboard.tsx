'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DishForm, type DishFormDefaults } from '@/components/dishes/dish-form';
import { CategoriesManager, type CategoryRow } from '@/components/categories/categories-manager';
import { RecipeEditor, type RecipeIngredientOption, type RecipeLineRow } from '@/components/dishes/recipe-editor';
import { createDish, deleteDish, updateDish } from '@/actions/dishes';
import { formatCost } from '@/lib/ingredients';


export type DishRow = DishFormDefaults & {
  recipeCount: number;
  orderItemCount: number;
  cost: number;
  margin: number;
  marginPercent: number | null;
  recipe: RecipeLineRow[];
};

export function PlatsDashboard({
  categories,
  dishes,
  ingredients,
}: {
  categories: CategoryRow[];
  dishes: DishRow[];
  ingredients: RecipeIngredientOption[];
}) {
  const router = useRouter();
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DishRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DishRow | null>(null);
  const [recipeTarget, setRecipeTarget] = useState<DishRow | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedDish = useMemo(
    () => dishes.find((d) => d.id === selectedDishId) ?? dishes[0] ?? null,
    [dishes, selectedDishId]
  );

  const filteredDishes = useMemo(() => {
    let list = dishes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }
    if (activeCategoryId !== 'all') {
      list = list.filter((d) => d.categoryId === activeCategoryId);
    }
    return list;
  }, [dishes, searchQuery, activeCategoryId]);

  const totalDishes = dishes.length;
  const activeDishes = dishes.filter((d) => d.isActive).length;
  const avgMargin = dishes.filter((d) => d.marginPercent !== null).length > 0
    ? dishes.reduce((s, d) => s + (d.marginPercent ?? 0), 0) / dishes.filter((d) => d.marginPercent !== null).length
    : 0;
  const avgFoodCost = dishes.filter((d) => d.marginPercent !== null).length > 0
    ? 100 - avgMargin
    : 0;
  const lowMarginCount = dishes.filter((d) => d.marginPercent !== null && d.marginPercent < 60).length;
  const ruptureCount = dishes.filter((d) => !d.isActive).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.id] = dishes.filter((d) => d.categoryId === c.id).length;
    });
    return counts;
  }, [categories, dishes]);

  return (
    <div className="flex flex-col w-full gap-6">

      {/* ═══ SECTION 1: HEADER & KPI CARDS ═══ */}
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 bg-surface-container-low p-5 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Menu Engineering & Profitabilité</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-xs text-on-surface-variant">Sync Live POS</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Cartographie &amp; Fiches Techniques des Plats
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Arbitrage dynamique des marges atomiques, coûts matières par grammage et positionnement BCG de la carte.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 2xl:flex-nowrap 2xl:shrink-0">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-md hover:bg-primary-container hover:shadow-lg transition-all"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>+ Ajouter un Plat / Recette</span>
            <span className="px-1.5 py-0.5 rounded bg-primary-fixed/30 text-on-primary text-[10px] uppercase font-bold tracking-wide">Nouveau</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-semibold shadow-sm hover:bg-surface-container-highest hover:shadow-md transition-all" type="button">
            <span className="material-symbols-outlined text-lg text-primary">file_download</span>
            Export PDF Fiches
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-semibold shadow-sm hover:bg-surface-container-highest hover:shadow-md transition-all" type="button">
            <span className="material-symbols-outlined text-lg text-primary">insights</span>
            Simulateur Inflation
          </button>
        </div>
      </div>

      {/* KPI SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {/* Stat 1: Total Plats */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Recettes Actives</span>
            <span className="p-1.5 rounded-lg bg-surface-container text-primary material-symbols-outlined text-lg">restaurant</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface">{totalDishes}</span>
            <span className="text-xs font-bold text-tertiary">{activeDishes} actifs</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden flex">
            {categories.slice(0, 4).map((cat, i) => {
              const pct = totalDishes > 0 ? ((categoryCounts[cat.id] ?? 0) / totalDishes) * 100 : 0;
              const colors = ['bg-primary', 'bg-primary-container', 'bg-tertiary', 'bg-outline'];
              return <div key={cat.id} className={`${colors[i % 4]} h-full`} style={{ width: `${pct}%` }}></div>;
            })}
          </div>
        </div>

        {/* Stat 2: Marge Brute Moyenne */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Marge Brute Moyenne</span>
            <span className="p-1.5 rounded-lg bg-tertiary-fixed/40 text-tertiary material-symbols-outlined text-lg">trending_up</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-tertiary">{avgMargin.toFixed(1)}%</span>
            <span className="text-xs text-on-surface-variant">Cible: &gt;70%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Excédent brut : {avgMargin > 70 ? '+' : ''}{(avgMargin - 70).toFixed(1)} pts</span>
            <span className="text-[10px] font-bold text-tertiary uppercase">{avgMargin >= 70 ? 'OPTIMAL' : 'Sous-optimal'}</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-tertiary h-full transition-all duration-700" style={{ width: `${Math.min(avgMargin, 100)}%` }}></div>
          </div>
        </div>

        {/* Stat 3: Food Cost Moyen */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Food Cost Moyen</span>
            <span className="p-1.5 rounded-lg bg-surface-container text-secondary material-symbols-outlined text-lg">pie_chart</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface">{avgFoodCost.toFixed(1)}%</span>
            <span className="text-xs text-tertiary">-{(100 - avgMargin - 25).toFixed(1)}% vs M-1</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Coût matières total : {formatCost(dishes.reduce((s, d) => s + d.cost, 0))}/j</span>
            <span className="text-[10px] font-bold text-on-surface-variant">{dishes.reduce((s, d) => s + d.orderItemCount, 0)} commandes</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-primary-container h-full" style={{ width: `${Math.min(avgFoodCost, 100)}%` }}></div>
          </div>
        </div>

        {/* Stat 4: Ruptures & Alertes */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Alertes Opérationnelles</span>
            <span className="p-1.5 rounded-lg bg-error-container text-on-error-container material-symbols-outlined text-lg">crisis_alert</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-error">{ruptureCount + lowMarginCount}</span>
            <span className="text-xs font-medium text-error">{ruptureCount > 0 ? `${ruptureCount} Rupture${ruptureCount > 1 ? 's' : ''} (86)` : 'Aucune rupture'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>{lowMarginCount} plat{lowMarginCount > 1 ? 's' : ''} à marge sous 60%</span>
            <a className="text-[10px] font-bold text-primary hover:underline" href="#dish-list">Vérifier</a>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-error h-full" style={{ width: `${totalDishes > 0 ? ((ruptureCount + lowMarginCount) / totalDishes) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: STATS AVANCÉES ═══ */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-primary/10 text-primary material-symbols-outlined text-base">analytics</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Statistiques Avancées & Répartition</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Vue d&apos;ensemble des {totalDishes} plats — répartition par catégorie, top marges et performance ventes
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span> Top Marge
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Top Ventes
            </span>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Par Catégorie
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Col 1: Répartition par catégorie (barres horizontales) */}
          <div className="bg-surface-container-low/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Répartition par Catégorie</span>
              <span className="text-[10px] text-on-surface-variant">{categories.length} catégories</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                const pct = totalDishes > 0 ? (count / totalDishes) * 100 : 0;
                const barColors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-primary-container', 'bg-tertiary-fixed', 'bg-secondary-fixed'];
                const colorIdx = categories.indexOf(cat) % barColors.length;
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span className="text-[11px] text-on-surface-variant w-24 truncate text-right">{cat.name}</span>
                    <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden relative">
                      <div
                        className={`${barColors[colorIdx]} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-extrabold text-on-surface w-8 text-right">{count}</span>
                    <span className="text-[10px] text-outline w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <span className="text-xs text-on-surface-variant text-center py-4">Aucune catégorie</span>
              )}
            </div>
          </div>

          {/* Col 2: Top 5 par marge (barres verticales) */}
          <div className="bg-surface-container-low/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Top 5 Marge Brute</span>
              <span className="text-[10px] text-on-surface-variant">HT %</span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {[...dishes]
                .filter((d) => d.marginPercent !== null)
                .sort((a, b) => (b.marginPercent ?? 0) - (a.marginPercent ?? 0))
                .slice(0, 5)
                .map((dish, i) => {
                  const m = dish.marginPercent ?? 0;
                  const h = Math.max(8, (m / 100) * 100);
                  const colors = ['bg-tertiary', 'bg-primary', 'bg-secondary', 'bg-primary-container', 'bg-outline'];
                  return (
                    <div key={dish.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-extrabold text-on-surface">{m.toFixed(0)}%</span>
                      <div className="w-full relative" style={{ height: `${h}%` }}>
                        <div className={`${colors[i]} w-full h-full rounded-t-md transition-all duration-700`}></div>
                      </div>
                      <span className="text-[9px] text-on-surface-variant text-center leading-tight truncate w-full">{dish.name.length > 10 ? dish.name.slice(0, 10) + '…' : dish.name}</span>
                    </div>
                  );
                })}
              {dishes.filter((d) => d.marginPercent !== null).length === 0 && (
                <span className="text-xs text-on-surface-variant text-center py-4 w-full">Pas de données marge</span>
              )}
            </div>
          </div>

          {/* Col 3: Top 5 par ventes + Résumé */}
          <div className="bg-surface-container-low/60 rounded-xl p-4 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Top 5 Ventes</span>
                <span className="text-[10px] text-on-surface-variant">commandes</span>
              </div>
              <div className="flex flex-col gap-2">
                {[...dishes]
                  .sort((a, b) => b.orderItemCount - a.orderItemCount)
                  .slice(0, 5)
                  .map((dish, i) => {
                    const maxOrders = Math.max(...dishes.map((d) => d.orderItemCount), 1);
                    const pct = (dish.orderItemCount / maxOrders) * 100;
                    const medals = ['bg-tertiary text-on-tertiary', 'bg-primary text-on-primary', 'bg-secondary text-on-secondary', 'bg-surface-container-high text-on-surface', 'bg-surface-container-high text-on-surface'];
                    return (
                      <div key={dish.id} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full ${medals[i]} flex items-center justify-center text-[10px] font-extrabold flex-shrink-0`}>{i + 1}</span>
                        <div className="flex-1 h-4 bg-surface-container rounded-full overflow-hidden">
                          <div className="bg-tertiary h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-on-surface w-8 text-right">{dish.orderItemCount}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Mini résumé */}
            <div className="border-t border-outline-variant/20 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2">Résumé Performance</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-surface-container text-center">
                  <span className="text-lg font-extrabold text-tertiary block">{avgMargin.toFixed(1)}%</span>
                  <span className="text-[9px] text-outline uppercase">Marge Moy.</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container text-center">
                  <span className="text-lg font-extrabold text-primary block">{formatCost(dishes.reduce((s, d) => s + d.cost, 0))}</span>
                  <span className="text-[9px] text-outline uppercase">Coût/Jour</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container text-center">
                  <span className="text-lg font-extrabold text-on-surface block">{dishes.reduce((s, d) => s + d.orderItemCount, 0)}</span>
                  <span className="text-[9px] text-outline uppercase">Total Cmd</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container text-center">
                  <span className="text-lg font-extrabold text-secondary block">{formatCost(dishes.reduce((s, d) => s + d.price * d.orderItemCount, 0))}</span>
                  <span className="text-[9px] text-outline uppercase">CA Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 3: TOOLBAR & FILTERS ═══ */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm mb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
          <input
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container text-on-surface placeholder:text-outline text-sm outline-none focus:bg-surface-container-low transition-all"
            placeholder="Filtrer plat, ingrédient..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeCategoryId === 'all' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveCategoryId('all')}
          >
            Tous ({totalDishes})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeCategoryId === cat.id ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name} ({categoryCounts[cat.id] ?? 0})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-bold flex items-center gap-1" type="button">
            <span className="w-2 h-2 rounded-full bg-error"></span> Rupture 86 ({ruptureCount})
          </button>
          <button className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-bold flex items-center gap-1" type="button">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span> Marge &lt; 60% ({lowMarginCount})
          </button>
          <div className="flex items-center gap-1 rounded-lg bg-surface-container p-1">
            <button
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              Grille
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 4: TWO-COLUMN GRID ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start" id="dish-list">
        {/* Left column: Dish Catalog */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {filteredDishes.length === 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 block">search_off</span>
              Aucun plat trouvé pour ce filtre.
            </div>
          )}

          {viewMode === 'list' && filteredDishes.length > 0 && (
            <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4 py-3">Plat</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3 text-right">Prix</th>
                    <th className="px-4 py-3 text-right">Coût</th>
                    <th className="px-4 py-3 text-right">Marge</th>
                    <th className="px-4 py-3 text-right">Ventes</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredDishes.map((dish) => {
                    const cat = categories.find((c) => c.id === dish.categoryId);
                    return (
                      <tr
                        key={dish.id}
                        className="transition-colors hover:bg-surface-container-low/50 cursor-pointer"
                        onClick={() => setSelectedDishId(dish.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {dish.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className="h-9 w-9 shrink-0 rounded-lg object-cover" src={dish.imageUrl} alt={dish.name} />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                                <span className="material-symbols-outlined text-lg">restaurant</span>
                              </div>
                            )}
                            <div className="text-sm font-bold text-on-surface">{dish.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{cat?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">{formatCost(dish.price)}</td>
                        <td className="px-4 py-3 text-right text-on-surface-variant">
                          {dish.recipeCount > 0 ? formatCost(dish.cost) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {dish.marginPercent !== null ? (
                            <span className={dish.marginPercent >= 70 ? 'font-bold text-tertiary' : dish.marginPercent >= 50 ? 'font-bold text-primary' : 'font-bold text-error'}>
                              {formatCost(dish.margin)} · {dish.marginPercent}%
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">{dish.orderItemCount}</td>
                        <td className="px-4 py-3">
                          {dish.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed/30 px-2.5 py-1 text-[11px] font-bold text-on-tertiary-fixed-variant">
                              <span className="h-2 w-2 rounded-full bg-tertiary"></span>
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-error-container/40 px-2.5 py-1 text-[11px] font-bold text-on-error-container">
                              <span className="h-2 w-2 rounded-full bg-error"></span>
                              Rupture 86
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-primary cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setEditTarget(dish); }}
                              title="Modifier"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-primary cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setRecipeTarget(dish); }}
                              title="Recette"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-lg">menu_book</span>
                            </button>
                            <button
                              className="rounded p-1.5 text-outline transition-colors hover:bg-error-container hover:text-error cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(dish); }}
                              title="Supprimer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          {filteredDishes.map((dish) => {
            const cat = categories.find((c) => c.id === dish.categoryId);
            const marginLabel = dish.marginPercent !== null
              ? dish.marginPercent >= 70
                ? 'STAR BCG'
                : dish.marginPercent >= 50
                  ? 'PUZZLE BCG'
                  : 'DOG BCG'
              : 'À définir';
            const marginBadgeClass = dish.marginPercent !== null
              ? dish.marginPercent >= 70
                ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant'
                : dish.marginPercent >= 50
                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                  : 'bg-error-container text-on-error-container'
              : 'bg-surface-container text-on-surface-variant';

            return (
              <div
                key={dish.id}
                className="bg-surface-container-lowest rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedDishId(dish.id)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
                  <div className="flex items-center gap-4">
                    {dish.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="w-20 h-20 rounded-lg object-cover flex-shrink-0 shadow-sm" src={dish.imageUrl} alt={dish.name} />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-outline text-3xl">restaurant</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${marginBadgeClass}`}>{marginLabel}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">{cat?.name ?? '—'}</span>
                        {!dish.isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span> RUPTURE 86
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 group-hover:text-primary transition-colors">{dish.name}</h3>
                      <p className="text-sm text-on-surface-variant line-clamp-1">{dish.description ?? cat?.name ?? ''}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto">
                    <span className="text-xl font-extrabold text-on-surface">{formatCost(dish.price)}</span>
                    <span className="text-[11px] text-outline">TVA incluse</span>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 bg-surface-container-low/70 rounded-lg px-4 my-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-outline block">Coût Revient</span>
                    <span className="text-sm font-extrabold text-on-surface">{formatCost(dish.cost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-outline block">Marge Brute</span>
                    <span className="text-sm font-extrabold text-tertiary">{formatCost(dish.margin)}</span>
                    <span className="text-[10px] text-tertiary font-bold block">{dish.marginPercent !== null ? `${dish.marginPercent}% du CA HT` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-outline block">Ventes</span>
                    <span className="text-sm font-extrabold text-on-surface">{dish.orderItemCount}</span>
                    <span className="text-[10px] text-on-surface-variant block">{dish.recipeCount} ingrédient{dish.recipeCount > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-outline block">Allergènes</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dish.recipe.length === 0 && <span className="text-[10px] text-outline">Aucun</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-outline">Recette #{dish.recipeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all text-[11px] font-bold"
                      onClick={(e) => { e.stopPropagation(); setEditTarget(dish); }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Modifier
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all text-[11px] font-bold"
                      onClick={(e) => { e.stopPropagation(); setRecipeTarget(dish); }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">menu_book</span>
                      Recette
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tertiary-fixed/30 text-on-tertiary-fixed-variant hover:bg-tertiary-fixed/50 text-[10px] font-bold transition-all"
                      onClick={(e) => e.stopPropagation()}
                      type="button"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isActive ? 'bg-tertiary' : 'bg-error'}`}></span>
                      {dish.isActive ? 'Actif' : 'Rupture 86'}
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(dish); }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base text-error">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>

        {/* Right column: Technical Sheet Drawer */}
        {selectedDish && (
          <div className="xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-md p-5 flex flex-col gap-4 sticky top-20">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-primary-container text-on-primary-container px-2 py-0.5 rounded">Fiche Technique Active</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">{selectedDish.name}</h2>
                <span className="text-xs text-on-surface-variant">{categories.find((c) => c.id === selectedDish.categoryId)?.name ?? 'Recette'} • {selectedDish.recipeCount} ingrédient{selectedDish.recipeCount > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Ingredients list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-outline">
                <span>Ingrédient & Grammage</span>
                <span>Coût</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {selectedDish.recipe.length === 0 && (
                  <div className="p-2 rounded-lg bg-surface-container-low text-xs text-on-surface-variant text-center">
                    Aucun ingrédient défini. Ajoutez une recette.
                  </div>
                )}
                {selectedDish.recipe.map((line, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">grain</span>
                      <div>
                        <span className="text-sm font-medium text-on-surface block">{line.ingredientName}</span>
                        <span className="text-[11px] text-outline">{line.quantityNeeded} {line.unit}</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-on-surface">{formatCost(line.quantityNeeded * line.costPerUnit)}</span>
                  </div>
                ))}
              </div>
              {selectedDish.recipe.length > 0 && (
                <div className="flex items-center justify-between pt-2 px-1">
                  <span className="text-sm text-on-surface-variant font-bold">Total Matières :</span>
                  <span className="text-lg font-extrabold text-primary">{formatCost(selectedDish.cost)}</span>
                </div>
              )}
            </div>

            {/* Pricing info */}
            <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">tune</span> Analyse Prix
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-on-surface">Prix de vente :</span>
                <span className="font-extrabold text-on-surface">{formatCost(selectedDish.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-on-surface">Marge brute :</span>
                <span className={`font-extrabold ${selectedDish.marginPercent !== null && selectedDish.marginPercent >= 70 ? 'text-tertiary' : selectedDish.marginPercent !== null && selectedDish.marginPercent >= 50 ? 'text-primary' : 'text-error'}`}>
                  {selectedDish.marginPercent !== null ? `${selectedDish.marginPercent}%` : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${selectedDish.marginPercent !== null && selectedDish.marginPercent >= 70 ? 'bg-tertiary' : selectedDish.marginPercent !== null && selectedDish.marginPercent >= 50 ? 'bg-primary' : 'bg-error'}`}
                  style={{ width: `${Math.min(selectedDish.marginPercent ?? 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                <span>Seuil critique : 65%</span>
                <span className={`font-bold ${selectedDish.marginPercent !== null && selectedDish.marginPercent >= 65 ? 'text-tertiary' : 'text-error'}`}>
                  {selectedDish.marginPercent !== null ? `+${(selectedDish.marginPercent - 65).toFixed(1)}% marge sécurité` : 'Pas de données'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                className="flex-1 py-2.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-on-surface text-sm font-medium transition-colors text-center"
                onClick={() => setEditTarget(selectedDish)}
                type="button"
              >
                Modifier
              </button>
              <button
                className="p-2.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-on-surface transition-colors"
                onClick={() => setRecipeTarget(selectedDish)}
                title="Éditer la recette"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">menu_book</span>
              </button>
              <button
                className="p-2.5 rounded-lg bg-surface-container-high hover:bg-error-container hover:text-error text-outline transition-colors"
                onClick={() => setDeleteTarget(selectedDish)}
                title="Supprimer"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">archive</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODAL: ADD / EDIT DISH ═══ */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">restaurant_menu</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Ajouter un Nouveau Plat</h3>
                  <p className="text-xs text-on-surface-variant">Définition des coûts, TVA et catégorisation</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors" type="button" onClick={() => setCreateOpen(false)}>
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DishForm action={createDish} categories={categories} onSuccess={() => setCreateOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: EDIT DISH ═══ */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">edit</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Modifier : {editTarget.name}</h3>
                  <p className="text-xs text-on-surface-variant">Modification de la fiche plat</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors" type="button" onClick={() => setEditTarget(null)}>
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DishForm
                action={updateDish.bind(null, editTarget.id)}
                categories={categories}
                dish={editTarget}
                onSuccess={() => setEditTarget(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: RECIPE EDITOR ═══ */}
      {recipeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Recette : {recipeTarget.name}</h3>
                  <p className="text-xs text-on-surface-variant">Édition des ingrédients et grammages</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors" type="button" onClick={() => setRecipeTarget(null)}>
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <RecipeEditor
                dishId={recipeTarget.id}
                price={recipeTarget.price}
                recipe={recipeTarget.recipe}
                ingredients={ingredients}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE CONFIRMATION ═══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 border border-outline-variant/30">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-error-container text-error flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Supprimer ce plat ?</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-on-surface">{deleteTarget.name}</strong> ?
                </p>
                <div className="mt-3 p-2 rounded bg-surface-container text-[11px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">info</span>
                  Vous pouvez plutôt passer le plat en statut « Rupture 86 ».
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs" type="button" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button
                className="px-3.5 py-1.5 rounded-lg bg-error text-on-error hover:bg-on-error-container text-xs font-semibold shadow-sm"
                type="button"
                onClick={async () => {
                  await deleteDish(deleteTarget.id);
                  setDeleteTarget(null);
                  router.refresh();
                }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: CATEGORIES MANAGER ═══ */}
      <CategoriesManager
        categories={categories}
        open={catOpen}
        onOpenChange={setCatOpen}
      />
    </div>
  );
}
