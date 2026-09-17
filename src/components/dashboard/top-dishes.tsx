import { TrophyIcon } from 'lucide-react';
import { formatCost } from '@/lib/ingredients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TopDish = {
  name: string;
  quantity: number;
  revenue: number;
};

export function TopDishes({ dishes }: { dishes: TopDish[] }) {
  const maxQuantity = Math.max(...dishes.map((dish) => dish.quantity), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="text-muted-foreground size-4" />
          Top plats vendus
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {dishes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune vente sur cette période.
          </p>
        ) : (
          dishes.map((dish, index) => (
            <div key={dish.name} className="flex items-center gap-3">
              <span className="text-muted-foreground w-5 shrink-0 text-right text-sm tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{dish.name}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {dish.quantity} · {formatCost(dish.revenue)}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${(dish.quantity / maxQuantity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
