import { DEFAULT_CURRENCY_LABEL, formatDecimal } from '@/lib/i18n/format';

export const UNIT_LABEL: Record<string, string> = {
  KG: 'kg',
  L: 'L',
  PIECE: 'pièce',
};

export function formatQuantity(
  value: number,
  unit?: string,
  locale = 'fr',
  unitLabel?: string
): string {
  const formatted = formatDecimal(value, locale);
  if (!unit) return formatted;
  return `${formatted} ${unitLabel ?? UNIT_LABEL[unit] ?? unit}`;
}

export function formatCost(
  value: number,
  locale = 'fr',
  currencyLabel: string = DEFAULT_CURRENCY_LABEL
): string {
  return `${formatDecimal(value, locale)} ${currencyLabel}`;
}
