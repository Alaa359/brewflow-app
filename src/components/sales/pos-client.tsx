'use client';

import { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  BanknoteIcon,
  CreditCardIcon,
  LayoutGridIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  ReceiptTextIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DishThumb } from '@/components/ui/dish-thumb';
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
  description: string | null;
  price: number;
  categoryId: string;
  imageUrl: string | null;
};

export type PosCategory = { id: string; name: string };

export type PosTable = { id: string; number: number; zone: string | null };

type CartLine = { dish: PosDish; quantity: number };

const ALL_CATEGORIES = '__all__';

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

export function PosClient({
  categories,
  dishes,
  tables,
  canStripe = false,
  establishmentName,
  serverName,
}: {
  categories: PosCategory[];
  dishes: PosDish[];
  tables: PosTable[];
  canStripe?: boolean;
  establishmentName?: string;
  serverName?: string;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
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
  const [query, setQuery] = useState('');
  const clock = useLiveClock();

  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(clock);

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

  const normalizedQuery = query.trim().toLowerCase();

  const categoryById = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat.name])),
    [categories]
  );

  const activeDishes = dishes.filter((dish) => {
    const matchesCategory =
      activeCategory === ALL_CATEGORIES || dish.categoryId === activeCategory;
    const matchesQuery =
      normalizedQuery === '' ||
      dish.name.toLowerCase().includes(normalizedQuery) ||
      (dish.description ?? '').toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const selectedTable = tables.find((table) => table.id === tableId);
  const tableLabel = selectedTable
    ? `n° ${selectedTable.number}${selectedTable.zone ? ` · ${selectedTable.zone}` : ''}`
    : t('table.placeholder');

  const quickAmounts = useMemo(() => {
    if (cartTotal <= 0) return [];
    const next10 = Math.ceil(cartTotal / 10) * 10;
    const next20 = Math.ceil((cartTotal + 0.01) / 20) * 20;
    const values = new Set<number>([
      Math.round(cartTotal * 100) / 100,
      next10,
      next20 === next10 ? next10 + 20 : next20,
    ]);
    return Array.from(values)
      .sort((a, b) => a - b)
      .slice(0, 3);
  }, [cartTotal]);

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

  function clearCart() {
    setCart([]);
    setAmountReceived('');
    setQuery('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            {t('title')}
          </h1>
          {establishmentName ? (
            <span className="font-label-caps text-label-caps rounded-full bg-secondary-container px-2 py-0.5 text-on-secondary-container">
              {establishmentName}
            </span>
          ) : null}
          <p className="font-body-md text-body-md text-on-surface-variant ms-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-surface-container-low flex flex-wrap items-center gap-2 rounded-xl p-2.5 shadow-sm">
          <span className="bg-primary-container text-on-primary font-label-caps inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-label-caps font-bold tracking-wide uppercase">
            <ReceiptTextIcon className="size-3.5" />
            {t('header.ticket', { count: cartCount })}
          </span>
          <span
            className="font-label-numeric text-label-numeric bg-surface-container-high text-on-surface inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold tabular-nums"
            suppressHydrationWarning
          >
            <span className="bg-tertiary inline-block size-1.5 animate-pulse rounded-full" />
            {timeLabel}
          </span>

          <span className="font-label-caps text-label-caps text-on-surface-variant hidden items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1.5 tracking-wide uppercase md:inline-flex">
            {t('table.label')}
          </span>
          <Select value={tableId} onValueChange={setTableId}>
            <SelectTrigger
              className="w-52 bg-surface-container-lowest shadow-xs"
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

          {serverName ? (
            <span className="font-label-caps text-label-caps text-on-surface-variant inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1.5 tracking-wide uppercase">
              {t('header.server')} : {serverName}
            </span>
          ) : null}

          <button
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="bg-error-container text-on-error-container font-label-md ms-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-md font-semibold transition-all disabled:opacity-50"
          >
            <XIcon className="size-4" />
            {t('header.cancel')}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <SearchIcon className="text-on-surface-variant absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                className="h-11 bg-surface-container-low ps-9 shadow-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(ALL_CATEGORIES)}
                className={
                  activeCategory === ALL_CATEGORIES
                    ? 'bg-primary text-on-primary font-label-md inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-label-md font-semibold shadow-sm transition-colors'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-label-md font-medium transition-colors'
                }
              >
                <LayoutGridIcon className="size-3.5" />
                {t('categories.all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={
                    cat.id === activeCategory
                      ? 'bg-primary text-on-primary font-label-md rounded-lg px-3.5 py-2 text-label-md font-semibold shadow-sm transition-colors'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md rounded-lg px-3.5 py-2 text-label-md font-medium transition-colors'
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {activeDishes.length === 0 ? (
            <p className="text-on-surface-variant rounded-xl border border-dashed border-outline-variant/50 px-3 py-10 text-center font-body-md text-body-md">
              {dishes.length === 0 ? t('noCategories') : t('noDishes')}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {activeDishes.map((dish) => {
                const inCart =
                  cart.find((line) => line.dish.id === dish.id)?.quantity ?? 0;
                const catName = categoryById.get(dish.categoryId);
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => addDish(dish)}
                    className="bg-surface-container-lowest group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant/40 text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg active:scale-[0.98]"
                  >
                    <div className="relative overflow-hidden">
                      <DishThumb
                        src={dish.imageUrl}
                        alt={dish.name}
                        size="xl"
                        className="h-36 w-full rounded-none object-cover transition-transform duration-500 group-hover:scale-105"
                        categoryName={catName}
                      />
                      {catName ? (
                        <span className="bg-inverse-surface/90 text-inverse-on-surface absolute top-2 start-2 rounded-md px-1.5 py-0.5 font-label-caps text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                          {catName}
                        </span>
                      ) : null}
                      {inCart > 0 && (
                        <span className="bg-primary text-on-primary absolute top-2 end-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 font-label-numeric text-label-numeric font-bold shadow-sm">
                          {inCart}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <span className="text-on-surface truncate font-body-md text-body-md font-bold transition-colors group-hover:text-primary">
                        {dish.name}
                      </span>
                      {dish.description ? (
                        <span className="text-on-surface-variant line-clamp-2 font-body-sm text-body-sm">
                          {dish.description}
                        </span>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                        <span className="text-primary font-label-numeric text-label-numeric font-bold tabular-nums">
                          {formatCost(dish.price, locale, tCommon('currency'))}
                        </span>
                        <span className="bg-primary-container text-on-primary flex size-8 items-center justify-center rounded-full shadow-xs transition-transform duration-300 group-hover:scale-110">
                          <PlusIcon className="size-4" />
                          <span className="sr-only">{t('cart.addOne')}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-outline-variant/40 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-on-surface-variant">
            <span className="font-label-caps text-label-caps tracking-wide uppercase">
              {t('grid.caption', { count: activeDishes.length })}
            </span>
            <span className="font-label-caps text-label-caps tracking-wide uppercase">
              {tableLabel}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest flex flex-col overflow-hidden rounded-2xl border border-outline-variant/40 shadow-sm xl:sticky xl:top-6">
          <div className="border-outline-variant/30 border-b px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">
                  {t('cart.running')}
                </p>
                <p className="text-on-surface font-headline-sm text-headline-sm font-bold tracking-tight">
                  {t('cart.articles', { count: cartCount })}
                </p>
              </div>
              <span className="bg-primary-container text-on-primary font-label-caps inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-label-caps font-bold tracking-wide uppercase">
                <ReceiptTextIcon className="size-3.5" />
                {t('cart.title')}
              </span>
            </div>
          </div>

          <form
            action={method === 'CASH' ? formAction : cardAction}
            className="flex flex-1 flex-col"
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

            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex flex-col gap-1.5 xl:hidden">
                <Label className="text-on-surface-variant font-label-caps text-label-caps tracking-wide uppercase">
                  {t('table.label')}
                </Label>
                <Select value={tableId} onValueChange={setTableId}>
                  <SelectTrigger
                    className="w-full shadow-xs"
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
                <div className="text-on-surface-variant flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-12 text-center">
                  <ReceiptTextIcon className="size-8 opacity-40" />
                  <p className="font-body-md text-body-md">{t('cart.empty')}</p>
                </div>
              ) : (
                <ul className="flex max-h-[20rem] flex-col gap-2.5 overflow-y-auto pe-1">
                  {cart.map((line, index) => (
                    <li
                      key={line.dish.id}
                      className="bg-surface-container-low flex flex-col gap-2 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-on-surface font-body-md text-body-md font-bold">
                            {t('cart.lineQty', {
                              quantity: line.quantity,
                              name: line.dish.name,
                            })}
                          </p>
                          <p className="text-on-surface-variant font-label-numeric text-label-numeric tabular-nums">
                            {t('cart.lineTotal', {
                              cost: formatCost(
                                line.dish.price,
                                locale,
                                tCommon('currency')
                              ),
                            })}
                          </p>
                        </div>
                        <span className="text-on-surface font-label-numeric text-label-numeric shrink-0 font-bold tabular-nums">
                          {formatCost(
                            line.dish.price * line.quantity,
                            locale,
                            tCommon('currency')
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="bg-surface-container-lowest text-on-surface flex size-8 items-center justify-center rounded-full shadow-xs transition-colors hover:bg-surface-container-high"
                            onClick={() => bump(index, -1)}
                          >
                            <MinusIcon className="size-3.5" />
                            <span className="sr-only">{t('cart.removeOne')}</span>
                          </button>
                          <span className="w-6 text-center font-label-numeric text-label-numeric text-on-surface tabular-nums font-bold">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="bg-surface-container-lowest text-on-surface flex size-8 items-center justify-center rounded-full shadow-xs transition-colors hover:bg-surface-container-high"
                            onClick={() => bump(index, 1)}
                          >
                            <PlusIcon className="size-3.5" />
                            <span className="sr-only">{t('cart.addOne')}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-destructive flex size-8 items-center justify-center rounded-full transition-colors hover:bg-destructive/10"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2Icon className="size-4" />
                          <span className="sr-only">{t('cart.deleteLine')}</span>
                        </button>
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
                  className="bg-tertiary-container text-on-tertiary-container flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-label-md text-label-md font-semibold"
                >
                  <PrinterIcon className="size-4" />
                  {t('cart.downloadTicket')}
                </a>
              ) : null}

              <div className="border-outline-variant/40 mt-auto flex flex-col gap-4 border-t pt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-on-surface font-headline-sm text-headline-sm font-bold tracking-tight uppercase">
                        {t('cart.total')}
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">
                        {t('cart.currencyNote')}
                      </span>
                    </div>
                    <span className="text-primary font-metric-display text-metric-display shrink-0 leading-none tabular-nums font-bold">
                      {formatCost(cartTotal, locale, tCommon('currency'))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
                    {t('payment.label')}
                  </Label>
                  <div
                    className={
                      canStripe ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setMethod('CASH')}
                      className={
                        method === 'CASH'
                          ? 'bg-primary text-on-primary flex items-center justify-center gap-2 rounded-xl py-3.5 shadow-sm transition-all'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center gap-2 rounded-xl py-3.5 transition-colors'
                      }
                    >
                      <BanknoteIcon className="size-5" />
                      <span className="font-label-caps text-label-caps font-bold tracking-widest uppercase">
                        {tPayment('CASH')}
                      </span>
                    </button>
                    {canStripe ? (
                      <button
                        type="button"
                        onClick={() => setMethod('STRIPE')}
                        className={
                          method === 'STRIPE'
                            ? 'bg-primary text-on-primary flex items-center justify-center gap-2 rounded-xl py-3.5 shadow-sm transition-all'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center gap-2 rounded-xl py-3.5 transition-colors'
                        }
                      >
                        <CreditCardIcon className="size-5" />
                        <span className="font-label-caps text-label-caps font-bold tracking-widest uppercase">
                          {tPayment('STRIPE')}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {method === 'CASH' ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="amountReceived"
                        className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase"
                      >
                        {t('payment.bulletReceived')}
                      </Label>
                      <span
                        className={
                          changeAmount !== null && changeAmount >= 0
                            ? 'text-success font-label-numeric text-label-numeric font-bold tabular-nums'
                            : 'text-on-surface-variant font-label-numeric text-label-numeric tabular-nums'
                        }
                      >
                        {t('payment.changeShort', {
                          amount: formatCost(
                            changeAmount !== null && changeAmount >= 0
                              ? changeAmount
                              : 0,
                            locale,
                            tCommon('currency')
                          ),
                        })}
                      </span>
                    </div>
                    <Input
                      id="amountReceived"
                      value={amountReceived}
                      onChange={(event) => setAmountReceived(event.target.value)}
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-11 bg-surface-container font-label-numeric text-label-numeric text-base shadow-none tabular-nums"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      {quickAmounts.map((amount) => {
                        const raw = String(amount).replace('.', ',');
                        const isActive = amountReceived === raw;
                        const isExact =
                          amount === Math.round(cartTotal * 100) / 100;
                        return (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setAmountReceived(raw)}
                            className={
                              isActive
                                ? 'bg-primary-container text-on-primary font-label-numeric text-label-numeric rounded-lg py-2.5 font-bold tabular-nums shadow-xs'
                                : 'bg-surface-container text-on-surface hover:bg-surface-container-high font-label-numeric text-label-numeric rounded-lg py-2.5 font-medium tabular-nums transition-colors'
                            }
                          >
                            {isExact
                              ? t('payment.exact')
                              : formatCost(amount, locale, tCommon('currency'))}
                          </button>
                        );
                      })}
                    </div>
                    {amountReceived !== '' &&
                      (receivedAmount === null ||
                        Number.isNaN(receivedAmount)) && (
                        <p className="text-destructive font-label-md text-label-md">
                          {t('payment.amountInvalid')}
                        </p>
                      )}
                    {receivedAmount !== null &&
                      !Number.isNaN(receivedAmount) &&
                      changeAmount !== null &&
                      changeAmount < 0 && (
                        <p className="text-destructive font-label-md text-label-md font-semibold">
                          {t('payment.amountInsufficient')}
                        </p>
                      )}
                  </div>
                ) : (
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    {t('payment.stripeNotice')}
                  </p>
                )}

                {activeState?.errors?.form?.map((e) => (
                  <p
                    key={e}
                    className="bg-destructive/10 text-destructive rounded-md px-3 py-2 font-body-sm text-body-sm"
                  >
                    {e}
                  </p>
                ))}
                {activeState?.errors?.items?.map((e) => (
                  <p
                    key={e}
                    className="bg-destructive/10 text-destructive rounded-md px-3 py-2 font-body-sm text-body-sm"
                  >
                    {e}
                  </p>
                ))}
                {activeState?.errors?.tableId?.map((e) => (
                  <p
                    key={e}
                    className="bg-destructive/10 text-destructive rounded-md px-3 py-2 font-body-sm text-body-sm"
                  >
                    {e}
                  </p>
                ))}
                {activeState?.errors?.amountReceived?.map((e) => (
                  <p
                    key={e}
                    className="bg-destructive/10 text-destructive rounded-md px-3 py-2 font-body-sm text-body-sm"
                  >
                    {e}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-outline-variant/40 border-t p-4">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-14 w-full rounded-2xl font-label-md text-label-md font-bold uppercase tracking-widest shadow-md active:scale-[0.98]"
              >
                {viewPending ? (
                  t('submit.recording')
                ) : method === 'CASH' ? (
                  <>
                    <PrinterIcon className="size-4" />
                    {t('submit.cashPrint')}
                  </>
                ) : (
                  t('submit.card')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
