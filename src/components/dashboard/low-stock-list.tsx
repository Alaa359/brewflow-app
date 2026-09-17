import { AlertTriangleIcon } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatQuantity } from '@/lib/ingredients';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type LowStockIngredient = {
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
};

export async function LowStockList({
  ingredients,
}: {
  ingredients: LowStockIngredient[];
}) {
  const t = await getTranslations('Dashboard.lowStock');
  const tUnits = await getTranslations('Units');
  const locale = await getLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="text-muted-foreground size-4" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ingredients.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.ingredient')}</TableHead>
                <TableHead className="text-right">
                  {t('columns.stock')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.threshold')}
                </TableHead>
                <TableHead>{t('columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.name}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(
                      ingredient.currentStock,
                      ingredient.unit,
                      locale,
                      tUnits(ingredient.unit)
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(
                      ingredient.minThreshold,
                      ingredient.unit,
                      locale,
                      tUnits(ingredient.unit)
                    )}
                  </TableCell>
                  <TableCell>
                    {ingredient.currentStock <= 0 ? (
                      <Badge variant="destructive">
                        {t('badges.outOfStock')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {t('badges.belowThreshold')}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
