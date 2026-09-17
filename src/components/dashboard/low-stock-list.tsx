import { AlertTriangleIcon } from 'lucide-react';
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

export function LowStockList({
  ingredients,
}: {
  ingredients: LowStockIngredient[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="text-muted-foreground size-4" />
          Ingrédients sous le seuil
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ingredients.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun ingrédient sous le seuil.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrédient</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Seuil</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.name}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(ingredient.currentStock, ingredient.unit)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(ingredient.minThreshold, ingredient.unit)}
                  </TableCell>
                  <TableCell>
                    {ingredient.currentStock <= 0 ? (
                      <Badge variant="destructive">Rupture</Badge>
                    ) : (
                      <Badge variant="outline">Sous le seuil</Badge>
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
