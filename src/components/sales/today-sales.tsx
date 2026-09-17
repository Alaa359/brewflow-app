import { OrderStatus, PaymentMethod } from '@/generated/client';
import { PrinterIcon } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
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
  items: TodayOrderItem[];
};

export async function TodaySales({ orders }: { orders: TodayOrder[] }) {
  const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const t = await getTranslations('Orders');
  const tCommon = await getTranslations('Common');
  const tStatus = await getTranslations('OrderStatus');
  const tPayment = await getTranslations('PaymentMethod');
  const locale = await getLocale();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {t('today.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('today.summary', {
            count: orders.length,
            revenue: formatCost(revenue, locale, tCommon('currency')),
          })}
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.time')}</TableHead>
              <TableHead>{t('columns.detail')}</TableHead>
              <TableHead className="text-right">{t('columns.total')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.method')}</TableHead>
              <TableHead className="w-16">{t('columns.ticket')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-20 text-center"
                >
                  {t('today.empty')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="tabular-nums">
                    {formatTime(order.createdAt, locale)}
                  </TableCell>
                  <TableCell className="max-w-72">
                    {order.items
                      .map((item) => `${item.quantity} × ${item.dishName}`)
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
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
