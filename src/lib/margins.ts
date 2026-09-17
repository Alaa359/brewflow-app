import { formatNumber } from '@/lib/i18n/format';

export function roundMoney(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export type MarginLine = {
  quantityNeeded: number;
  costPerUnit: number;
};

export function computeMargins(
  price: number,
  lines: MarginLine[]
): { cost: number; margin: number; marginPercent: number | null } {
  const cost = roundMoney(
    lines.reduce((sum, line) => sum + line.quantityNeeded * line.costPerUnit, 0)
  );
  const margin = roundMoney(price - cost);
  const marginPercent =
    lines.length === 0 ? null : Math.round((margin / price) * 100);
  return { cost, margin, marginPercent };
}

export function formatPercent(value: number, locale = 'fr'): string {
  return `${formatNumber(value, locale, { maximumFractionDigits: 0 })} %`;
}

export function marginColorClass(percent: number | null): string {
  if (percent === null) return 'text-muted-foreground';
  if (percent >= 40) return 'text-emerald-600';
  if (percent >= 0) return 'text-amber-600';
  return 'text-destructive';
}
