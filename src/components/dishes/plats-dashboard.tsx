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
  const [activeFilter, setActiveFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DishRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DishRow | null>(null);
  const [recipeTarget, setRecipeTarget] = useState<DishRow | null>(null);
  const [catOpen, setCatOpen] = useState(false);

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
    if (activeFilter === 'cafe') {
      list = list.filter((d) => {
        const cat = categories.find((c) => c.id === d.categoryId);
        return cat?.name.toLowerCase().includes('caf') || cat?.name.toLowerCase().includes('chaud');
      });
    } else if (activeFilter === 'frais') {
      list = list.filter((d) => {
        const cat = categories.find((c) => c.id === d.categoryId);
        return cat?.name.toLowerCase().includes('frais') || cat?.name.toLowerCase().includes('signature');
      });
    } else if (activeFilter === 'brunch') {
      list = list.filter((d) => {
        const cat = categories.find((c) => c.id === d.categoryId);
        return cat?.name.toLowerCase().includes('pâtisserie') || cat?.name.toLowerCase().includes('brunch') || cat?.name.toLowerCase().includes('viennoiserie');
      });
    }
    return list;
  }, [dishes, searchQuery, activeFilter, categories]);

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

  function handleFilterClick(filter: string) {
    setActiveFilter(filter);
  }

  function getFilterLabel(key: string) {
    if (key === 'all') return `Tous (${totalDishes})`;
    if (key === 'cafe') return `Café & Chauds (${categories.filter(c => c.name.toLowerCase().includes('caf') || c.name.toLowerCase().includes('chaud')).reduce((s, c) => s + (categoryCounts[c.id] ?? 0), 0)})`;
    if (key === 'frais') return `Frais & Signature (${categories.filter(c => c.name.toLowerCase().includes('frais') || c.name.toLowerCase().includes('signature')).reduce((s, c) => s + (categoryCounts[c.id] ?? 0), 0)})`;
    if (key === 'brunch') return `Pâtisserie & Brunch (${categories.filter(c => c.name.toLowerCase().includes('pâtisserie') || c.name.toLowerCase().includes('brunch') || c.name.toLowerCase().includes('viennoiserie')).reduce((s, c) => s + (categoryCounts[c.id] ?? 0), 0)})`;
    return key;
  }

  return (
    <div className="flex flex-col w-full gap-6">

      {/* ═══ SECTION 1: HEADER & KPI CARDS ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-on-surface transition-all duration-200 shadow-sm" type="button">
            <span className="material-symbols-outlined text-lg text-secondary">file_download</span>
            <span className="text-sm font-medium">Export PDF Fiches</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-on-surface transition-all duration-200 shadow-sm" type="button">
            <span className="material-symbols-outlined text-lg text-secondary">insights</span>
            <span className="text-sm font-medium">Simulateur Inflation</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 shadow-md font-semibold"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span className="text-sm">+ Ajouter un Plat / Recette</span>
            <span className="px-1.5 py-0.5 rounded bg-primary-fixed/30 text-on-primary text-[10px] uppercase font-bold tracking-wide">Nouveau</span>
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

      {/* ═══ SECTION 2: BCG MATRIX ═══ */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-primary/10 text-primary material-symbols-outlined text-base">bubble_chart</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Matrice de Rentabilité Menu Engineering (BCG)</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Cartographie dynamique des {totalDishes} plats selon le volume de vente mensuel (Popularité) et la marge brute (%)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span> STARS
            </span>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> PLOWHORSES
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span> PUZZLES
            </span>
            <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error"></span> DOGS
            </span>
          </div>
        </div>

        {/* BCG Scatter Chart */}
        <div className="relative w-full h-80 bg-surface-container-low/60 rounded-xl overflow-hidden p-4">
          {/* Quadrant backgrounds */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="p-3 bg-primary-fixed/5 flex flex-col justify-start items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">PUZZLES • DILEMMES</span>
              <span className="text-[11px] text-outline">Marge &gt; 70% | Vol. &lt; 250</span>
            </div>
            <div className="p-3 bg-tertiary-fixed/10 flex flex-col justify-start items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">STARS • VEDETTES</span>
              <span className="text-[11px] text-tertiary/70">Marge &gt; 70% | Vol. &gt; 250</span>
            </div>
            <div className="p-3 bg-error-container/20 flex flex-col justify-end items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-error">DOGS • POIDS MORTS</span>
              <span className="text-[11px] text-outline">Marge &lt; 70% | Vol. &lt; 250</span>
            </div>
            <div className="p-3 bg-secondary-fixed/15 flex flex-col justify-end items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">PLOWHORSES • RENTIERS</span>
              <span className="text-[11px] text-outline">Marge &lt; 70% | Vol. &gt; 250</span>
            </div>
          </div>

          {/* Crosshairs */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/50 pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-outline-variant/50 pointer-events-none"></div>
          <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] text-outline px-1 bg-surface-container-low rounded">Moyenne Marge 70%</span>
          <span className="absolute left-1/2 bottom-2 -translate-x-1/2 text-[10px] text-outline px-1 bg-surface-container-low rounded">Seuil 250 Ventes</span>

          {/* Data points */}
          {dishes.slice(0, 12).map((dish, i) => {
            const margin = dish.marginPercent ?? 50;
            const orders = dish.orderItemCount;
            const yPos = Math.max(5, Math.min(90, 100 - margin));
            const xPos = Math.max(5, Math.min(95, (orders / Math.max(...dishes.map((d) => d.orderItemCount), 1)) * 90 + 5));
            const isStar = margin >= 70 && orders >= 250;
            const isPuzzle = margin >= 70 && orders < 250;
            const isPlowhorse = margin < 70 && orders >= 250;

            const sizeClass = i === 0 ? 'w-8 h-8' : i < 3 ? 'w-7 h-7' : 'w-6 h-6';
            const bgClass = isStar ? 'bg-tertiary text-on-tertiary' : isPuzzle ? 'bg-primary text-on-primary' : isPlowhorse ? 'bg-secondary text-on-secondary' : 'bg-error text-on-error';
            const icon = i % 3 === 0 ? 'local_cafe' : i % 3 === 1 ? 'bakery_dining' : 'restaurant_menu';

            return (
              <div
                key={dish.id}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ top: `${yPos}%`, left: `${xPos}%` }}
                onClick={() => setSelectedDishId(dish.id)}
              >
                <div className={`${sizeClass} rounded-full ${bgClass} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125 ${isStar ? 'animate-pulse' : ''}`}>
                  <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface p-2.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="text-xs font-bold text-inverse-primary">{dish.name}</span>
                  <span className="text-[11px] text-tertiary-fixed-dim">
                    Marge: {dish.marginPercent !== null ? `${dish.marginPercent}%` : 'N/A'} • {orders} ventes
                  </span>
                  <span className="text-[10px] text-inverse-on-surface/80">
                    Coût: {formatCost(dish.cost)} | Prix: {formatCost(dish.price)}
                  </span>
                </div>
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-on-surface font-semibold whitespace-nowrap bg-surface/80 px-1 rounded">
                  {dish.name.length > 15 ? dish.name.slice(0, 15) + '…' : dish.name}
                </span>
              </div>
            );
          })}
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
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'all' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => handleFilterClick('all')}
          >
            {getFilterLabel('all')}
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'cafe' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => handleFilterClick('cafe')}
          >
            {getFilterLabel('cafe')}
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'frais' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => handleFilterClick('frais')}
          >
            {getFilterLabel('frais')}
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'brunch' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => handleFilterClick('brunch')}
          >
            {getFilterLabel('brunch')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-bold flex items-center gap-1" type="button">
            <span className="w-2 h-2 rounded-full bg-error"></span> Rupture 86 ({ruptureCount})
          </button>
          <button className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-bold flex items-center gap-1" type="button">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span> Marge &lt; 60% ({lowMarginCount})
          </button>
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
