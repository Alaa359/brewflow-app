'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  MinusIcon,
  PlusIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCheckoutSession, validateSale } from '@/actions/sales';
import { formatCost } from '@/lib/ingredients';

export type PosDish = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
};

export type PosCategory = { id: string; name: string };

export type PosTable = { id: string; number: number; zone: string | null };

type CartLine = { dish: PosDish; quantity: number };

function DishThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="bg-muted flex h-20 w-full items-center justify-center">
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
      className="bg-muted h-20 w-full object-cover"
    />
  );
}

export function PosClient({
  categories,
  dishes,
  tables,
  canStripe = false,
}: {
  categories: PosCategory[];
  dishes: PosDish[];
  tables: PosTable[];
  canStripe?: boolean;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? ''
  );
  const [tableId, setTableId] = useState<string>(tables[0]?.id ?? '');
  const [method, setMethod] = useState<'CASH' | 'STRIPE'>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [state, formAction, pending] = useActionState(validateSale, undefined);
  const [cardState, cardAction, cardPending] = useActionState(
    createCheckoutSession,
    undefined
  );
  const t = useTranslations('Pos');
  const tCommon = useTranslations('Common');
  const tPayment = useTranslations('PaymentMethod');
  const locale = useLocale();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? t('saleRecordedToast'));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart([]);
      setAmountReceived('');
    } else if (state && !state.success) {
      const message =
        state.errors?.form?.[0] ??
        state.errors?.items?.[0] ??
        state.errors?.tableId?.[0] ??
        state.errors?.amountReceived?.[0];
      if (message) toast.error(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const cartCount = cart.reduce((acc, line) => acc + line.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, line) => acc + line.dish.price * line.quantity,
    0
  );

  const activeState = method === 'CASH' ? state : cardState;
  const viewPending = method === 'CASH' ? pending : cardPending;

  const receivedAmount =
    amountReceived.trim() === ''
      ? null
      : Number.parseFloat(amountReceived.replace(',', '.'));

  const isCashAmountValid =
    receivedAmount !== null &&
    !Number.isNaN(receivedAmount) &&
    receivedAmount >= cartTotal;

  const changeAmount =
    receivedAmount !== null && !Number.isNaN(receivedAmount)
      ? receivedAmount - cartTotal
      : null;

  const canSubmit =
    cart.length > 0 &&
    tableId !== '' &&
    !viewPending &&
    (method === 'CASH' ? isCashAmountValid : canStripe);

  const activeDishes = dishes.filter(
    (dish) => dish.categoryId === activeCategory
  );

  function addDish(dish: PosDish) {
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
          const quantity = Math.min(Math.max(line.quantity + delta, 1), 99);
          return { ...line, quantity };
        })
        .filter((line) => line.quantity > 0)
    );
  }

  function removeLine(index: number) {
    setCart((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {categories.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
            {t('noCategories')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={cat.id === activeCategory ? 'default' : 'outline'}
                  size="sm"
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {activeDishes.length === 0 ? (
              <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
                {t('noDishes')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {activeDishes.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => addDish(dish)}
                    className="bg-background hover:bg-muted/60 flex cursor-pointer flex-col overflow-hidden rounded-xl border text-start transition-colors"
                  >
                    <DishThumb src={dish.imageUrl} alt={dish.name} />
                    <div className="flex flex-col gap-0.5 p-3">
                      <span className="text-sm font-medium">{dish.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatCost(dish.price, locale, tCommon('currency'))}
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
        <form
          action={method === 'CASH' ? formAction : cardAction}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="tableId" value={tableId} />
          <input type="hidden" name="method" value={method} />
          <input type="hidden" name="amountReceived" value={amountReceived} />
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
            <div className="flex flex-col gap-2">
              <Label>{t('table.label')}</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger
                  className="w-full"
                  aria-label={t('table.label')}
                >
                  <SelectValue placeholder={t('table.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem
                      key={table.id}
                      value={table.id}
                    >{`n° ${table.number}${table.zone ? ` — ${table.zone}` : ''}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                        {t('cart.lineTotal', {
                          cost: formatCost(
                            line.dish.price,
                            locale,
                            tCommon('currency')
                          ),
                        })}
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
                        <span className="sr-only">{t('cart.removeOne')}</span>
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
                        <span className="sr-only">{t('cart.addOne')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive size-7"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">{t('cart.deleteLine')}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {state?.success && state.orderId && method === 'CASH' ? (
              <a
                href={`/api/orders/${state.orderId}/ticket`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-medium"
              >
                <ReceiptTextIcon className="size-3.5" />
                {t('cart.downloadTicket')}
              </a>
            ) : null}

            <div className="flex flex-col gap-4 border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('cart.total')}</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatCost(cartTotal, locale, tCommon('currency'))}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('payment.label')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={method === 'CASH' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMethod('CASH')}
                  >
                    {tPayment('CASH')}
                  </Button>
                  {canStripe ? (
                    <Button
                      type="button"
                      variant={method === 'STRIPE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMethod('STRIPE')}
                    >
                      {tPayment('STRIPE')}
                    </Button>
                  ) : null}
                </div>
              </div>

              {method === 'CASH' ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amountReceived">
                    {t('payment.amountReceived')}
                  </Label>
                  <Input
                    id="amountReceived"
                    value={amountReceived}
                    onChange={(event) => setAmountReceived(event.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                  />
                  {amountReceived !== '' &&
                    (receivedAmount === null ||
                      Number.isNaN(receivedAmount)) && (
                      <p className="text-destructive text-xs">
                        {t('payment.amountInvalid')}
                      </p>
                    )}
                  {receivedAmount !== null &&
                    !Number.isNaN(receivedAmount) &&
                    changeAmount !== null && (
                      <p
                        className={
                          changeAmount >= 0
                            ? 'text-success text-xs font-medium'
                            : 'text-destructive text-xs font-medium'
                        }
                      >
                        {changeAmount >= 0
                          ? t('payment.change', {
                              amount: formatCost(
                                changeAmount,
                                locale,
                                tCommon('currency')
                              ),
                            })
                          : t('payment.amountInsufficient')}
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {t('payment.stripeNotice')}
                </p>
              )}
            </div>

            {activeState?.errors?.form?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              >
                {e}
              </p>
            ))}
            {activeState?.errors?.items?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              >
                {e}
              </p>
            ))}
            {activeState?.errors?.tableId?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              >
                {e}
              </p>
            ))}
            {activeState?.errors?.amountReceived?.map((e) => (
              <p
                key={e}
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              >
                {e}
              </p>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {viewPending
                ? t('submit.recording')
                : method === 'CASH'
                  ? t('submit.cash')
                  : t('submit.card')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
