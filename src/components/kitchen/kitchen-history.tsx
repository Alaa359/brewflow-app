import { getLocale, getTranslations } from 'next-intl/server';
import { formatTime } from '@/lib/sales';
import { formatCost } from '@/lib/ingredients';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type HistoryOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  totalAmount: number;
  items: { dishName: string; quantity: number }[];
};

export async function KitchenHistory({
  orders,
  establishmentName,
}: {
  orders: HistoryOrder[];
  establishmentName: string;
}) {
  const t = await getTranslations('Kitchen');
  const tCommon = await getTranslations('Common');
  const locale = await getLocale();
  const currency = tCommon('currency');
  const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('history.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('history.subtitle', { name: establishmentName })}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          {t('history.summary', {
            count: orders.length,
            revenue: formatCost(revenue, locale, currency),
          })}
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('history.columns.time')}</TableHead>
              <TableHead>{t('history.columns.table')}</TableHead>
              <TableHead>{t('history.columns.detail')}</TableHead>
              <TableHead className="text-end">
                {t('history.columns.total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-20 text-center"
                >
                  {t('history.empty')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="tabular-nums">
                    {formatTime(order.createdAt, locale)}
                  </TableCell>
                  <TableCell>
                    {t('tableNumber', { number: order.tableNumber })}
                    {order.tableZone ? ` · ${order.tableZone}` : ''}
                  </TableCell>
                  <TableCell className="max-w-72">
                    {order.items
                      .map((item) => `${item.quantity} × ${item.dishName}`)
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatCost(order.totalAmount, locale, currency)}
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
