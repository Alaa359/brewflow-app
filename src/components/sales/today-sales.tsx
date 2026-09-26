'use client';

import { useState } from 'react';
import type { OrderStatus, PaymentMethod } from '@/generated/client';
import { PrinterIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatTime } from '@/lib/sales';
import { formatCost } from '@/lib/ingredients';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type TodayOrderItem = { dishName: string; quantity: number };

export type TodayOrder = {
  id: string;
  createdAt: Date;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  userId: string | null;
  items: TodayOrderItem[];
};

export function TodaySales({
  orders,
  currentUserId,
  timezone,
}: {
  orders: TodayOrder[];
  currentUserId?: string | null;
  timezone?: string;
}) {
  const [onlyMine, setOnlyMine] = useState(false);
  const t = useTranslations('Orders');
  const tCommon = useTranslations('Common');
  const tStatus = useTranslations('OrderStatus');
  const tPayment = useTranslations('PaymentMethod');
  const locale = useLocale();

  const visible =
    onlyMine && currentUserId
      ? orders.filter((order) => order.userId === currentUserId)
      : orders;
  const revenue = visible.reduce((acc, order) => acc + order.totalAmount, 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
          {t('today.title')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('today.summary', {
              count: visible.length,
              revenue: formatCost(revenue, locale, tCommon('currency')),
            })}
          </p>
          {currentUserId && (
            <div
              role="group"
              aria-label={t('today.filterAria')}
              className="bg-surface-container flex rounded-lg p-0.5"
            >
              <button
                type="button"
                aria-pressed={!onlyMine}
                onClick={() => setOnlyMine(false)}
                className={`font-label-md text-label-md rounded-md px-2.5 py-1 font-medium transition-colors ${
                  onlyMine
                    ? 'text-on-surface-variant'
                    : 'bg-surface-container-lowest text-on-surface shadow-sm'
                }`}
              >
                {t('today.filterAll')}
              </button>
              <button
                type="button"
                aria-pressed={onlyMine}
                onClick={() => setOnlyMine(true)}
                className={`font-label-md text-label-md rounded-md px-2.5 py-1 font-medium transition-colors ${
                  onlyMine
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                {t('today.filterMine')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/60 hover:bg-surface-container-low/60">
              <TableHead className="font-label-md text-label-md text-on-surface-variant">
                {t('columns.time')}
              </TableHead>
              <TableHead className="font-label-md text-label-md text-on-surface-variant">
                {t('columns.detail')}
              </TableHead>
              <TableHead className="font-label-md text-label-md text-end text-on-surface-variant">
                {t('columns.total')}
              </TableHead>
              <TableHead className="font-label-md text-label-md text-on-surface-variant">
                {t('columns.status')}
              </TableHead>
              <TableHead className="font-label-md text-label-md text-on-surface-variant">
                {t('columns.method')}
              </TableHead>
              <TableHead className="font-label-md text-label-md w-16 text-on-surface-variant">
                {t('columns.ticket')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-20 text-center"
                >
                  {t('today.empty')}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="tabular-nums">
                    {formatTime(order.createdAt, locale, timezone)}
                  </TableCell>
                  <TableCell className="max-w-72">
                    {order.items
                      .map((item) => `${item.quantity} × ${item.dishName}`)
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatCost(order.totalAmount, locale, tCommon('currency'))}
                  </TableCell>
                  <TableCell>{tStatus(order.status)}</TableCell>
                  <TableCell>
                    {order.paymentMethod ? tPayment(order.paymentMethod) : '—'}
                  </TableCell>
                  <TableCell>
                    {order.status === 'PAYEE' ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        asChild
                      >
                        <a
                          href={`/api/orders/${order.id}/ticket`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('today.reprintLabel')}
                        >
                          <PrinterIcon className="size-4" />
                        </a>
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
