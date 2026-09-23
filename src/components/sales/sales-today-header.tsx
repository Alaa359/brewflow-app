import { getLocale, getTranslations } from 'next-intl/server';
import { formatCost } from '@/lib/ingredients';

export type SalesKpis = {
  revenue: number;
  tickets: number;
  cash: number;
  card: number;
};

export async function SalesTodayHeader({ kpis }: { kpis: SalesKpis }) {
  const t = await getTranslations('Pos');
  const tCommon = await getTranslations('Common');
  const locale = await getLocale();
  const currency = tCommon('currency');

  const items = [
    { label: t('kpi.revenue'), value: formatCost(kpis.revenue, locale, currency) },
    { label: t('kpi.tickets'), value: String(kpis.tickets) },
    { label: t('kpi.cash'), value: formatCost(kpis.cash, locale, currency) },
    { label: t('kpi.card'), value: formatCost(kpis.card, locale, currency) },
  ];

  return (
    <section
      aria-label={t('kpi.ariaLabel')}
      className="bg-surface-container-low grid grid-cols-2 gap-3 rounded-xl border p-4 shadow-sm sm:grid-cols-4"
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-medium">
            {item.label}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
    </section>
  );
}
