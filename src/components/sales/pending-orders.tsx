'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { OrderStatus, PaymentMethod } from '@/generated/client';
import { HourglassIcon, ReceiptTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { advanceOrderStatus, settlePendingOrder } from '@/actions/order-status';
import { formatTime } from '@/lib/sales';
import { formatCost } from '@/lib/ingredients';

export type PendingOrderItem = { dishName: string; quantity: number };

export type PendingOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  fromClient: boolean;
  nextStatus: OrderStatus | null;
  items: PendingOrderItem[];
};

const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  EN_ATTENTE: 'destructive',
  CONFIRMEE: 'secondary',
  EN_PREPARATION: 'default',
  PRETE: 'outline',
  PAYEE: 'outline',
};

export function PendingOrders({ orders }: { orders: PendingOrder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reflect, setReflect] = useState<PendingOrder | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Orders');
  const tCommon = useTranslations('Common');
  const tStatus = useTranslations('OrderStatus');
  const locale = useLocale();

  function actionLabel(next: OrderStatus): string {
    if (next === 'CONFIRMEE') return tCommon('actions.confirm');
    if (next === 'EN_PREPARATION') return tStatus('EN_PREPARATION');
    if (next === 'PRETE') return tStatus('PRETE');
    return tStatus(next);
  }

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(timer);
  }, [router]);

  function advance(order: PendingOrder, status: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('orderId', order.id);
      formData.set('status', status);
      const result = await advanceOrderStatus(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? t('updatedToast'));
        router.refresh();
      } else {
        toast.error(result?.message ?? t('actionImpossibleToast'));
        setError(result?.errors?.form?.[0] ?? null);
      }
    });
  }

  function openSettle(order: PendingOrder) {
    setReflect(order);
    setAmount(String(order.totalAmount).replace('.', ','));
    setError(null);
  }

  function settle() {
    if (!reflect) return;
    const formData = new FormData();
    formData.set('orderId', reflect.id);
    formData.set('amountReceived', amount);
    startTransition(async () => {
      const result = await settlePendingOrder(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? t('settledToast'));
        setReflect(null);
        router.refresh();
      } else {
        const message =
          result?.errors?.amountReceived?.[0] ??
          result?.errors?.form?.[0] ??
          t('settleImpossibleToast');
        setError(message);
        toast.error(result?.message ?? t('settleImpossibleToast'));
      }
    });
  }

  const receivedNumber = Number.parseFloat(amount.replace(',', '.'));
  const change =
    reflect && !Number.isNaN(receivedNumber)
      ? receivedNumber - reflect.totalAmount
      : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <HourglassIcon className="size-4" />
          {t('pending.title')}
          {orders.length > 0 && (
            <span className="bg-destructive rounded-full px-2 py-0.5 text-xs text-white">
              {orders.length}
            </span>
          )}
        </h2>
        <p className="text-muted-foreground text-sm">{t('pending.subtitle')}</p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.time')}</TableHead>
              <TableHead>{t('columns.table')}</TableHead>
              <TableHead>{t('columns.detail')}</TableHead>
              <TableHead className="text-end">{t('columns.total')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead className="w-40">{t('columns.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-20 text-center"
                >
                  {t('pending.empty')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const next = order.nextStatus;
                const settleable = order.status === 'PRETE';
                return (
                  <TableRow key={order.id}>
                    <TableCell className="tabular-nums">
                      {formatTime(order.createdAt, locale)}
                    </TableCell>
                    <TableCell>
                      {t('pending.tableNumber', {
                        number: order.tableNumber,
                      })}
                      {order.tableZone ? ` — ${order.tableZone}` : ''}
                      {order.fromClient && (
                        <Badge variant="secondary" className="ms-2">
                          {t('pending.clientBadge')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-72">
                      {order.items
                        .map((item) => `${item.quantity} × ${item.dishName}`)
                        .join(', ')}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCost(
                        order.totalAmount,
                        locale,
                        tCommon('currency')
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {tStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {settleable ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPending}
                          onClick={() => openSettle(order)}
                        >
                          <ReceiptTextIcon className="size-3.5" />
                          {t('pending.settle.button')}
                        </Button>
                      ) : next ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => advance(order, next)}
                        >
                          {actionLabel(next)}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs">
          {error}
        </p>
      )}

      <Dialog
        open={reflect !== null}
        onOpenChange={(open) => {
          if (!open) setReflect(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('pending.settle.title', {
                number: reflect?.tableNumber ?? '',
              })}
            </DialogTitle>
            <DialogDescription>
              {reflect
                ? t('pending.settle.description', {
                    amount: formatCost(
                      reflect.totalAmount,
                      locale,
                      tCommon('currency')
                    ),
                  })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amountReceived">
              {t('pending.settle.amountReceived')}
            </Label>
            <Input
              id="amountReceived"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
            {change !== null && (
              <p
                className={
                  change >= 0
                    ? 'text-xs font-medium text-emerald-600'
                    : 'text-destructive text-xs font-medium'
                }
              >
                {change >= 0
                  ? t('pending.settle.change', {
                      amount: formatCost(change, locale, tCommon('currency')),
                    })
                  : t('pending.settle.amountInsufficient')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReflect(null)}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type="button"
              disabled={isPending || change === null || change < 0}
              onClick={settle}
            >
              {isPending
                ? t('pending.settle.recording')
                : t('pending.settle.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
