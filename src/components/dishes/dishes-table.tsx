'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  BookOpenIcon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DishThumb } from '@/components/ui/dish-thumb';
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
import { createDish, deleteDish, updateDish } from '@/actions/dishes';
import { formatCost } from '@/lib/ingredients';
import { formatPercent, marginColorClass } from '@/lib/margins';
import { DishForm, type DishFormDefaults } from '@/components/dishes/dish-form';
import {
  RecipeEditor,
  type RecipeIngredientOption,
  type RecipeLineRow,
} from '@/components/dishes/recipe-editor';
import {
  CategoriesManager,
  type CategoryRow,
} from '@/components/categories/categories-manager';

export type DishRow = DishFormDefaults & {
  recipeCount: number;
  orderItemCount: number;
  cost: number;
  margin: number;
  marginPercent: number | null;
  recipe: RecipeLineRow[];
};

export function DishesTable({
  categories,
  dishes,
  ingredients,
  error,
}: {
  categories: CategoryRow[];
  dishes: DishRow[];
  ingredients: RecipeIngredientOption[];
  error?: string;
}) {
  const router = useRouter();
  const t = useTranslations('Dishes');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DishRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DishRow | null>(null);
  const [recipeTarget, setRecipeTarget] = useState<DishRow | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const deleteOpen =
    deleteTarget !== null && dishes.some((d) => d.id === deleteTarget.id);

  const errorMessage =
    error === 'categorie'
      ? t('errors.categoryHasDishes')
      : error === 'recette'
        ? t('errors.dishInRecipe')
        : error === 'commande'
          ? t('errors.dishInOrders')
          : undefined;

  const orderedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, locale)
  );

  const totalDishes = dishes.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('dishCount', { count: totalDishes })} ·{' '}
            {t('categoryCount', { count: orderedCategories.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCatOpen(true)}>
            <ListIcon />
            {t('manageCategories')}
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={categories.length === 0}
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon />
                {t('addDish')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('newDish')}</DialogTitle>
                <DialogDescription>{t('createDescription')}</DialogDescription>
              </DialogHeader>
              <DishForm
                action={createDish}
                categories={categories}
                onSuccess={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pe-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            onClick={() => router.replace('/plats')}
          >
            <XIcon />
            <span className="sr-only">{tCommon('actions.close')}</span>
          </Button>
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
          {t('noCategoriesHint')}
        </p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.photo')}</TableHead>
              <TableHead>{t('columns.dish')}</TableHead>
              <TableHead className="text-end">{t('columns.price')}</TableHead>
              <TableHead className="text-end">{t('columns.cost')}</TableHead>
              <TableHead className="text-end">{t('columns.margin')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead className="text-end">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t('emptyCategories')}
                </TableCell>
              </TableRow>
            ) : (
              orderedCategories.map((cat) => {
                const catDishes = dishes.filter((d) => d.categoryId === cat.id);
                return (
                  <Fragment key={cat.id}>
                    <TableRow className="bg-muted/40">
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground font-medium"
                      >
                        {cat.name}
                        <span className="ms-2 text-xs font-normal">
                          {t('categoryExtra', { count: catDishes.length })}
                        </span>
                      </TableCell>
                    </TableRow>
                    {catDishes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-muted-foreground h-14 text-center text-sm"
                        >
                          {t('emptyCategory')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      catDishes.map((dish) => {
                        const locked =
                          dish.recipeCount > 0 || dish.orderItemCount > 0;
                        return (
                          <TableRow key={dish.id}>
                            <TableCell>
                              <DishThumb src={dish.imageUrl} alt={dish.name} categoryName={cat.name} />
                            </TableCell>
                            <TableCell className="max-w-64">
                              <div className="font-medium">{dish.name}</div>
                              {dish.description && (
                                <div className="text-muted-foreground line-clamp-1 text-xs">
                                  {dish.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-end">
                              {formatCost(
                                dish.price,
                                locale,
                                tCommon('currency')
                              )}
                            </TableCell>
                            <TableCell className="text-end">
                              {dish.recipeCount > 0
                                ? formatCost(
                                    dish.cost,
                                    locale,
                                    tCommon('currency')
                                  )
                                : '—'}
                            </TableCell>
                            <TableCell className="text-end">
                              {dish.recipeCount > 0 ? (
                                <span
                                  className={marginColorClass(
                                    dish.marginPercent
                                  )}
                                >
                                  {formatCost(
                                    dish.margin,
                                    locale,
                                    tCommon('currency')
                                  )}{' '}
                                  ·{' '}
                                  {formatPercent(
                                    dish.marginPercent ?? 0,
                                    locale
                                  )}
                                </span>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              {dish.isActive ? (
                                <Badge>{t('status.active')}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  {t('status.inactive')}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-end">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setRecipeTarget(dish)}
                                >
                                  <BookOpenIcon />
                                  <span className="sr-only">
                                    {t('recipeOf', { name: dish.name })}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditTarget(dish)}
                                >
                                  <PencilIcon />
                                  <span className="sr-only">
                                    {t('editDish', { name: dish.name })}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={locked}
                                  onClick={() => setDeleteTarget(dish)}
                                >
                                  <Trash2Icon />
                                  <span className="sr-only">
                                    {t('deleteDish', { name: dish.name })}
                                  </span>
                                </Button>
                              </div>
                              {locked && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {dish.recipeCount > 0 &&
                                    t('recipeIngredientCount', {
                                      count: dish.recipeCount,
                                    })}
                                  {dish.recipeCount > 0 &&
                                    dish.orderItemCount > 0 &&
                                    ' · '}
                                  {dish.orderItemCount > 0 &&
                                    t('orderCount', {
                                      count: dish.orderItemCount,
                                    })}
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CategoriesManager
        categories={categories}
        open={catOpen}
        onOpenChange={setCatOpen}
      />

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('editDish', { name: editTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDescription')}</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <DishForm
              key={editTarget.id}
              dish={editTarget}
              categories={categories}
              action={updateDish.bind(null, editTarget.id)}
              onSuccess={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!recipeTarget}
        onOpenChange={(open) => !open && setRecipeTarget(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t('recipeOf', { name: recipeTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('recipeDescription')}</DialogDescription>
          </DialogHeader>
          {recipeTarget && (
            <RecipeEditor
              key={recipeTarget.id}
              dishId={recipeTarget.id}
              price={recipeTarget.price}
              recipe={recipeTarget.recipe}
              ingredients={ingredients}
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
              {t('deleteConfirm', { name: deleteTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && (
              <form action={deleteDish.bind(null, deleteTarget.id)}>
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
