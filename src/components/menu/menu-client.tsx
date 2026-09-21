'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CircleCheckIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBasketIcon,
  StoreIcon,
  Trash2Icon,
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
  const [confirmed, setConfirmed] = useState(false);
  const t = useTranslations('Menu');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    submitTableOrder,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart([]);
      setConfirmed(true);
    }
  }, [state]);

  const cartCount = cart.reduce((acc, line) => acc + line.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, line) => acc + line.dish.price * line.quantity,
    0
  );

  function addDish(dish: MenuDish) {
    setConfirmed(false);
    setCart((current) => {
      const index = current.findIndex((line) => line.dish.id === dish.id);
      if (index === -1) return [...current, { dish, quantity: 1 }];
      const quantity = Math.min(current[index].quantity + 1, 99);
      return current.map((line, i) =>
        i === index ? { ...line, quantity } : line
      );
    });
  }

  function bump(index: number, delta: number) {
    setCart((current) =>
      current
        .map((line, i) => {
          if (i !== index) return line;
          const quantity = Math.min(Math.max(line.quantity + delta, 0), 99);
          return { ...line, quantity };
        })
        .filter((line) => line.quantity > 0)
    );
  }

  function removeLine(index: number) {
    setCart((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="menu-page flex flex-1 flex-col">
      {/* ─── HERO ─── */}
      <header className="menu-hero">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 text-center sm:py-16">
          <span className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-muted-foreground">
            <StoreIcon className="size-3.5" />
            {establishmentName}
          </span>
          <h1 className="font-[family-name:var(--font-sora)] text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {t('subtitle')}
          </p>
          <span className="bg-primary/10 text-primary mt-2 rounded-full px-5 py-2 text-xs font-semibold tracking-wide">
            {t('table', { number: tableNumber })}
            {tableZone ? ` · ${tableZone}` : ''}
          </span>
        </div>
      </header>

      {/* ─── CONFIRMED ─── */}
      {confirmed && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="border-success/30 bg-success/10 text-success flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm anim-fade-up">
            <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{t('confirmed.title')}</span>
              <span>{t('confirmed.description')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTIONS PAR CATEGORIE ─── */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        {categories.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border px-3 py-10 text-center text-sm">
            {t('unavailable')}
          </p>
        ) : (
          categories.map((category) => {
            const catDishes = dishes.filter(
              (d) => d.categoryId === category.id
            );
            if (catDishes.length === 0) return null;

            return (
              <section key={category.id} className="flex flex-col gap-4">
                {/* Category header */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/8 flex items-center justify-center rounded-lg px-3 py-1.5">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-primary">
                      {category.name}
                    </h2>
                  </div>
                  <div className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground text-xs">
                    {catDishes.length}
                  </span>
                </div>

                {/* Dishes grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {catDishes.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => addDish(dish)}
                      className="menu-poster-card bg-card/80 flex cursor-pointer flex-col overflow-hidden rounded-2xl text-start backdrop-blur-sm"
                    >
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <DishThumb
                          src={dish.imageUrl}
                          alt={dish.name}
                          variant="poster"
                          categoryName={category.name}
                        />
                        <div className="menu-poster-overlay absolute inset-0 flex flex-col justify-end p-3">
                          <span className="text-white text-sm font-semibold leading-tight drop-shadow-md">
                            {dish.name}
                          </span>
                        </div>
                        {/* Price badge */}
                        <span className="bg-primary/90 text-primary-foreground absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
                          {formatCost(dish.price, locale, tCommon('currency'))}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-3">
                        {dish.description ? (
                          <span className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                            {dish.description}
                          </span>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-1 w-full gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            addDish(dish);
                          }}
                        >
                          <PlusIcon className="size-3.5" />
                          {t('cart.addToCart')}
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ─── PANIER EN BAS DE PAGE ─── */}
      <section className="menu-cart-section">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-10 sm:px-6">
          {/* Cart header */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
              <ShoppingBasketIcon className="text-primary size-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{t('cart.title')}</h2>
              {cartCount > 0 && (
                <span className="text-muted-foreground text-xs">
                  {cartCount} {cartCount > 1 ? 'articles' : 'article'}
                </span>
              )}
            </div>
          </div>

          {/* Cart items */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-3 py-10">
              <ShoppingBasketIcon className="text-muted-foreground/40 size-10" />
              <p className="text-muted-foreground text-sm">
                {t('cart.empty')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((line, index) => (
                <div
                  key={line.dish.id}
                  className="menu-cart-item flex items-center gap-3 rounded-xl border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {line.dish.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatCost(line.dish.price, locale, tCommon('currency'))}{' '}
                      {t('cart.perUnit')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      onClick={() => bump(index, -1)}
                    >
                      <MinusIcon />
                      <span className="sr-only">{t('cart.decrement')}</span>
                    </Button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      onClick={() => bump(index, 1)}
                    >
                      <PlusIcon />
                      <span className="sr-only">{t('cart.increment')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-8 rounded-lg"
                      onClick={() => removeLine(index)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">{t('cart.removeLine')}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total + Submit */}
          {cart.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl border bg-card/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">{t('cart.total')}</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {formatCost(cartTotal, locale, tCommon('currency'))}
                </span>
              </div>

              {state?.errors?.form?.map((e) => (
                <p
                  key={e}
                  className="bg-destructive/10 text-destructive rounded-xl px-4 py-2.5 text-xs"
                >
                  {e}
                </p>
              ))}
              {state?.errors?.items?.map((e) => (
                <p
                  key={e}
                  className="bg-destructive/10 text-destructive rounded-xl px-4 py-2.5 text-xs"
                >
                  {e}
                </p>
              ))}

              <form action={formAction}>
                <input type="hidden" name="token" value={token} />
                <input
                  type="hidden"
                  name="items"
                  value={JSON.stringify(
                    cart.map((line) => ({
                      dishId: line.dish.id,
                      quantity: line.quantity,
                    }))
                  )}
                />
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-semibold"
                  size="lg"
                  disabled={cart.length === 0 || pending}
                >
                  {pending ? t('cart.submitting') : t('cart.submit')}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
