import {
  BanknoteIcon,
  ReceiptTextIcon,
  ShoppingBasketIcon,
} from 'lucide-react';
import { formatCost } from '@/lib/ingredients';
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

export function KpiCards({
  revenue,
  orderCount,
  averageBasket,
}: KpiCardsProps) {
  const items = [
    {
      label: 'Chiffre d’affaires',
      value: formatCost(revenue),
      description: 'Ventes encaissées',
      Icon: BanknoteIcon,
    },
    {
      label: 'Commandes',
      value: String(orderCount),
      description:
        orderCount > 1
          ? 'Toutes encaissées'
          : orderCount === 1
            ? 'Vente encaissée'
            : 'Aucune vente',
      Icon: ReceiptTextIcon,
    },
    {
      label: 'Panier moyen',
      value: formatCost(averageBasket),
      description: 'Par commande',
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
