'use client';

import { PackageOpenIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { formatQuantity } from '@/lib/ingredients';
import type { Unit } from '@/generated/client';

export type StockEntryRow = {
  id: string;
  dateLabel: string;
  quantityAdded: number;
  supplierName: string | null;
  ingredientName: string;
  unit: Unit;
  userName: string;
};

export function StockEntriesHistory({
  entries,
  total,
}: {
  entries: StockEntryRow[];
  total: number;
}) {
  const t = useTranslations('Stock');
  const tUnits = useTranslations('Units');
  const locale = useLocale();

  return (
    <div className="rounded-xl border">
      <div className="flex flex-col gap-1 border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">
          {t('entries.title')}
        </h2>
        <p className="text-muted-foreground text-xs">
          {t('entries.count', { count: total })}
          {total > 0 ? t('entries.restockNote') : ''}
          {total > entries.length
            ? t('entries.showingRecent', { count: entries.length })
            : ''}
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={PackageOpenIcon} title={t('entries.empty')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('entries.table.date')}</TableHead>
              <TableHead>{t('entries.table.ingredient')}</TableHead>
              <TableHead className="text-end">
                {t('entries.table.quantityAdded')}
              </TableHead>
              <TableHead>{t('entries.table.supplier')}</TableHead>
              <TableHead>{t('entries.table.by')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {entry.dateLabel}
                </TableCell>
                <TableCell className="font-medium">
                  {entry.ingredientName}{' '}
                  <span className="text-muted-foreground">
                    ({tUnits(entry.unit) ?? entry.unit})
                  </span>
                </TableCell>
                <TableCell className="text-end font-medium">
                  +
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
