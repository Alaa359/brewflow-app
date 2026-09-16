export const UNIT_LABEL: Record<string, string> = {
  KG: 'kg',
  L: 'L',
  PIECE: 'pièce',
};

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 3,
});

export function formatQuantity(value: number, unit?: string): string {
  const formatted = numberFormatter.format(value);
  return unit ? `${formatted} ${UNIT_LABEL[unit] ?? unit}` : formatted;
}

export function formatCost(value: number): string {
  return `${numberFormatter.format(value)} DT`;
}
