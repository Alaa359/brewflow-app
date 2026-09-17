import { DownloadIcon } from 'lucide-react';
import { formatCost, formatQuantity } from '@/lib/ingredients';
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

export function ReportsView({
  report,
  downloadHref,
}: {
  report: ReportData;
  downloadHref: string;
}) {
  const { totals } = report;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1 sm:grid-cols-3">
          <p className="text-muted-foreground text-sm">
            Articles vendus ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {totals.itemCount}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            Espèces ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {formatCost(totals.cashRevenue)}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            Carte ·{' '}
            <span className="text-foreground font-medium tabular-nums">
              {formatCost(totals.cardRevenue)}
            </span>
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={downloadHref}>
            <DownloadIcon />
            Télécharger le PDF
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
            <CardTitle>Chiffre d’affaires par catégorie</CardTitle>
            <CardDescription>Répartition des ventes encaissées</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">CA</TableHead>
                  <TableHead className="text-right">Part</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      Aucune vente sur la période.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.categories.map((category) => (
                    <TableRow key={category.categoryName}>
                      <TableCell className="font-medium">
                        {category.categoryName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {category.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCost(category.revenue)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right tabular-nums">
                        {category.sharePercent} %
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
            <CardTitle>Réapprovisionnements</CardTitle>
            <CardDescription>
              {report.restockEntryCount} entrée
              {report.restockEntryCount > 1 ? 's' : ''} sur la période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrédient</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Entrées</TableHead>
                  <TableHead>Fournisseurs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.restock.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      Aucun réapprovisionnement sur la période.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.restock.map((line) => (
                    <TableRow key={line.ingredientName}>
                      <TableCell className="font-medium">
                        {line.ingredientName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatQuantity(line.quantityAdded, line.unit)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.entryCount}
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
          <CardTitle>Chiffre d’affaires & marge par plat</CardTitle>
          <CardDescription>
            Marge calculée sur les coûts actuels des ingrédients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plat</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Coût</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-right">Marge %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.dishes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground text-center"
                  >
                    Aucune vente sur la période.
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
                    <TableCell className="text-right tabular-nums">
                      {dish.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCost(dish.revenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCost(dish.cost)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCost(dish.margin)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${marginColorClass(
                        dish.marginPercent
                      )}`}
                    >
                      {dish.marginPercent === null
                        ? '—'
                        : formatPercent(dish.marginPercent)}
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
          <CardTitle>Détail des réapprovisionnements</CardTitle>
          <CardDescription>
            {report.restockEntryCount > report.restockEntries.length
              ? `${report.restockEntries.length} plus récents sur ${report.restockEntryCount}`
              : `${report.restockEntryCount} entrée${
                  report.restockEntryCount > 1 ? 's' : ''
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ingrédient</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Saisi par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.restockEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center"
                  >
                    Aucun réapprovisionnement sur la période.
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
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(entry.quantityAdded, entry.unit)}
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
