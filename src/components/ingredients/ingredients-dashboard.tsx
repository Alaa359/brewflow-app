'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatCost } from '@/lib/ingredients';

export type IngredientRow = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  imageUrl: string | null;
  recipeCount: number;
};

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  L: 'L',
  PIECE: 'pcs',
};

const CATEGORY_SUGGESTIONS = [
  { label: 'Cafés de Spécialité', icon: 'local_cafe', match: ['caf', 'coffee'] },
  { label: 'Produits Laitiers', icon: 'water_drop', match: ['lait', 'milk', 'beurre', 'crème', 'cream'] },
  { label: 'Farines & Pâtisserie', icon: 'bakery_dining', match: ['farine', 'sucre', 'pâte', 'chocolat', 'pistache'] },
  { label: 'Sirops & Épicerie', icon: 'water', match: ['sirop', 'sauce', 'épice', 'huile'] },
  { label: 'Packaging', icon: 'inventory_2', match: ['gobelet', 'packaging', 'tasse', 'sachet', 'nappe'] },
];

function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const cat of CATEGORY_SUGGESTIONS) {
    if (cat.match.some((m) => lower.includes(m))) return cat.label;
  }
  return 'Autres';
}

function guessIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const cat of CATEGORY_SUGGESTIONS) {
    if (cat.match.some((m) => lower.includes(m))) return cat.icon;
  }
  return 'inventory_2';
}

export function IngredientsDashboard({
  ingredients,
}: {
  ingredients: IngredientRow[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  const totalIngredients = ingredients.length;
  const ruptureCount = ingredients.filter((i) => i.currentStock <= 0).length;
  const lowCount = ingredients.filter((i) => i.currentStock > 0 && i.currentStock < i.minThreshold).length;
  const optimalCount = totalIngredients - ruptureCount - lowCount;
  const totalValue = ingredients.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    ingredients.forEach((i) => {
      const cat = guessCategory(i.name);
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.unit.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'rupture') {
      list = list.filter((i) => i.currentStock <= 0);
    } else if (statusFilter === 'low') {
      list = list.filter((i) => i.currentStock > 0 && i.currentStock < i.minThreshold);
    } else if (statusFilter === 'optimal') {
      list = list.filter((i) => i.currentStock >= i.minThreshold);
    }
    if (categoryFilter !== 'all') {
      list = list.filter((i) => guessCategory(i.name) === categoryFilter);
    }
    return list;
  }, [ingredients, searchQuery, statusFilter, categoryFilter]);

  function getStatus(ing: IngredientRow) {
    if (ing.currentStock <= 0) return { label: 'Rupture', color: 'bg-error-container text-on-error-container', barColor: 'bg-error' };
    if (ing.currentStock < ing.minThreshold) return { label: 'Stock Faible', color: 'bg-primary-fixed text-on-primary-fixed-variant', barColor: 'bg-primary' };
    return { label: 'Optimal', color: 'bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant', barColor: 'bg-tertiary' };
  }

  function getStockPct(ing: IngredientRow) {
    const max = Math.max(ing.minThreshold * 3, ing.currentStock, 1);
    return Math.min((ing.currentStock / max) * 100, 100);
  }

  return (
    <div className="flex flex-col w-full gap-5">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-5 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Gestion des Stocks &amp; Inventaire</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container text-[10px] font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              SYNCHRO DIRECTE
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold">{totalIngredients} Réf.</span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-xl">Saisie des mouvements de stock, pesée au gramme, conformité sanitaire et commandes fournisseurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-md hover:bg-primary-container hover:shadow-lg transition-all" type="button" onClick={() => setAddOpen(true)}>
            <span className="material-symbols-outlined text-lg">add_circle</span>
            + Entrée de Stock
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-semibold shadow-sm hover:bg-surface-container-highest hover:shadow-md transition-all" type="button">
            <span className="material-symbols-outlined text-lg text-primary">barcode_scanner</span>
            Inventaire / Scan Rapide
          </button>
        </div>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 px-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant mr-1">Filtre État :</span>
          <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-surface-container-highest text-on-surface' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} onClick={() => setStatusFilter('all')} type="button">
            Tous ({totalIngredients})
          </button>
          <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'rupture' ? 'bg-error-container text-error' : 'bg-error-container/40 text-error hover:bg-error-container/60'}`} onClick={() => setStatusFilter('rupture')} type="button">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            Ruptures ({ruptureCount})
          </button>
          <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'low' ? 'bg-primary-container text-primary' : 'bg-primary-fixed text-on-primary-fixed-variant hover:opacity-90'}`} onClick={() => setStatusFilter('low')} type="button">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Stock Faible ({lowCount})
          </button>
          <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${statusFilter === 'optimal' ? 'bg-tertiary-fixed/40 text-tertiary' : 'bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant hover:opacity-90'}`} onClick={() => setStatusFilter('optimal')} type="button">
            Optimal ({optimalCount})
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
          <span>Valeur en stock: <strong className="text-on-surface font-bold">{formatCost(totalValue)}</strong></span>
          <span className="text-outline-variant">|</span>
          <span className="text-tertiary flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            PMP FIFO conforme
          </span>
        </div>
      </div>

      {/* ═══ CATEGORY PILLS ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} onClick={() => setCategoryFilter('all')} type="button">
          Tous les rayons
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
            type="button"
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Card */}
        <div className="lg:col-span-8 flex flex-col gap-3 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg pointer-events-none">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="Rechercher ingrédient, code..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container/80 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Ingrédient</th>
                  <th className="py-2.5 px-2">Catégorie</th>
                  <th className="py-2.5 px-3">Stock Actuel</th>
                  <th className="py-2.5 px-2">Seuil Min.</th>
                  <th className="py-2.5 px-2">PMP / Unité</th>
                  <th className="py-2.5 px-2">Valeur</th>
                  <th className="py-2.5 px-2">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-sm text-on-surface">
                {filteredIngredients.map((ing) => {
                  const status = getStatus(ing);
                  const pct = getStockPct(ing);
                  const cat = guessCategory(ing.name);
                  const icon = guessIcon(ing.name);
                  const unitLabel = UNIT_LABELS[ing.unit] ?? ing.unit;
                  const value = ing.currentStock * ing.costPerUnit;
                  return (
                    <tr key={ing.id} className={`hover:bg-surface-container-low/50 transition-colors ${ing.currentStock <= 0 ? 'bg-error-container/10' : ''}`}>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {ing.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt={ing.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm" src={ing.imageUrl} />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="material-symbols-outlined text-outline text-lg">{icon}</span>
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-on-surface truncate">{ing.name}</span>
                            <span className="text-[10px] text-primary font-bold">#{ing.id.slice(0, 10).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-on-surface-variant text-[11px]">{cat}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className={`font-bold ${ing.currentStock <= 0 ? 'text-error' : ing.currentStock < ing.minThreshold ? 'text-primary' : 'text-on-surface'}`}>{ing.currentStock.toFixed(1)} {unitLabel}</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                            <div className={`${status.barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className={`text-[10px] font-bold ${ing.currentStock <= 0 ? 'text-error' : ing.currentStock < ing.minThreshold ? 'text-primary' : 'text-tertiary'}`}>
                            {pct.toFixed(0)}% {ing.currentStock <= 0 ? '(Rupture)' : ing.currentStock < ing.minThreshold ? '(Faible)' : 'Optimal'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-on-surface-variant">{ing.minThreshold.toFixed(1)} {unitLabel}</td>
                      <td className="py-2 px-2 text-xs font-bold">{formatCost(ing.costPerUnit)}<span className="text-[10px] text-on-surface-variant block">/ {unitLabel}</span></td>
                      <td className="py-2 px-2 text-xs font-bold text-on-surface">{formatCost(value)}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button className="p-1 rounded bg-surface-container hover:bg-surface-variant text-on-surface transition-colors" title="Ajuster pesée" type="button">
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                          </button>
                          {ing.currentStock <= 0 && (
                            <button className="px-2 py-1 rounded bg-primary text-on-primary text-[11px] font-medium flex items-center gap-1 shadow-sm hover:bg-primary-container transition-all" title="Commander d'urgence" type="button">
                              <span className="material-symbols-outlined text-[14px]">bolt</span>
                              Commander
                            </button>
                          )}
                          {ing.currentStock > 0 && ing.currentStock < ing.minThreshold && (
                            <button className="p-1 rounded bg-surface-container hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors" title="Commander" type="button">
                              <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredIngredients.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-outline text-3xl mb-2 block">search_off</span>
                      Aucun ingrédient trouvé pour ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>Affichage de {filteredIngredients.length} sur {totalIngredients} références</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* EDI Bons */}
          <div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/40">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">inventory</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Bons de Commande</h3>
              </div>
              {ruptureCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase">{ruptureCount} Urgent{ruptureCount > 1 ? 's' : ''}</span>
              )}
            </div>
            {ingredients
              .filter((i) => i.currentStock <= 0 || i.currentStock < i.minThreshold)
              .slice(0, 3)
              .map((ing) => (
                <div key={ing.id} className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-on-surface">{ing.name}</span>
                      <span className="text-[11px] text-on-surface-variant">Réappro {guessCategory(ing.name)}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{formatCost(ing.minThreshold * 2 * ing.costPerUnit)}</span>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-primary text-on-primary text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-container transition-all" type="button">
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Valider &amp; Commander
                  </button>
                </div>
              ))}
            {ruptureCount === 0 && lowCount === 0 && (
              <div className="p-3 rounded-lg bg-tertiary-fixed-dim/20 text-center text-sm text-tertiary font-medium">
                <span className="material-symbols-outlined text-lg block mb-1">check_circle</span>
                Tous les stocks sont optimaux
              </div>
            )}
          </div>

          {/* Journal des Mouvements */}
          <div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/40">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-lg">receipt_long</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Derniers Mouvements</h3>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {ingredients.slice(0, 4).map((ing) => {
                const status = getStatus(ing);
                return (
                  <div key={ing.id} className="flex items-start justify-between p-2 rounded-lg bg-surface-container-low">
                    <div className="flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[18px] mt-0.5 ${ing.currentStock <= 0 ? 'text-error' : ing.currentStock < ing.minThreshold ? 'text-primary' : 'text-tertiary'}`}>
                        {ing.currentStock <= 0 ? 'report_problem' : ing.currentStock < ing.minThreshold ? 'trending_down' : 'arrow_circle_down'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{ing.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{status.label} • {ing.currentStock.toFixed(1)} {UNIT_LABELS[ing.unit] ?? ing.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-[11px] ${ing.currentStock <= 0 ? 'text-error' : 'text-on-surface'}`}>{ing.currentStock.toFixed(1)} {UNIT_LABELS[ing.unit] ?? ing.unit}</span>
                      <span className="block text-[10px] text-on-surface-variant">{ing.recipeCount} recette{ing.recipeCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traçabilité */}
          <div className="p-4 bg-surface-container-high rounded-xl flex items-start gap-3 shadow-sm">
            <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">verified_user</span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-on-surface">Traçabilité Sanitaire</span>
              <p className="text-xs text-on-surface-variant">Chaque mouvement est horodaté et rattaché à son opérateur pour conformité réglementaire.</p>
              <button className="text-[10px] font-bold uppercase text-primary mt-1 flex items-center gap-1 hover:underline" type="button">
                <span>Télécharger le registre</span>
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODAL: ADD STOCK ═══ */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Entrée de Stock</h3>
                  <p className="text-xs text-on-surface-variant">Enregistrement d&apos;une réception de marchandise.</p>
                </div>
              </div>
              <button className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container" onClick={() => setAddOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-outline">Ingrédient</label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} (Stock: {i.currentStock.toFixed(1)} {UNIT_LABELS[i.unit] ?? i.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Quantité Reçue</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="ex: 10.0" type="number" step="0.1" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Fournisseur</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="ex: Mocafé Import" type="text" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Date de Réception</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" type="date" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">N° Bon de Livraison</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="ex: BL-2024-999" type="text" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm" onClick={() => setAddOpen(false)} type="button">Annuler</button>
              <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-medium shadow-sm" onClick={() => { setAddOpen(false); router.refresh(); }} type="button">Enregistrer l&apos;entrée</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
