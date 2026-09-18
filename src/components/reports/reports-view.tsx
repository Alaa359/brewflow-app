import { DownloadIcon } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatCurrency, formatNumber } from '@/lib/i18n/format';
import { formatQuantity } from '@/lib/ingredients';
import { formatPercent, marginColorClass } from '@/lib/margins';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import type { ReportData } from '@/lib/reports';

export async function ReportsView({
  report,
  downloadHref,
}: {
  report: ReportData;
  downloadHref: string;
}) {
  const t = await getTranslations('Reports');
  const tCommon = await getTranslations('Common');
  const tPay = await getTranslations('PaymentMethod');
  const tUnits = await getTranslations('Units');
  const locale = await getLocale();
  const { totals } = report;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1 sm:grid-cols-3">
          <p className="text-muted-foreground text-sm">
            {t('summary.items')} ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {formatNumber(totals.itemCount, locale)}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {tPay('CASH')} ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {formatCurrency(totals.cashRevenue, locale, tCommon('currency'))}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {tPay('STRIPE')} ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {formatCurrency(totals.cardRevenue, locale, tCommon('currency'))}
            </span>
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={downloadHref}>
            <DownloadIcon />
            {t('downloadPdf')}
          </a>
        </Button>
      </div>

      <KpiCards
        revenue={totals.revenue}
        orderCount={totals.orderCount}
        averageBasket={totals.averageBasket}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('categories.title')}</CardTitle>
            <CardDescription>{t('categories.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.category')}</TableHead>
                  <TableHead className="text-end">
                    {t('columns.quantity')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('columns.revenue')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('columns.share')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      {t('categories.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  report.categories.map((category) => (
                    <TableRow key={category.categoryName}>
                      <TableCell className="font-medium">
                        {category.categoryName}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatNumber(category.quantity, locale)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatCurrency(
                          category.revenue,
                          locale,
                          tCommon('currency')
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-end tabular-nums">
                        {formatPercent(category.sharePercent, locale)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('restock.title')}</CardTitle>
            <CardDescription>
              {t('restock.description', { count: report.restockEntryCount })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.ingredient')}</TableHead>
                  <TableHead className="text-end">
                    {t('columns.fullQuantity')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('columns.entries')}
                  </TableHead>
                  <TableHead>{t('columns.suppliers')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.restock.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      {t('restock.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  report.restock.map((line) => (
                    <TableRow key={line.ingredientName}>
                      <TableCell className="font-medium">
                        {line.ingredientName}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatQuantity(
                          line.quantityAdded,
                          line.unit,
                          locale,
                          tUnits(line.unit)
                        )}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatNumber(line.entryCount, locale)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {line.suppliers.length > 0
                          ? line.suppliers.join(', ')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dishes.title')}</CardTitle>
          <CardDescription>{t('dishes.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.dish')}</TableHead>
                <TableHead>{t('columns.category')}</TableHead>
                <TableHead className="text-end">
                  {t('columns.quantity')}
                </TableHead>
                <TableHead className="text-end">
                  {t('columns.revenue')}
                </TableHead>
                <TableHead className="text-end">{t('columns.cost')}</TableHead>
                <TableHead className="text-end">
                  {t('columns.margin')}
                </TableHead>
                <TableHead className="text-end">
                  {t('columns.marginPercent')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.dishes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground text-center"
                  >
                    {t('dishes.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                report.dishes.map((dish) => (
                  <TableRow key={dish.dishName}>
                    <TableCell className="font-medium">
                      {dish.dishName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dish.categoryName}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatNumber(dish.quantity, locale)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCurrency(
                        dish.revenue,
                        locale,
                        tCommon('currency')
                      )}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCurrency(dish.cost, locale, tCommon('currency'))}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCurrency(dish.margin, locale, tCommon('currency'))}
                    </TableCell>
                    <TableCell
                      className={`text-end tabular-nums ${marginColorClass(
                        dish.marginPercent
                      )}`}
                    >
                      {dish.marginPercent === null
                        ? '—'
                        : formatPercent(dish.marginPercent, locale)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('restockDetail.title')}</CardTitle>
          <CardDescription>
            {report.restockEntryCount > report.restockEntries.length
              ? t('restockDetail.recentCount', {
                  shown: report.restockEntries.length,
                  total: report.restockEntryCount,
                })
              : t('restockDetail.count', {
                  count: report.restockEntryCount,
                })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.date')}</TableHead>
                <TableHead>{t('columns.ingredient')}</TableHead>
                <TableHead className="text-end">
                  {t('columns.fullQuantity')}
                </TableHead>
                <TableHead>{t('columns.supplier')}</TableHead>
                <TableHead>{t('columns.enteredBy')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.restockEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center"
                  >
                    {t('restock.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                report.restockEntries.map((entry, index) => (
                  <TableRow key={`${entry.dateLabel}-${index}`}>
                    <TableCell className="tabular-nums">
                      {entry.dateLabel}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.ingredientName}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatQuantity(
                        entry.quantityAdded,
                        entry.unit,
                        locale,
                        tUnits(entry.unit)
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.supplierName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.userName}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
