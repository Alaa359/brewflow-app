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
  UtensilsCrossedIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function DishThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="bg-muted flex h-24 w-full items-center justify-center">
        <UtensilsCrossedIcon className="text-muted-foreground size-5" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="bg-muted h-24 w-full object-cover"
    />
  );
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
      <header className="bg-background/90 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <StoreIcon className="text-muted-foreground size-4" />
            {establishmentName}
          </span>
          <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
            {t('table', { number: tableNumber })}
            {tableZone ? ` · ${tableZone}` : ''}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {confirmed && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{t('confirmed.title')}</span>
              <span>{t('confirmed.description')}</span>
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col gap-3">
            {categories.length === 0 ? (
              <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
                {t('unavailable')}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        category.id === activeCategory ? 'default' : 'outline'
                      }
                      size="sm"
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {activeDishes.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
                    {t('noDishes')}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {activeDishes.map((dish) => (
                      <button
                        key={dish.id}
                        type="button"
                        onClick={() => addDish(dish)}
                        className="bg-background hover:bg-muted/60 flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors"
                      >
                        <DishThumb src={dish.imageUrl} alt={dish.name} />
                        <div className="flex flex-1 flex-col gap-0.5 p-3">
                          <span className="text-sm font-medium">
                            {dish.name}
                          </span>
                          {dish.description ? (
                            <span className="text-muted-foreground line-clamp-2 text-xs">
                              {dish.description}
                            </span>
                          ) : null}
                          <span className="text-muted-foreground mt-auto pt-1 text-xs font-medium">
                            {formatCost(
                              dish.price,
                              locale,
                              tCommon('currency')
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <Card>
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
                  <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
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
    </div>
  );
}
