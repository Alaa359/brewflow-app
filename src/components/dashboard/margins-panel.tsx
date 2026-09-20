import {
  CoinsIcon,
  TrendingUpIcon,
  UtensilsCrossedIcon,
  PackageOpenIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/i18n/format';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type DishMargin = {
  name: string;
  price: number;
  cost: number;
  margin: number;
  marginRate: number;
  quantity: number;
};

export type MarginsPanelProps = {
  dishes: DishMargin[];
  totalRevenue: number;
  totalCost: number;
};

export async function MarginsPanel({
  dishes,
  totalRevenue,
  totalCost,
}: MarginsPanelProps) {
  const t = await getTranslations('Dashboard.margins');
  const tCommon = await getTranslations('Common');
  const locale = await getLocale();
  const currency = tCommon('currency');

  const totalMargin = totalRevenue - totalCost;
  const marginRate = totalRevenue > 0 ? totalMargin / totalRevenue : 0;
  const profitable = dishes.filter((d) => d.margin > 0).length;

  const kpi = [
    {
      label: t('kpi.grossMargin.label'),
      value: formatCurrency(totalMargin, locale, currency),
      description: t('kpi.grossMargin.description'),
      Icon: CoinsIcon,
      chip: 'bg-chart-2/15 text-chart-2',
    },
    {
      label: t('kpi.marginRate.label'),
      value: formatPercent(marginRate, locale),
      description: t('kpi.marginRate.description'),
      Icon: TrendingUpIcon,
      chip: 'bg-chart-1/15 text-chart-1',
    },
    {
      label: t('kpi.lowMarginDishes.label'),
      value: formatNumber(dishes.length - profitable, locale),
      description: t('kpi.lowMarginDishes.description'),
      Icon: UtensilsCrossedIcon,
      chip: 'bg-chart-3/15 text-chart-3',
    },
    {
      label: t('kpi.materialCost.label'),
      value: formatCurrency(totalCost, locale, currency),
      description: t('kpi.materialCost.description'),
      Icon: PackageOpenIcon,
      chip: 'bg-chart-5/15 text-chart-5',
    },
  ];

  const ranked = [...dishes].sort((a, b) => b.margin - a.margin).slice(0, 5);

  return (
    <Card className="group/card">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {kpi.map(({ label, value, description, Icon, chip }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3"
            >
              <div className="flex items-center gap-2">
                <span className={`grid size-7 place-items-center rounded-md ${chip}`}>
                  <Icon className="size-3.5" />
                </span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
              <p className="font-heading text-lg font-semibold tracking-tight tabular-nums">
                {value}
              </p>
              <p className="text-muted-foreground text-xs">{description}</p>
            </div>
          ))}
        </div>

        {ranked.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs font-medium">
              {t('topDishesMargin')}
            </p>
            {ranked.map((dish) => (
              <div
                key={dish.name}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border bg-card px-2.5 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {dish.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(dish.margin, locale, currency)}{' '}
                    {t('marginPer', { count: dish.quantity })}
                  </span>
                </div>
                <Badge
                  variant={dish.marginRate >= 0.5 ? 'default' : 'secondary'}
                  className="shrink-0 tabular-nums"
                >
                  {formatPercent(dish.marginRate, locale)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
