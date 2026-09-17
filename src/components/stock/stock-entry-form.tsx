'use client';

import { useActionState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Unit } from '@/generated/client';
import type { StockEntryState } from '@/actions/stock-entries';
import { formatQuantity } from '@/lib/ingredients';

export function StockEntryForm({
  action,
  unit,
  currentStock,
  today,
  onSuccess,
}: {
  action: (
    prevState: StockEntryState,
    formData: FormData
  ) => Promise<StockEntryState>;
  unit: Unit;
  currentStock: number;
  today: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const t = useTranslations('Stock');
  const tUnits = useTranslations('Units');
  const locale = useLocale();

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {t('form.currentStock')}{' '}
        <span className="text-foreground font-medium">
          {formatQuantity(currentStock, unit, locale, tUnits(unit))}
        </span>
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantityAdded">
          {t('form.quantityAdded', { unit: tUnits(unit) })}
        </Label>
        <Input
          id="quantityAdded"
          name="quantityAdded"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder={t('form.quantityPlaceholder', {
            quantity: formatQuantity(1, unit, locale, tUnits(unit)),
          })}
          aria-invalid={!!state?.errors?.quantityAdded}
        />
        {state?.errors?.quantityAdded?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="supplierName">{t('form.supplierName')}</Label>
        <Input
          id="supplierName"
          name="supplierName"
          type="text"
          placeholder={t('form.supplierPlaceholder')}
          aria-invalid={!!state?.errors?.supplierName}
        />
        {state?.errors?.supplierName?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">{t('form.date')}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={today}
          aria-invalid={!!state?.errors?.date}
        />
        {state?.errors?.date?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      {state?.errors?.form?.map((e) => (
        <p
          key={e}
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
        >
          {e}
        </p>
      ))}

      <Button type="submit" disabled={pending}>
        {pending ? t('form.saving') : t('form.addStock')}
      </Button>
    </form>
  );
}
