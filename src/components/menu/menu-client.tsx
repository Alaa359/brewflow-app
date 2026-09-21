'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircleIcon,
  Coffee,
  IceCreamCone,
  MinusIcon,
  PlusIcon,
  Sandwich,
  SearchIcon,
  Soup,
  Trash2Icon,
  UtensilsCrossed,
  Wine,
  XIcon,
} from 'lucide-react';
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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  boissons: <Coffee className="text-amber-400 size-[14px]" />,
  drinks: <Coffee className="text-amber-400 size-[14px]" />,
  beverages: <Coffee className="text-amber-400 size-[14px]" />,
  'boissons chaudes': <Coffee className="text-amber-400 size-[14px]" />,
  'boissons froides': <IceCreamCone className="text-sky-600 size-[14px]" />,
  desserts: <IceCreamCone className="text-caramel size-[14px]" />,
  dessertes: <IceCreamCone className="text-caramel size-[14px]" />,
  'pâtisserie': <IceCreamCone className="text-caramel size-[14px]" />,
  patisserie: <IceCreamCone className="text-caramel size-[14px]" />,
  plats: <Soup className="text-amber-600 size-[14px]" />,
  dishes: <Soup className="text-amber-600 size-[14px]" />,
  'entrées': <Sandwich className="text-amber-600 size-[14px]" />,
  entrees: <Sandwich className="text-amber-600 size-[14px]" />,
  'apéritifs': <Wine className="text-sky-600 size-[14px]" />,
  aperitifs: <Wine className="text-sky-600 size-[14px]" />,
  viennoiseries: <Coffee className="text-amber-400 size-[14px]" />,
  salades: <Soup className="text-tertiary size-[14px]" />,
  sandwichs: <Sandwich className="text-amber-600 size-[14px]" />,
};

function getCategoryIcon(name?: string | null) {
  return CATEGORY_ICONS[name?.toLowerCase().trim() ?? ''] ?? <UtensilsCrossed className="text-caramel size-[14px]" />;
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDish, setSheetDish] = useState<MenuDish | null>(null);
  const t = useTranslations('Menu');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitTableOrder, undefined);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (state?.success) {
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

  const addDish = useCallback((dish: MenuDish, qty = 1) => {
    setConfirmed(false);
    setCart((cur) => {
      const idx = cur.findIndex((l) => l.dish.id === dish.id);
      if (idx === -1) return [...cur, { dish, quantity: qty }];
      return cur.map((l, i) => (i === idx ? { ...l, quantity: Math.min(l.quantity + qty, 99) } : l));
    });
  }, []);

  const bump = useCallback((index: number, delta: number) => {
    setCart((cur) =>
      cur.map((l, i) => (i === index ? { ...l, quantity: Math.min(Math.max(l.quantity + delta, 0), 99) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeLine = useCallback((index: number) => {
    setCart((cur) => cur.filter((_, i) => i !== index));
  }, []);

  const openSheet = useCallback((dish: MenuDish) => {
    setSheetDish(dish);
    setSheetOpen(true);
    document.body.classList.add('overflow-hidden');
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setSheetDish(null);
    document.body.classList.remove('overflow-hidden');
  }, []);

  const formatPrice = useCallback(
    (price: number) => {
      const formatted = formatCost(price, locale, tCommon('currency'));
      const parts = formatted.split(' ');
      if (parts.length >= 2) {
        return { value: parts.slice(0, -1).join(' '), unit: parts[parts.length - 1] };
      }
      return { value: formatted, unit: '' };
    },
    [locale, tCommon]
  );

  return (
    <>
      {/* Full-Screen Container */}
      <div className="relative flex min-h-screen w-full flex-col bg-warmCream pb-28">

        {/* 1. Header Éditorial */}
        <header
          className="sticky top-0 z-30 border-b border-[#eedecf] bg-warmCream/95 px-4 pb-2.5 pt-3 shadow-[0_2px_12px_rgba(43,30,24,0.03)] backdrop-blur-md sm:px-6 lg:px-8"
        >
          {/* Top branding & Language */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-caramel to-caramelDark text-xs font-bold text-white shadow-sm ring-1 ring-caramel/30">
                {establishmentName.charAt(0)}
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-sans text-[17px] font-extrabold tracking-tight text-espresso">
                  Brew<span className="text-caramel">Flow</span>
                </span>
                <span className="font-mono mt-0.5 text-[8px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                  {establishmentName}
                </span>
              </div>
            </div>
            {/* Language Pill Switcher */}
            <nav aria-label="Langues" className="flex items-center rounded-full bg-[#f0e2d5] p-0.5 text-[11px] font-mono font-semibold">
              {(['FR', 'EN', 'AR'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`px-2.5 py-0.5 rounded-full transition ${
                    locale.toUpperCase().startsWith(lang)
                      ? 'bg-espresso text-warmCream shadow-sm'
                      : 'text-espresso/70 hover:text-espresso'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </nav>
          </div>
          {/* Badge Table & Direct Service Status */}
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#ebd6c3] bg-softSand/90 px-3 py-1.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs font-medium text-espresso">
                {t('table', { number: tableNumber })}
                {tableZone ? ` · ${tableZone}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-tertiary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-tertiary" />
              </span>
              <span>En Direct</span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Editorial Hero Poster Section */}
          <section className="px-4 pb-2 pt-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-[#e8d5c3] bg-gradient-to-br from-[#f8ebe0] via-[#f5e3d2] to-[#ecdcce] p-4 shadow-poster">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-caramel/10 blur-2xl" />
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-caramelDark">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="text-caramel size-[15px]" />
                  {t('subtitle')}
                </span>
                <span className="rounded-full border border-caramel/30 bg-caramel/15 px-2 py-0.5 text-[9px] font-bold text-caramelDark">
                  Édition Printemps 2025
                </span>
              </div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-espresso">
                {t('title')}
              </h1>
              <p className="font-body mt-1 text-xs leading-relaxed text-espresso/75">
                {t('subtitle')}
              </p>
              {/* Search */}
              <div className="relative mt-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40 size-[18px]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder', { defaultValue: 'Rechercher café de terroir, croissant, bowl bio...' })}
                  className="font-body w-full rounded-xl border border-[#dfcab8] bg-[#fff8f1]/90 py-2 pl-9 pr-4 text-xs shadow-sm placeholder:text-espresso/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-caramel/40"
                />
              </div>
            </div>
          </section>

          {/* 2. Category Pills */}
          {categories.length > 0 && !searchQuery && (
            <nav
              aria-label="Catégories du menu"
              className="sticky top-[108px] z-20 border-y border-[#ebd8c7] bg-warmCream/95 py-2 backdrop-blur-md"
            >
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 scroll-smooth sm:px-6 lg:px-8">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                      cat.id === activeCategory
                        ? 'bg-espresso text-warmCream'
                        : 'border border-[#ebd8c7] bg-white text-espresso hover:bg-softSand'
                    }`}
                  >
                    {getCategoryIcon(cat.name)}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* 3. Product Catalog */}
          <section aria-label="Sélection Signature" className="space-y-4 px-4 py-3.5 sm:px-6 lg:px-8">
            {/* Confirmed banner */}
            {confirmed && (
              <div className="flex items-start gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm text-tertiary anim-fade-up">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{t('confirmed.title')}</span>
                  <span>{t('confirmed.description')}</span>
                </div>
              </div>
            )}

            {/* Search results header */}
            {searchQuery && (
              <div className="flex items-center justify-between border-b border-[#eddcca] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <SearchIcon className="text-caramel size-3.5" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-espresso">
                    {t('searchResults', { defaultValue: 'Résultats' })}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-espresso/60">
                  {activeDishes.length}
                </span>
              </div>
            )}

            {/* Category section header */}
            {!searchQuery && categories.length > 0 && (
              <div className="flex items-center justify-between border-b border-[#eddcca] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-espresso">
                    {categories.find((c) => c.id === activeCategory)?.name ?? ''}
                  </span>
                  <span className="size-1.5 rounded-full bg-caramel" />
                </div>
                <span className="font-mono text-[11px] text-espresso/60">
                  {activeDishes.length} {activeDishes.length === 1 ? 'création' : 'créations'}
                </span>
              </div>
            )}

            {/* Empty state */}
            {activeDishes.length === 0 && (
              <p className="rounded-xl border border-[#ecdccb] px-3 py-8 text-center text-sm text-[#8C7A6B]">
                {searchQuery ? t('noResults', { defaultValue: 'Aucun résultat' }) : t('noDishes')}
              </p>
            )}

            {/* Product cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeDishes.map((dish, i) => {
              const priceParts = formatPrice(dish.price);
              const hasImage = !!dish.imageUrl;
              const categoryName = categories.find((c) => c.id === dish.categoryId)?.name ?? '';

              if (hasImage) {
                // Image card style — Flat White / Cold Brew pattern
                return (
                  <article
                    key={dish.id}
                    className="overflow-hidden rounded-2xl border border-[#ecdccb] bg-cardBg shadow-poster transition hover:border-caramel/50 anim-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-[#efe5d9]">
                      <DishThumb
                        src={dish.imageUrl}
                        alt={dish.name}
                        variant="poster"
                        categoryName={categoryName}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {/* Badges top-left */}
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                        <span className="rounded-md bg-espresso/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-warmCream shadow-sm backdrop-blur-sm">
                          {categoryName}
                        </span>
                      </div>
                      {/* Price bottom-right on image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-caramelSoft/90">
                            {categoryName}
                          </span>
                          <h2 className="text-base font-bold tracking-tight text-white drop-shadow-sm">
                            {dish.name}
                          </h2>
                        </div>
                        <div className="shadow font-mono text-base font-bold bg-caramel/90 rounded-lg px-2.5 py-1 text-white backdrop-blur-sm">
                          {priceParts.value} <span className="font-sans text-[11px]">{priceParts.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 p-3.5">
                      {dish.description && (
                        <div className="space-y-1.5 rounded-xl border border-[#f0e1d2] bg-[#faf3ec] p-2.5 text-xs text-espresso/80">
                          <p className="font-body text-xs leading-relaxed text-espresso/85">
                            <strong className="font-semibold text-espresso">{dish.name}</strong>, {dish.description}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-tertiary">
                          <CheckCircleIcon className="size-[14px]" />
                          {t('cart.customize', { defaultValue: 'Personnalisable' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => openSheet(dish)}
                          className="active:scale-95 inline-flex items-center gap-1.5 rounded-xl bg-caramel px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-caramelDark"
                        >
                          <span>{t('cart.customize', { defaultValue: 'Personnaliser' })}</span>
                          <span className="font-mono text-sm leading-none">+</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }

              // Flat card style — Avocado Toast / Granola / Slow Bar pattern
              return (
                <article
                  key={dish.id}
                  className="flex flex-col gap-2.5 rounded-2xl border border-[#ecdccb] bg-cardBg p-3.5 shadow-poster transition hover:border-caramel/50 anim-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-caramelDark">
                        <span className="rounded bg-caramel/15 px-1.5 py-0.5 font-bold text-caramelDark">
                          {categoryName}
                        </span>
                      </div>
                      <h2 className="text-[14px] font-bold leading-snug text-espresso">{dish.name}</h2>
                      {dish.description && (
                        <p className="font-body mt-1 text-xs leading-relaxed text-espresso/75">
                          {dish.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-lg border border-[#ebd8c8] bg-softSand px-2.5 py-1 font-mono text-[14px] font-bold text-espresso">
                      {priceParts.value} <span className="text-[10px]">{priceParts.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#f0e1d2] pt-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-espresso/70">
                      <span className="rounded border border-[#ebd8c8] bg-[#fcf5ed] px-2 py-0.5">
                        {categoryName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addDish(dish)}
                      className="active:scale-95 inline-flex items-center gap-1.5 rounded-xl bg-caramel px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-caramelDark"
                    >
                      <span>{t('cart.add', { defaultValue: 'Ajouter' })}</span>
                      <span className="font-mono text-xs leading-none">+</span>
                    </button>
                  </div>
                </article>
              );
            })}
            </div>
          </section>
        </main>

        {/* 5. Panier flottant — Sticky Bottom Bar */}
        {cartCount > 0 && (
          <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-4 pt-2">
            <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-2.5 rounded-3xl border border-[#3e2c24] bg-espresso p-3.5 text-warmCream shadow-float-dock">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-caramel" />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-warmCream/70">
                      {t('cart.title')}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-white">
                      <span>{cartCount} {cartCount === 1 ? 'article' : 'articles'}</span>
                      <span className="text-caramel">•</span>
                      <span className="text-caramel">
                        {formatCost(cartTotal, locale, tCommon('currency'))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex rounded-xl bg-white/10 p-0.5 text-[10px] font-mono">
                  <span className="rounded-lg bg-caramel px-2.5 py-1 font-bold text-white shadow-sm transition">
                    {t('table', { number: tableNumber })}
                  </span>
                </div>
              </div>

              {/* Cart lines */}
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                {cart.map((line, idx) => (
                  <div key={line.dish.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{line.dish.name}</p>
                      <p className="font-mono text-[10px] text-white/60">
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

              {/* Submit button */}
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
                  className="flex w-full items-center justify-between rounded-2xl bg-caramel py-3.5 px-4 text-xs font-bold text-white shadow-lg transition duration-200 hover:bg-caramelDark active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="flex items-center gap-2 font-sans text-sm tracking-wide">
                    <span className="size-5">🛒</span>
                    {t('cart.submit')} (Table {tableNumber})
                  </span>
                  <span className="text-[18px]">→</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-warmCream/70">
                  <span className="text-[13px] text-emerald-400">⚡</span>
                  <span>{t('cart.instant', { defaultValue: 'Transmis instantanément à l\'écran Barista & Fournil sans attente' })}</span>
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
      </div>

      {/* 4. Bottom Sheet — Personnalisation */}
      <div
        className={`fixed inset-0 z-50 bg-espresso/70 backdrop-blur-sm transition-opacity duration-300 ${
          sheetOpen ? 'opacity-100' : 'pointer-events-none hidden opacity-0'
        }`}
        onClick={closeSheet}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="no-scrollbar flex max-h-[88vh] w-full max-w-2xl flex-col justify-between overflow-y-auto rounded-t-[28px] border-t border-[#eedecf] bg-warmCream p-5 shadow-2xl pointer-events-auto">
          {/* Sheet Handle */}
          <div>
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#dfcfc1]" />
            {/* Sheet Header */}
            <div className="flex items-start justify-between border-b border-[#ebd8c8] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-caramel/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-caramelDark">
                    {sheetDish ? (categories.find((c) => c.id === sheetDish.categoryId)?.name ?? '') : ''}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-tertiary">Choix Signature</span>
                </div>
                <h3 className="font-bold text-lg text-espresso mt-1" id="sheet-title">
                  {sheetDish?.name ?? ''}
                </h3>
                {sheetDish?.description && (
                  <p className="font-body text-xs text-espresso/70">{sheetDish.description}</p>
                )}
              </div>
              <button
                aria-label="Fermer la personnalisation"
                type="button"
                onClick={closeSheet}
                className="rounded-full bg-softSand p-1.5 text-espresso/60 transition hover:text-espresso"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {sheetDish && (
              <div className="space-y-4 mt-4 text-xs">
                {/* Quantity */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between font-bold text-espresso">
                    <span>{t('cart.quantity', { defaultValue: 'Quantité' })}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSheetDish((d) => d ? { ...d, price: d.price } : d)}
                      className="flex size-10 items-center justify-center rounded-full border border-[#ebd8c7] bg-white transition hover:bg-softSand"
                    >
                      <MinusIcon className="size-4" />
                    </button>
                    <span className="w-12 text-center text-xl font-bold tabular-nums text-espresso">
                      1
                    </span>
                    <button
                      type="button"
                      onClick={() => setSheetDish((d) => d ? { ...d, price: d.price } : d)}
                      className="flex size-10 items-center justify-center rounded-full border border-[#ebd8c7] bg-white transition hover:bg-softSand"
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-[#f0e1d2] bg-[#faf3ec] p-2.5 text-xs text-espresso/80">
                  <p className="font-body leading-relaxed text-espresso/85">
                    <strong className="font-semibold text-espresso">{sheetDish.name}</strong>
                    {sheetDish.description ? ` — ${sheetDish.description}` : ''}
                  </p>
                </div>

                {/* Validation Button */}
                <div className="pt-2 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      addDish(sheetDish);
                      closeSheet();
                    }}
                    className="active:scale-[0.98] flex w-full items-center justify-center gap-2 rounded-xl bg-caramel py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-caramelDark"
                  >
                    <span>
                      {t('cart.addToOrder', { defaultValue: 'Ajouter à la Commande' })} • {formatCost(sheetDish.price, locale, tCommon('currency'))}
                    </span>
                    <CheckCircleIcon className="size-[16px]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
