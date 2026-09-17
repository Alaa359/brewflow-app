import {
  BanknoteIcon,
  ReceiptTextIcon,
  ShoppingBasketIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatCurrency, formatNumber } from '@/lib/i18n/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export type KpiCardsProps = {
  revenue: number;
  orderCount: number;
  averageBasket: number;
};

export async function KpiCards({
  revenue,
  orderCount,
  averageBasket,
}: KpiCardsProps) {
  const t = await getTranslations('Dashboard.kpi');
  const tCommon = await getTranslations('Common');
  const locale = await getLocale();

  const items = [
    {
      label: t('revenue.label'),
      value: formatCurrency(revenue, locale, tCommon('currency')),
      description: t('revenue.description'),
      Icon: BanknoteIcon,
    },
    {
      label: t('orders.label'),
      value: formatNumber(orderCount, locale),
      description: t('orders.description', { count: orderCount }),
      Icon: ReceiptTextIcon,
    },
    {
      label: t('averageBasket.label'),
      value: formatCurrency(averageBasket, locale, tCommon('currency')),
      description: t('averageBasket.description'),
      Icon: ShoppingBasketIcon,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <item.Icon className="size-4" />
              {item.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
              {item.value}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
