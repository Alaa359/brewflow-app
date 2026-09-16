'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatQuantity, UNIT_LABEL } from '@/lib/ingredients';
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
  return (
    <div className="rounded-xl border">
      <div className="flex flex-col gap-1 border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Historique des entrées de stock
        </h2>
        <p className="text-muted-foreground text-xs">
          {total} entrée{total > 1 ? 's' : ''}
          {total > 0 ? ' — réapprovisionnement des ingrédients ' : ''}
          {total > entries.length
            ? `(affichage des ${entries.length} plus récentes)`
            : ''}
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground h-20 px-4 py-6 text-sm">
          Aucune entrée de stock pour le moment. Utilisez le bouton «&nbsp;
          Réapprovisionner&nbsp;» sur un ingrédient.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ingrédient</TableHead>
              <TableHead className="text-right">Quantité ajoutée</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Par</TableHead>
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
                    ({UNIT_LABEL[entry.unit] ?? entry.unit})
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  +{formatQuantity(entry.quantityAdded, entry.unit)}
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
