'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CircleCheckIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  StoreIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DishThumb } from '@/components/ui/dish-thumb';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    pâtisserie: '🍰',
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
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? ''
  );
  const [confirmed, setConfirmed] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
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
      setShowMobileCart(false);
    }
  }, [state]);

  const cartCount = cart.reduce((acc, line) => acc + line.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, line) => acc + line.dish.price * line.quantity,
    0
  );
  const activeDishes = dishes.filter(
    (dish) => dish.categoryId === activeCategory
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
    <div className="flex flex-1 flex-col">
      {/* ─── HERO ─── */}
      <header className="menu-hero border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <StoreIcon className="size-4" />
            {establishmentName}
          </span>
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          <span className="bg-muted mt-1 rounded-full px-3 py-1 text-xs font-medium">
            {t('table', { number: tableNumber })}
            {tableZone ? ` · ${tableZone}` : ''}
          </span>
        </div>
      </header>

      {/* ─── CATEGORIES PILLS ─── */}
      {categories.length > 0 && (
        <nav className="bg-background/90 sticky top-0 z-10 border-b backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category.id === activeCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span>{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        {/* ─── CONFIRMED ─── */}
        {confirmed && (
          <div className="border-success/30 bg-success/10 text-success flex items-start gap-3 rounded-xl border px-4 py-3 text-sm anim-fade-up">
            <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{t('confirmed.title')}</span>
              <span>{t('confirmed.description')}</span>
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {/* ─── GRILLE PLATS ─── */}
          <div className="flex flex-col gap-4">
            {categories.length === 0 ? (
              <p className="text-muted-foreground rounded-xl border px-3 py-8 text-center text-sm">
                {t('unavailable')}
              </p>
            ) : activeDishes.length === 0 ? (
              <p className="text-muted-foreground rounded-xl border px-3 py-8 text-center text-sm">
                {t('noDishes')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {activeDishes.map((dish, i) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => addDish(dish)}
                    className="menu-poster-card bg-background flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-start anim-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <DishThumb
                        src={dish.imageUrl}
                        alt={dish.name}
                        variant="poster"
                        categoryName={categories.find(c => c.id === dish.categoryId)?.name}
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
                      <Button
                        type="button"
                        size="sm"
                        className="mt-1 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          addDish(dish);
                        }}
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── PANIER DESKTOP ─── */}
          <Card className="sticky top-20 hidden lg:flex">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="size-4" />
                {t('cart.title')}
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {cartCount}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
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
              <CardContent className="flex flex-col gap-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground rounded-xl border px-3 py-6 text-center text-sm">
                    {t('cart.empty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {cart.map((line, index) => (
                      <li
                        key={line.dish.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {line.dish.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatCost(
                              line.dish.price,
                              locale,
                              tCommon('currency')
                            )}{' '}
                            {t('cart.perUnit')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => bump(index, -1)}
                          >
                            <MinusIcon />
                            <span className="sr-only">
                              {t('cart.decrement')}
                            </span>
                          </Button>
                          <span className="w-7 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => bump(index, 1)}
                          >
                            <PlusIcon />
                            <span className="sr-only">
                              {t('cart.increment')}
                            </span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-7"
                            onClick={() => removeLine(index)}
                          >
                            <Trash2Icon />
                            <span className="sr-only">
                              {t('cart.removeLine')}
                            </span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium">{t('cart.total')}</span>
                  <span className="text-lg font-semibold tabular-nums">
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
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={cart.length === 0 || pending}
                >
                  {pending ? t('cart.submitting') : t('cart.submit')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* ─── PANIER MOBILE (floating bottom bar) ─── */}
      {cartCount > 0 && (
        <div className="menu-cart-float fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowMobileCart(!showMobileCart)}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {cartCount}
              </div>
              <span className="text-sm font-medium">{t('cart.total')}</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCost(cartTotal, locale, tCommon('currency'))}
              </span>
            </button>
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
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? t('cart.submitting') : t('cart.submit')}
              </Button>
            </form>
          </div>

          {/* Expanded cart list on mobile */}
          {showMobileCart && (
            <div className="border-t px-4 pb-4 pt-2">
              <ul className="flex flex-col gap-2">
                {cart.map((line, index) => (
                  <li
                    key={line.dish.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {line.dish.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatCost(
                          line.dish.price,
                          locale,
                          tCommon('currency')
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => bump(index, -1)}
                      >
                        <MinusIcon />
                      </Button>
                      <span className="w-7 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => bump(index, 1)}
                      >
                        <PlusIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive size-7"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {state?.errors?.form?.map((e) => (
                <p
                  key={e}
                  className="bg-destructive/10 text-destructive mt-2 rounded-md px-3 py-2 text-xs"
                >
                  {e}
                </p>
              ))}
              {state?.errors?.items?.map((e) => (
                <p
                  key={e}
                  className="bg-destructive/10 text-destructive mt-2 rounded-md px-3 py-2 text-xs"
                >
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom spacer for mobile floating cart */}
      {cartCount > 0 && <div className="h-16 lg:hidden" />}
    </div>
  );
}
