'use client';

import { useActionState, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Unit } from '@/generated/client';
import { saveRecipe } from '@/actions/recipes';
import { formatCost } from '@/lib/ingredients';
import { computeMargins, formatPercent, marginColorClass } from '@/lib/margins';

export type RecipeIngredientOption = {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit: number;
};

export type RecipeLineRow = {
  ingredientId: string;
  ingredientName: string;
  unit: Unit;
  quantityNeeded: number;
  costPerUnit: number;
};

type EditableRow = {
  ingredientId: string;
  unit: Unit;
  costPerUnit: number;
  quantity: string;
};

function parseQuantity(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 999.999) return null;
  return Math.round(n * 1000) / 1000;
}

export function RecipeEditor({
  dishId,
  price,
  recipe,
  ingredients,
}: {
  dishId: string;
  price: number;
  recipe: RecipeLineRow[];
  ingredients: RecipeIngredientOption[];
}) {
  const [state, formAction, pending] = useActionState(
    saveRecipe.bind(null, dishId),
    undefined
  );
  const t = useTranslations('Dishes.recipe');
  const tCommon = useTranslations('Common');
  const tUnits = useTranslations('Units');
  const locale = useLocale();
  const [rows, setRows] = useState<EditableRow[]>(() =>
    recipe.map((line) => ({
      ingredientId: line.ingredientId,
      unit: line.unit,
      costPerUnit: line.costPerUnit,
      quantity: String(line.quantityNeeded),
    }))
  );

  function setRow(index: number, patch: Partial<EditableRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      { ingredientId: '', unit: 'KG', costPerUnit: 0, quantity: '' },
    ]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  function setIngredient(index: number, ingredientId: string) {
    const option = ingredients.find((i) => i.id === ingredientId);
    setRow(index, {
      ingredientId,
      unit: option?.unit ?? 'KG',
      costPerUnit: option?.costPerUnit ?? 0,
    });
  }

  const validLines = useMemo(
    () =>
      rows
        .map((row) => {
          const quantity = parseQuantity(row.quantity);
          return row.ingredientId && quantity !== null
            ? { ingredientId: row.ingredientId, quantityNeeded: quantity }
            : null;
        })
        .filter(
          (line): line is { ingredientId: string; quantityNeeded: number } =>
            line !== null
        ),
    [rows]
  );

  const margins = useMemo(() => {
    const costLines = validLines
      .map((line) => {
        const row = rows.find((r) => r.ingredientId === line.ingredientId);
        return row
          ? {
              quantityNeeded: line.quantityNeeded,
              costPerUnit: row.costPerUnit,
            }
          : null;
      })
      .filter(
        (line): line is { quantityNeeded: number; costPerUnit: number } =>
          line !== null
      );
    return computeMargins(price, costLines);
  }, [validLines, rows, price]);

  function lineCost(row: EditableRow): number | null {
    const quantity = parseQuantity(row.quantity);
    if (!row.ingredientId || quantity === null) return null;
    return Math.round(quantity * row.costPerUnit * 1000) / 1000;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="lines" value={JSON.stringify(validLines)} />

      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pe-1">
        {rows.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('emptyIngredients')}
          </p>
        )}

        {rows.map((row, index) => {
          const options = ingredients.filter(
            (option) =>
              option.id === row.ingredientId ||
              !rows.some((r, i) => i !== index && r.ingredientId === option.id)
          );
          const cost = lineCost(row);
          return (
            <div
              key={index}
              className="grid grid-cols-[1fr_5rem_4rem_auto] items-center gap-2"
            >
              <Select
                value={row.ingredientId}
                onValueChange={(v) => setIngredient(index, v)}
              >
                <SelectTrigger aria-label={t('ingredientN', { n: index + 1 })}>
                  <SelectValue placeholder={t('chooseIngredient')} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} ({tUnits(option.unit)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                inputMode="decimal"
                placeholder={t('qty')}
                aria-label={t('quantityN', { n: index + 1 })}
                value={row.quantity}
                onChange={(e) => setRow(index, { quantity: e.target.value })}
              />
              <span className="text-muted-foreground text-end text-xs">
                {cost !== null
                  ? formatCost(cost, locale, tCommon('currency'))
                  : '—'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('removeLine', { n: index + 1 })}
                onClick={() => removeRow(index)}
              >
                <Trash2Icon />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={ingredients.length === 0}
        onClick={addRow}
      >
        <PlusIcon />
        {t('addIngredient')}
      </Button>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('costPrice')}</span>
          <span className="font-medium">
            {formatCost(margins.cost, locale, tCommon('currency'))}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('grossMargin')}</span>
          <span className={marginColorClass(margins.marginPercent)}>
            {formatCost(margins.margin, locale, tCommon('currency'))}
            {margins.marginPercent !== null &&
              ` · ${formatPercent(margins.marginPercent, locale)}`}
          </span>
        </div>
      </div>

      {state?.errors?.form?.map((e) => (
        <p
          key={e}
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
        >
          {e}
        </p>
      ))}

      {state?.success && (
        <p className="text-success rounded-md px-3 py-2 text-xs">
          {t('saved')}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t('saving') : t('saveRecipe')}
      </Button>
    </form>
  );
}
