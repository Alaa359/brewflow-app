'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckIcon,
  Coffee,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShoppingBagIcon,
  Soup,
  Trash2Icon,
  UtensilsCrossed,
  Wine,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DishThumb } from '@/components/ui/dish-thumb';
import { submitTableOrder } from '@/actions/client-orders';
import { formatCost } from '@/lib/ingredients';

export type MenuDish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
};

export type MenuCategory = { id: string; name: string };

type CartLine = { dish: MenuDish; quantity: number };

function getCategoryIcon(categoryName?: string | null) {
  const n = categoryName?.toLowerCase().trim() ?? '';
  if (['boissons', 'drinks', 'beverages', 'boissons chaudes'].includes(n)) return <Coffee className="size-3.5" />;
  if (['plats', 'dishes'].includes(n)) return <Soup className="size-3.5" />;
  if (['apéritifs', 'aperitifs'].includes(n)) return <Wine className="size-3.5" />;
  return <UtensilsCrossed className="size-3.5" />;
}

function getCategoryEmoji(categoryName?: string | null) {
  const n = categoryName?.toLowerCase().trim() ?? '';
  const map: Record<string, string> = {
    boissons: '☕', drinks: '☕', beverages: '☕', 'boissons chaudes': '☕',
    'boissons froides': '🧊', dessertes: '🍰', desserts: '🍰',
    'pâtisserie': '🍰', patisserie: '🍰', 'entrées': '🍽️', entrees: '🍽️',
    plats: '🍲', dishes: '🍲', 'apéritifs': '🍷', aperitifs: '🍷',
    viennoiseries: '🥐', glaces: '🍦', salades: '🥗', sandwichs: '🥪',
  };
  return map[n] ?? '🍽️';
}

export function MenuClient({
  token,
  establishmentName,
  tableNumber,
  tableZone,
  categories,
  dishes,
}: {
  token: string;
  establishmentName: string;
  tableNumber: number;
  tableZone: string | null;
  categories: MenuCategory[];
  dishes: MenuDish[];
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sheetDish, setSheetDish] = useState<MenuDish | null>(null);
  const [sheetQty, setSheetQty] = useState(1);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Menu');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitTableOrder, undefined);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart([]);
      setConfirmed(true);
    }
  }, [state]);

  const cartCount = cart.reduce((a, l) => a + l.quantity, 0);
  const cartTotal = cart.reduce((a, l) => a + l.dish.price * l.quantity, 0);

  const activeDishes = useMemo(() => {
    let list = dishes.filter((d) => d.categoryId === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dishes, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.id] = dishes.filter((d) => d.categoryId === cat.id).length;
    }
    return counts;
  }, [categories, dishes]);

  const addDish = useCallback(
    (dish: MenuDish, qty = 1) => {
      setConfirmed(false);
      setCart((cur) => {
        const idx = cur.findIndex((l) => l.dish.id === dish.id);
        if (idx === -1) return [...cur, { dish, quantity: qty }];
        const quantity = Math.min(cur[idx].quantity + qty, 99);
        return cur.map((l, i) => (i === idx ? { ...l, quantity } : l));
      });
    },
    []
  );

  const bump = useCallback((index: number, delta: number) => {
    setCart((cur) =>
      cur
        .map((l, i) => (i === index ? { ...l, quantity: Math.min(Math.max(l.quantity + delta, 0), 99) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeLine = useCallback((index: number) => {
    setCart((cur) => cur.filter((_, i) => i !== index));
  }, []);

  const openSheet = useCallback((dish: MenuDish) => {
    setSheetDish(dish);
    setSheetQty(1);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetDish(null);
    setSheetQty(1);
  }, []);

  const confirmSheet = useCallback(() => {
    if (sheetDish) {
      addDish(sheetDish, sheetQty);
      closeSheet();
    }
  }, [sheetDish, sheetQty, addDish, closeSheet]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (sheetDish) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sheetDish]);

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f1]">
      {/* ═══ HEADER ÉDITORIAL ═══ */}
      <header className="sticky top-0 z-30 border-b border-[#eedecf] bg-[#fff8f1]/95 px-4 pt-3 pb-2.5 shadow-[0_2px_12px_rgba(43,30,24,0.03)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#C88242] to-[#A05A20] text-xs font-bold text-white shadow-sm ring-1 ring-[#C88242]/30">
              {establishmentName.charAt(0)}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-[family-name:var(--font-sora)] text-[17px] font-extrabold tracking-tight text-[#2B1E18]">
                Brew<span className="text-[#C88242]">Flow</span>
              </span>
              <span className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                {establishmentName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#f0e2d5] p-0.5 text-[11px] font-semibold">
            {(['FR', 'EN', 'AR'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`rounded-full px-2.5 py-0.5 transition ${
                  locale.toUpperCase().startsWith(lang)
                    ? 'bg-[#2B1E18] text-[#FFF8F1] shadow-sm'
                    : 'text-[#2B1E18]/70 hover:text-[#2B1E18]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        {/* Badge table */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#ebd6c3] bg-[#F5ECE3]/90 px-3 py-1.5">
          <span className="text-xs font-medium text-[#2B1E18]">
            {t('table', { number: tableNumber })}
            {tableZone ? ` · ${tableZone}` : ''}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2f6a44]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f6a44] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#2f6a44]" />
            </span>
            <span>En Direct</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ═══ HERO ÉDITORIAL ═══ */}
        <section className="px-4 pt-4 pb-2">
          <div className="menu-editorial-hero relative overflow-hidden rounded-2xl border border-[#e8d5c3] p-4 shadow-poster">
            <div className="hero-glow" />
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#A05A20]">
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="size-4 text-[#C88242]" />
                {t('subtitle')}
              </span>
              <span className="rounded-full border border-[#C88242]/30 bg-[#C88242]/15 px-2 py-0.5 text-[9px] text-[#A05A20]">
                {t('table', { number: tableNumber })}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-sora)] text-xl font-extrabold leading-tight tracking-tight text-[#2B1E18]">
              {t('title')}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-[#2B1E18]/75">
              {t('subtitle')}
            </p>
            {/* Search */}
            <div className="relative mt-3">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2B1E18]/40" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', { defaultValue: 'Rechercher un plat...' })}
                className="w-full rounded-xl border border-[#dfcab8] bg-[#fff8f1]/90 py-2 pl-9 pr-4 text-xs shadow-sm placeholder:text-[#2B1E18]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C88242]/40"
              />
            </div>
          </div>
        </section>

        {/* ═══ CATEGORY PILLS ═══ */}
        {categories.length > 0 && !searchQuery && (
          <nav className="sticky top-[108px] z-20 border-y border-[#ebd8c7] bg-[#fff8f1]/95 py-2 backdrop-blur-md">
            <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                    cat.id === activeCategory
                      ? 'bg-[#2B1E18] text-[#FFF8F1]'
                      : 'border border-[#ebd8c7] bg-white text-[#2B1E18] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <span className={cat.id === activeCategory ? 'text-amber-400' : 'text-[#C88242]'}>
                    {getCategoryIcon(cat.name)}
                  </span>
                  {cat.name}
                  <span className={`ml-0.5 text-[10px] ${cat.id === activeCategory ? 'text-white/60' : 'text-[#2B1E18]/40'}`}>
                    {categoryCounts[cat.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* ═══ PRODUCT CATALOG ═══ */}
        <section className="px-4 py-3.5">
          {/* Section header */}
          {!searchQuery && categories.length > 0 && (
            <div className="mb-3 flex items-center justify-between border-b border-[#eddcca] pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-widest text-[#2B1E18]">
                  {categories.find((c) => c.id === activeCategory)?.name ?? ''}
                </span>
                <span className="size-1.5 rounded-full bg-[#C88242]" />
              </div>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#2B1E18]/60">
                {activeDishes.length} {activeDishes.length === 1 ? 'création' : 'créations'}
              </span>
            </div>
          )}

          {searchQuery && (
            <div className="mb-3 flex items-center justify-between border-b border-[#eddcca] pb-1.5">
              <div className="flex items-center gap-1.5">
                <SearchIcon className="size-3.5 text-[#C88242]" />
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-widest text-[#2B1E18]">
                  {t('searchResults', { defaultValue: 'Résultats' })}
                </span>
              </div>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#2B1E18]/60">
                {activeDishes.length}
              </span>
            </div>
          )}

          {/* Confirmed banner */}
          {confirmed && (
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-[#2f6a44]/30 bg-[#2f6a44]/10 px-4 py-3 text-sm text-[#2f6a44] anim-fade-up">
              <CheckIcon className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{t('confirmed.title')}</span>
                <span>{t('confirmed.description')}</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {activeDishes.length === 0 && (
            <p className="rounded-xl border border-[#ecdccb] px-3 py-8 text-center text-sm text-[#8C7A6B]">
              {searchQuery ? t('noResults', { defaultValue: 'Aucun résultat' }) : t('noDishes')}
            </p>
          )}

          {/* Product cards */}
          <div className="space-y-4">
            {activeDishes.map((dish, i) => (
              <article
                key={dish.id}
                className="overflow-hidden rounded-2xl border border-[#ecdccb] bg-white shadow-poster transition hover:border-[#C88242]/50 anim-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-[#efe5d9]">
                  <DishThumb
                    src={dish.imageUrl}
                    alt={dish.name}
                    variant="poster"
                    categoryName={categories.find((c) => c.id === dish.categoryId)?.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Badges */}
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    <span className="rounded-md bg-[#2B1E18]/90 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-wider text-[#FFF8F1] shadow-sm backdrop-blur-sm">
                      {categories.find((c) => c.id === dish.categoryId)?.name ?? ''}
                    </span>
                  </div>
                  {/* Price badge */}
                  <div className="absolute right-2.5 top-2.5">
                    <span className="rounded-md bg-[#C88242]/90 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                      {formatCost(dish.price, locale, tCommon('currency'))}
                    </span>
                  </div>
                  {/* Bottom info */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <h2 className="text-base font-bold tracking-tight drop-shadow-sm">{dish.name}</h2>
                      {dish.description && (
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-white/80">{dish.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[#ecdccb] px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {getCategoryEmoji(categories.find((c) => c.id === dish.categoryId)?.name) && (
                      <span className="text-xs">
                        {getCategoryEmoji(categories.find((c) => c.id === dish.categoryId)?.name)}
                      </span>
                    )}
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[#8C7A6B]">
                      {formatCost(dish.price, locale, tCommon('currency'))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-[#ebd8c7] px-3 text-[11px] font-semibold"
                      onClick={() => openSheet(dish)}
                    >
                      {t('cart.customize', { defaultValue: 'Choisir' })}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-full bg-[#C88242] px-3 text-[11px] font-bold text-white hover:bg-[#A05A20]"
                      onClick={() => addDish(dish)}
                    >
                      <PlusIcon className="mr-0.5 size-3" />
                      {t('cart.add', { defaultValue: 'Ajouter' })}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ═══ BOTTOM SHEET PERSONNALISATION ═══ */}
      <div
        ref={backdropRef}
        className={`menu-sheet-backdrop fixed inset-0 z-50 bg-[#2B1E18]/70 backdrop-blur-sm ${
          sheetDish ? 'opacity-100' : 'pointer-events-none hidden opacity-0'
        }`}
        onClick={closeSheet}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className={`menu-sheet fixed bottom-0 left-0 right-0 z-50 flex justify-center ${
          sheetDish ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] border-t border-[#eedecf] bg-[#FFF8F1] p-5 shadow-2xl">
          {/* Handle */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#dfcfc1]" />
          {sheetDish && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#ebd8c8] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#C88242]/15 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase text-[#A05A20]">
                      {categories.find((c) => c.id === sheetDish.categoryId)?.name ?? ''}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[#2B1E18]">{sheetDish.name}</h3>
                  {sheetDish.description && (
                    <p className="mt-0.5 text-xs text-[#2B1E18]/70">{sheetDish.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="rounded-full bg-[#F5ECE3] p-1.5 text-[#2B1E18]/60 transition hover:text-[#2B1E18]"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              {/* Quantity selector */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold text-[#2B1E18]">
                  {t('cart.quantity', { defaultValue: 'Quantité' })}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full border-[#ebd8c7]"
                    onClick={() => setSheetQty((q) => Math.max(1, q - 1))}
                  >
                    <MinusIcon className="size-4" />
                  </Button>
                  <span className="w-12 text-center text-xl font-bold tabular-nums text-[#2B1E18]">
                    {sheetQty}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full border-[#ebd8c7]"
                    onClick={() => setSheetQty((q) => Math.min(99, q + 1))}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between border-t border-[#ebd8c8] pt-3">
                <span className="text-xs font-bold text-[#2B1E18]">{t('cart.total')}</span>
                <span className="text-lg font-bold text-[#2B1E18] tabular-nums">
                  {formatCost(sheetDish.price * sheetQty, locale, tCommon('currency'))}
                </span>
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={confirmSheet}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C88242] py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#A05A20] active:scale-[0.98]"
              >
                <span>{t('cart.addToOrder', { defaultValue: 'Ajouter à la Commande' })}</span>
                <span>•</span>
                <span>{formatCost(sheetDish.price * sheetQty, locale, tCommon('currency'))}</span>
                <CheckIcon className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══ PANIER FLOTTANT (DOCK) ═══ */}
      {cartCount > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-4 pt-2">
          <div className="flex w-full max-w-5xl flex-col gap-2.5 rounded-3xl border border-[#3e2c24] bg-[#2B1E18] p-3.5 text-[#FFF8F1] shadow-float-dock">
            {/* Cart summary */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 animate-pulse rounded-full bg-[#C88242]" />
                <div>
                  <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                    {t('cart.title')}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <span>{cartCount} {cartCount === 1 ? 'article' : 'articles'}</span>
                    <span className="text-[#C88242]">•</span>
                    <span className="text-[#C88242]">
                      {formatCost(cartTotal, locale, tCommon('currency'))}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('cart-lines');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-xl bg-white/10 px-2.5 py-1 text-[10px] font-bold transition hover:bg-white/20"
              >
                {t('table', { number: tableNumber })}
              </button>
            </div>

            {/* Cart lines (expandable) */}
            <div id="cart-lines" className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {cart.map((line, idx) => (
                <div key={line.dish.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{line.dish.name}</p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-white/60">
                      {formatCost(line.dish.price, locale, tCommon('currency'))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => bump(idx, -1)}
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <MinusIcon className="size-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => bump(idx, 1)}
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <PlusIcon className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="flex size-6 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-red-400"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <form action={formAction}>
              <input type="hidden" name="token" value={token} />
              <input
                type="hidden"
                name="items"
                value={JSON.stringify(cart.map((l) => ({ dishId: l.dish.id, quantity: l.quantity })))}
              />
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-between rounded-2xl bg-[#C88242] px-4 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#A05A20] active:scale-[0.98] disabled:opacity-50"
              >
                <span className="flex items-center gap-2 font-[family-name:var(--font-sora)] text-sm tracking-wide">
                  <ShoppingBagIcon className="size-5" />
                  {t('cart.submit')} (Table {tableNumber})
                </span>
                <span className="text-[18px]">→</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-white/70">
                <span className="text-[13px] text-emerald-400">⚡</span>
                <span>{t('cart.instant', { defaultValue: 'Transmis instantanément au barista' })}</span>
              </div>
            </form>

            {state?.errors?.form?.map((e) => (
              <p key={e} className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">{e}</p>
            ))}
            {state?.errors?.items?.map((e) => (
              <p key={e} className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">{e}</p>
            ))}
          </div>
        </footer>
      )}

      {/* Bottom spacer for floating cart */}
      {cartCount > 0 && <div className="h-24" />}
    </div>
  );
}
