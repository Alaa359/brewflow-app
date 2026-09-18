'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  PackagePlusIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createIngredient,
  deleteIngredient,
  updateIngredient,
} from '@/actions/ingredients';
import { createStockEntry } from '@/actions/stock-entries';
import { formatCost, formatQuantity } from '@/lib/ingredients';
import {
  IngredientForm,
  type IngredientFormDefaults,
} from '@/components/ingredients/ingredient-form';
import { StockEntryForm } from '@/components/stock/stock-entry-form';

export type IngredientRow = IngredientFormDefaults & {
  recipeCount: number;
};

function IngredientThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-md" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="bg-muted size-12 shrink-0 rounded-md object-cover"
    />
  );
}

export function IngredientsTable({
  ingredients,
  lowCount,
  error,
  today,
}: {
  ingredients: IngredientRow[];
  lowCount: number;
  error?: string;
  today: string;
}) {
  const router = useRouter();
  const t = useTranslations('Ingredients');
  const tCommon = useTranslations('Common');
  const tUnits = useTranslations('Units');
  const locale = useLocale();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IngredientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IngredientRow | null>(null);
  const [stockTarget, setStockTarget] = useState<IngredientRow | null>(null);

  const deleteOpen =
    deleteTarget !== null && ingredients.some((i) => i.id === deleteTarget.id);

  const errorMessage =
    error === 'recette' || error === 'recettes'
      ? t('deleteInRecipeError')
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('count', { count: ingredients.length })} ·{' '}
            {lowCount > 0 ? (
              <span className="text-destructive font-medium">
                {t('lowCount', { count: lowCount })}
              </span>
            ) : (
              t('noLowStock')
            )}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t('add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('newTitle')}</DialogTitle>
              <DialogDescription>{t('newDescription')}</DialogDescription>
            </DialogHeader>
            <IngredientForm
              action={createIngredient}
              onSuccess={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pe-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            onClick={() => router.replace('/ingredients')}
          >
            <XIcon />
            <span className="sr-only">{tCommon('actions.close')}</span>
          </Button>
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.photo')}</TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.unit')}</TableHead>
              <TableHead className="text-end">{t('table.stock')}</TableHead>
              <TableHead className="text-end">
                {t('table.minThreshold')}
              </TableHead>
              <TableHead className="text-end">{t('table.cost')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-end">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t('emptyTable')}
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ingredient) => {
                const low = ingredient.currentStock < ingredient.minThreshold;
                return (
                  <TableRow key={ingredient.id}>
                    <TableCell>
                      <IngredientThumb
                        src={ingredient.imageUrl}
                        alt={ingredient.name}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {ingredient.name}
                    </TableCell>
                    <TableCell>
                      {tUnits(ingredient.unit) ?? ingredient.unit}
                    </TableCell>
                    <TableCell
                      className={
                        low
                          ? 'text-destructive text-end font-medium'
                          : 'text-end'
                      }
                    >
                      {formatQuantity(
                        ingredient.currentStock,
                        ingredient.unit,
                        locale,
                        tUnits(ingredient.unit)
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatQuantity(
                        ingredient.minThreshold,
                        ingredient.unit,
                        locale,
                        tUnits(ingredient.unit)
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCost(
                        ingredient.costPerUnit,
                        locale,
                        tCommon('currency')
                      )}
                    </TableCell>
                    <TableCell>
                      {low ? (
                        <Badge variant="destructive">{t('statusLow')}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {t('statusOk')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStockTarget(ingredient)}
                        >
                          <PackagePlusIcon />
                          <span className="sr-only">
                            {t('restockSr', { name: ingredient.name })}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTarget(ingredient)}
                        >
                          <PencilIcon />
                          <span className="sr-only">
                            {t('editSr', { name: ingredient.name })}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={ingredient.recipeCount > 0}
                          onClick={() => setDeleteTarget(ingredient)}
                        >
                          <Trash2Icon />
                          <span className="sr-only">
                            {t('deleteSr', { name: ingredient.name })}
                          </span>
                        </Button>
                      </div>
                      {ingredient.recipeCount > 0 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t('usedInRecipes', {
                            count: ingredient.recipeCount,
                          })}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('editTitle', { name: editTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDescription')}</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <IngredientForm
              key={editTarget.id}
              ingredient={editTarget}
              action={updateIngredient.bind(null, editTarget.id)}
              onSuccess={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!stockTarget}
        onOpenChange={(open) => !open && setStockTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('restockTitle', { name: stockTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('restockDescription')}</DialogDescription>
          </DialogHeader>
          {stockTarget && (
            <StockEntryForm
              key={stockTarget.id}
              action={createStockEntry.bind(null, stockTarget.id)}
              unit={stockTarget.unit}
              currentStock={stockTarget.currentStock}
              today={today}
              onSuccess={() => setStockTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('deleteTitle', { name: deleteTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && (
              <form action={deleteIngredient.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  {t('deletePermanently')}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
