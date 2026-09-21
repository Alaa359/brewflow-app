'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ShoppingBagIcon,
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
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [cartShake, setCartShake] = useState(false);
  const prevCartCountRef = useRef(0);
  const t = useTranslations('Menu');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitTableOrder, undefined);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (state?.success) {
      setCart([]);
      setConfirmed(true);
      setCartOpen(false);
    }
  }, [state]);

  const cartCount = cart.reduce((a, l) => a + l.quantity, 0);
  const cartTotal = cart.reduce((a, l) => a + l.dish.price * l.quantity, 0);

  const activeDishes = useMemo(() => {
    let list = dishes.filter((d) => d.categoryId === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = dishes.filter(
        (d) => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
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

  // Trigger animations when cart count changes
  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setCartBounce(true);
      setCartShake(true);
      const t1 = setTimeout(() => setCartBounce(false), 500);
      const t2 = setTimeout(() => setCartShake(false), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const openCart = useCallback(() => {
    setCartOpen(true);
    document.body.classList.add('overflow-hidden');
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
    document.body.classList.remove('overflow-hidden');
  }, []);

  return (
    <>
      {/* Full-Screen Container */}
      <div className="relative flex min-h-screen w-full flex-col bg-warmCream">

        {/* 1. Header Éditorial */}
        <header className="sticky top-0 z-30 border-b border-[#eedecf] bg-warmCream/95 px-4 pb-2.5 pt-3 shadow-[0_2px_12px_rgba(43,30,24,0.03)] backdrop-blur-md sm:px-6 lg:px-8">
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
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#ebd6c3] bg-softSand/90 px-3 py-1.5">
            <span className="text-xs font-medium text-espresso">
              {t('table', { number: tableNumber })}
              {tableZone ? ` · ${tableZone}` : ''}
            </span>
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
          {/* Hero */}
          <section className="px-4 pb-2 pt-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-[#e8d5c3] bg-gradient-to-br from-[#f8ebe0] via-[#f5e3d2] to-[#ecdcce] p-4 shadow-poster">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-caramel/10 blur-2xl" />
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-caramelDark">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="text-caramel size-[15px]" />
                  {t('subtitle')}
                </span>
                <span className="rounded-full border border-caramel/30 bg-caramel/15 px-2 py-0.5 text-[9px] font-bold text-caramelDark">
                  Édition 2025
                </span>
              </div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-espresso">{t('title')}</h1>
              <p className="font-body mt-1 text-xs leading-relaxed text-espresso/75">{t('subtitle')}</p>
              <div className="relative mt-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40 size-[18px]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder', { defaultValue: 'Rechercher un plat...' })}
                  className="font-body w-full rounded-xl border border-[#dfcab8] bg-[#fff8f1]/90 py-2 pl-9 pr-4 text-xs shadow-sm placeholder:text-espresso/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-caramel/40"
                />
              </div>
            </div>
          </section>

          {/* 2. Category Pills */}
          {categories.length > 0 && !searchQuery && (
            <nav aria-label="Catégories du menu" className="sticky top-[108px] z-20 border-y border-[#ebd8c7] bg-warmCream/95 py-2 backdrop-blur-md">
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
            {confirmed && (
              <div className="flex items-start gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm text-tertiary anim-fade-up">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{t('confirmed.title')}</span>
                  <span>{t('confirmed.description')}</span>
                </div>
              </div>
            )}

            {searchQuery && (
              <div className="flex items-center justify-between border-b border-[#eddcca] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <SearchIcon className="text-caramel size-3.5" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-espresso">
                    {t('searchResults', { defaultValue: 'Résultats' })}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-espresso/60">{activeDishes.length}</span>
              </div>
            )}

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

            {activeDishes.length === 0 && (
              <p className="rounded-xl border border-[#ecdccb] px-3 py-8 text-center text-sm text-[#8C7A6B]">
                {searchQuery ? t('noResults', { defaultValue: 'Aucun résultat' }) : t('noDishes')}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeDishes.map((dish, i) => {
                const priceFormatted = formatCost(dish.price, locale, tCommon('currency'));
                const hasImage = !!dish.imageUrl;
                const categoryName = categories.find((c) => c.id === dish.categoryId)?.name ?? '';

                if (hasImage) {
                  return (
                    <article
                      key={dish.id}
                      className="overflow-hidden rounded-2xl border border-[#ecdccb] bg-cardBg shadow-poster transition hover:border-caramel/50 anim-fade-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-[#efe5d9]">
                        <DishThumb src={dish.imageUrl} alt={dish.name} variant="poster" categoryName={categoryName} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                          <span className="rounded-md bg-espresso/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-warmCream shadow-sm backdrop-blur-sm">
                            {categoryName}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                          <div>
                            <h2 className="text-base font-bold tracking-tight text-white drop-shadow-sm">{dish.name}</h2>
                            {dish.description && <p className="line-clamp-1 text-[11px] text-white/80">{dish.description}</p>}
                          </div>
                          <div className="shadow font-mono text-base font-bold bg-caramel/90 rounded-lg px-2.5 py-1 text-white backdrop-blur-sm">
                            {priceFormatted}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5">
                        <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-tertiary">
                          <CheckCircleIcon className="size-[14px]" />
                          {t('cart.customize', { defaultValue: 'Disponible' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => addDish(dish)}
                          className="active:scale-95 inline-flex items-center gap-1.5 rounded-xl bg-caramel px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-caramelDark"
                        >
                          <span>{t('cart.add', { defaultValue: 'Ajouter' })}</span>
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={dish.id}
                    className="flex flex-col gap-2.5 rounded-2xl border border-[#ecdccb] bg-cardBg p-3.5 shadow-poster transition hover:border-caramel/50 anim-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-0.5">
                          <span className="rounded bg-caramel/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-caramelDark">
                            {categoryName}
                          </span>
                        </div>
                        <h2 className="text-[14px] font-bold leading-snug text-espresso">{dish.name}</h2>
                        {dish.description && (
                          <p className="font-body mt-1 text-xs leading-relaxed text-espresso/75">{dish.description}</p>
                        )}
                      </div>
                      <div className="shrink-0 rounded-lg border border-[#ebd8c8] bg-softSand px-2.5 py-1 font-mono text-[14px] font-bold text-espresso">
                        {priceFormatted}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#f0e1d2] pt-1">
                      <span className="rounded border border-[#ebd8c8] bg-[#fcf5ed] px-2 py-0.5 text-[10px] font-mono text-espresso/70">
                        {categoryName}
                      </span>
                      <button
                        type="button"
                        onClick={() => addDish(dish)}
                        className="active:scale-95 inline-flex items-center gap-1.5 rounded-xl bg-caramel px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-caramelDark"
                      >
                        <span>{t('cart.add', { defaultValue: 'Ajouter' })}</span>
                        <PlusIcon className="size-3" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ═══ FLOATING CART BUTTON ═══ */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={openCart}
          className={`fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 group
            ${cartOpen ? '' : 'cart-btn-float cart-btn-glow'}
            ${cartBounce ? 'cart-btn-bounce' : ''}
          `}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-caramel/40 via-caramelDark/30 to-caramel/40 opacity-60 blur-sm transition group-hover:opacity-100 group-hover:blur-md" />

          {/* Main button */}
          <div className="relative flex items-center gap-2.5 rounded-full border border-caramel/20 bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:border-caramel/40 group-hover:bg-white group-hover:shadow-xl group-hover:scale-105 active:scale-95">
            {/* Icon with shake */}
            <span className={`relative ${cartShake ? 'cart-btn-ring' : ''}`}>
              <ShoppingBagIcon className="size-5 text-caramel transition group-hover:text-caramelDark" />
            </span>

            {/* Count badge with pop */}
            <span className="cart-badge-pop absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-caramel text-[11px] font-bold text-white shadow-md">
              {cartCount}
            </span>

            {/* Separator */}
            <span className="h-5 w-px bg-[#ecdccb] transition group-hover:bg-caramel/30" />

            {/* Total */}
            <span className="font-mono text-sm font-bold text-espresso tabular-nums transition group-hover:text-caramelDark">
              {formatCost(cartTotal, locale, tCommon('currency'))}
            </span>

            {/* Arrow indicator */}
            <span className="ml-0.5 text-xs text-espresso/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-caramel">
              →
            </span>
          </div>
        </button>
      )}

      {/* ═══ CART MODAL ═══ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          cartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[#ebd8c7] bg-white/90 shadow-2xl backdrop-blur-xl">

          {/* Handle */}
          <div className="flex items-center justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-[#dfcfc1]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="flex size-10 items-center justify-center rounded-full bg-caramel/15">
                  <ShoppingBagIcon className="size-5 text-caramel" />
                </span>
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-white shadow">
                  {cartCount}
                </span>
              </div>
              <div>
                <h2 className="font-sans text-base font-bold text-espresso">{t('cart.title')}</h2>
                <p className="font-mono text-[11px] text-espresso/60">
                  {cartCount} {cartCount === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="flex size-9 items-center justify-center rounded-full bg-softSand text-espresso/60 transition hover:bg-[#ebd8c7] hover:text-espresso"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {/* Separator */}
          <div className="mx-5 border-t border-[#ebd8c7]" />

          {/* Cart lines */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-softSand">
                  <ShoppingBagIcon className="size-6 text-espresso/30" />
                </span>
                <p className="mt-3 text-sm font-medium text-espresso/60">{t('cart.empty')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((line, idx) => {
                  const catName = categories.find((c) => c.id === line.dish.categoryId)?.name ?? '';
                  return (
                    <div
                      key={line.dish.id}
                      className="flex items-center gap-3 rounded-2xl border border-[#f0e1d2] bg-[#faf6f0] p-3 transition hover:border-caramel/30"
                    >
                      {/* Thumbnail or icon */}
                      <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-softSand">
                        {line.dish.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={line.dish.imageUrl} alt={line.dish.name} className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            {getCategoryIcon(catName)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-espresso">{line.dish.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="rounded bg-caramel/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-caramelDark">
                            {catName}
                          </span>
                          <span className="font-mono text-[11px] text-espresso/50">
                            {formatCost(line.dish.price, locale, tCommon('currency'))}
                          </span>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => bump(idx, -1)}
                          className="flex size-8 items-center justify-center rounded-full border border-[#ebd8c7] bg-white text-espresso transition hover:bg-softSand"
                        >
                          <MinusIcon className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums text-espresso">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => bump(idx, 1)}
                          className="flex size-8 items-center justify-center rounded-full border border-[#ebd8c7] bg-white text-espresso transition hover:bg-softSand"
                        >
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>

                      {/* Subtotal & remove */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-sm font-bold text-espresso tabular-nums">
                          {formatCost(line.dish.price * line.quantity, locale, tCommon('currency'))}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="flex items-center gap-0.5 text-[10px] text-espresso/40 transition hover:text-red-500"
                        >
                          <Trash2Icon className="size-3" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-[#ebd8c7] px-5 pb-5 pt-4">
              {/* Total */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-espresso">Total</span>
                <span className="font-mono text-xl font-bold text-espresso tabular-nums">
                  {formatCost(cartTotal, locale, tCommon('currency'))}
                </span>
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
                  className="flex w-full items-center justify-between rounded-2xl bg-caramel py-4 px-5 text-sm font-bold text-white shadow-lg transition duration-200 hover:bg-caramelDark active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBagIcon className="size-5" />
                    {t('cart.submit')} (Table {tableNumber})
                  </span>
                  <span className="text-lg">→</span>
                </button>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-espresso/50">
                  <CheckCircleIcon className="size-3.5 text-tertiary" />
                  <span>{t('cart.instant', { defaultValue: 'Transmis instantanément au barista' })}</span>
                </div>
              </form>

              {state?.errors?.form?.map((e) => (
                <p key={e} className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-500">{e}</p>
              ))}
              {state?.errors?.items?.map((e) => (
                <p key={e} className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-500">{e}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
