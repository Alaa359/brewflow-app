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

function getCategoryIcon(categoryName?: string | null) {
  const map: Record<string, string> = {
    boissons: '☕',
    drinks: '☕',
    beverages: '☕',
    'boissons chaudes': '☕',
    'boissons froides': '🧊',
    dessertes: '🍰',
    desserts: '🍰',
    'pâtisserie': '🍰',
    patisserie: '🍰',
    'entrées': '🍽️',
    entrees: '🍽️',
    plats: '🍲',
    dishes: '🍲',
    'apéritifs': '🍷',
    aperitifs: '🍷',
    viennoiseries: '🥐',
    glaces: '🍦',
    salades: '🥗',
    sandwichs: '🥪',
  };
  return map[categoryName?.toLowerCase().trim() ?? ''] ?? '🍽️';
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

  const dishCountByCategory = (catId: string) =>
    dishes.filter((d) => d.categoryId === catId).length;

  return (
    <div className="flex flex-1 flex-col">
      {/* ─── HERO ─── */}
      <header className="menu-hero border-b">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-4 py-10 text-center">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <StoreIcon className="size-4" />
            {establishmentName}
          </span>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">{t('subtitle')}</p>
          <span className="bg-muted mt-1 rounded-full px-4 py-1.5 text-xs font-medium">
            {t('table', { number: tableNumber })}
            {tableZone ? ` · ${tableZone}` : ''}
          </span>
        </div>
      </header>

      {/* ─── CONFIRMED ─── */}
      {confirmed && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="border-success/30 bg-success/10 text-success flex items-start gap-3 rounded-xl border px-4 py-3 text-sm anim-fade-up">
            <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{t('confirmed.title')}</span>
              <span>{t('confirmed.description')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTIONS PAR CATEGORIE ─── */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
        {categories.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border px-3 py-8 text-center text-sm">
            {t('unavailable')}
          </p>
        ) : (
          categories.map((category, catIndex) => {
            const catDishes = dishes.filter(
              (d) => d.categoryId === category.id
            );
            if (catDishes.length === 0) return null;

            return (
              <section
                key={category.id}
                className="flex flex-col gap-4 anim-fade-up"
                style={{ animationDelay: `${catIndex * 0.1}s` }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold tracking-wide uppercase">
                      {category.name}
                    </h2>
                    <span className="text-muted-foreground text-xs">
                      {dishCountByCategory(category.id)} {dishCountByCategory(category.id) > 1 ? 'plats' : 'plat'}
                    </span>
                  </div>
                  <div className="bg-border ml-2 h-px flex-1" />
                </div>

                {/* Dishes grid for this category */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {catDishes.map((dish, i) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => addDish(dish)}
                      className="menu-poster-card bg-background flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-start"
                      style={{ animationDelay: `${(catIndex * catDishes.length + i) * 0.03}s` }}
                    >
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <DishThumb
                          src={dish.imageUrl}
                          alt={dish.name}
                          variant="poster"
                          categoryName={category.name}
                        />
                        <div className="menu-poster-overlay absolute inset-0 flex flex-col justify-end p-3">
                          <span className="text-white text-sm font-semibold leading-tight">
                            {dish.name}
                          </span>
                          <span className="text-white/80 text-xs font-medium">
                            {formatCost(dish.price, locale, tCommon('currency'))}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 p-3">
                        {dish.description ? (
                          <span className="text-muted-foreground line-clamp-2 text-xs">
                            {dish.description}
                          </span>
                        ) : null}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-primary text-sm font-semibold">
                            {formatCost(dish.price, locale, tCommon('currency'))}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              addDish(dish);
                            }}
                          >
                            <PlusIcon className="size-4" />
                          </Button>
                        </div>
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
      <section className="border-t bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <ShoppingBasketIcon className="text-primary size-5" />
            <h2 className="text-xl font-semibold">{t('cart.title')}</h2>
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-bold">
                {cartCount}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-muted-foreground rounded-xl border px-3 py-6 text-center text-sm">
              {t('cart.empty')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((line, index) => (
                <div
                  key={line.dish.id}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
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
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => bump(index, -1)}
                    >
                      <MinusIcon />
                      <span className="sr-only">{t('cart.decrement')}</span>
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => bump(index, 1)}
                    >
                      <PlusIcon />
                      <span className="sr-only">{t('cart.increment')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-8"
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
          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{t('cart.total')}</span>
              <span className="text-2xl font-bold tabular-nums">
                {formatCost(cartTotal, locale, tCommon('currency'))}
              </span>
            </div>

            {state?.errors?.form?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              >
                {e}
              </p>
            ))}
            {state?.errors?.items?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
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
                className="w-full py-6 text-base"
                size="lg"
                disabled={cart.length === 0 || pending}
              >
                {pending ? t('cart.submitting') : t('cart.submit')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
