'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
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

function DishThumb({ src, alt }: { src: string | null; alt: string }) {
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DishRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DishRow | null>(null);
  const [recipeTarget, setRecipeTarget] = useState<DishRow | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const deleteOpen =
    deleteTarget !== null && dishes.some((d) => d.id === deleteTarget.id);

  const errorMessage =
    error === 'categorie'
      ? 'Suppression impossible : cette catégorie contient des plats.'
      : error === 'recette'
        ? 'Suppression impossible : ce plat est utilisé dans une recette.'
        : error === 'commande'
          ? 'Suppression impossible : ce plat apparaît dans des commandes.'
          : undefined;

  const orderedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fr')
  );

  const totalDishes = dishes.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Plats</h1>
          <p className="text-muted-foreground text-sm">
            {totalDishes} plat{totalDishes > 1 ? 's' : ''} ·{' '}
            {orderedCategories.length} catégorie
            {orderedCategories.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCatOpen(true)}>
            <ListIcon />
            Gérer les catégories
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={categories.length === 0}
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon />
                Ajouter un plat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau plat</DialogTitle>
                <DialogDescription>
                  Renseignez le nom, la description, le prix, la catégorie et la
                  photo.
                </DialogDescription>
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
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pr-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => router.replace('/plats')}
          >
            <XIcon />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
          Créez d’abord une catégorie pour pouvoir ajouter des plats.
        </p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Plat</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Coût</TableHead>
              <TableHead className="text-right">Marge</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-24 text-center"
                >
                  Aucune catégorie. Commencez par en créer une.
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
                        <span className="ml-2 text-xs font-normal">
                          {catDishes.length === 0
                            ? '— aucun plat'
                            : `— ${catDishes.length} plat${catDishes.length > 1 ? 's' : ''}`}
                        </span>
                      </TableCell>
                    </TableRow>
                    {catDishes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-muted-foreground h-14 text-center text-sm"
                        >
                          Aucun plat dans cette catégorie.
                        </TableCell>
                      </TableRow>
                    ) : (
                      catDishes.map((dish) => {
                        const locked =
                          dish.recipeCount > 0 || dish.orderItemCount > 0;
                        return (
                          <TableRow key={dish.id}>
                            <TableCell>
                              <DishThumb src={dish.imageUrl} alt={dish.name} />
                            </TableCell>
                            <TableCell className="max-w-64">
                              <div className="font-medium">{dish.name}</div>
                              {dish.description && (
                                <div className="text-muted-foreground line-clamp-1 text-xs">
                                  {dish.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCost(dish.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {dish.recipeCount > 0
                                ? formatCost(dish.cost)
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {dish.recipeCount > 0 ? (
                                <span
                                  className={marginColorClass(
                                    dish.marginPercent
                                  )}
                                >
                                  {formatCost(dish.margin)} ·{' '}
                                  {formatPercent(dish.marginPercent ?? 0)}
                                </span>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              {dish.isActive ? (
                                <Badge>Actif</Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  Inactif
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setRecipeTarget(dish)}
                                >
                                  <BookOpenIcon />
                                  <span className="sr-only">
                                    Recette de {dish.name}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditTarget(dish)}
                                >
                                  <PencilIcon />
                                  <span className="sr-only">
                                    Modifier {dish.name}
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
                                    Supprimer {dish.name}
                                  </span>
                                </Button>
                              </div>
                              {locked && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {dish.recipeCount > 0 &&
                                    `${dish.recipeCount} ingrédient${dish.recipeCount > 1 ? 's' : ''}`}
                                  {dish.recipeCount > 0 &&
                                    dish.orderItemCount > 0 &&
                                    ' · '}
                                  {dish.orderItemCount > 0 &&
                                    `${dish.orderItemCount} commande${dish.orderItemCount > 1 ? 's' : ''}`}
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
            <DialogTitle>Modifier {editTarget?.name}</DialogTitle>
            <DialogDescription>
              Ajustez le nom, la description, le prix, la catégorie ou le
              statut.
            </DialogDescription>
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
            <DialogTitle>Recette de {recipeTarget?.name}</DialogTitle>
            <DialogDescription>
              Ingrédients et quantités nécessaires pour une portion du plat.
            </DialogDescription>
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
            <DialogTitle>Supprimer {deleteTarget?.name} ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Les plats utilisés dans une recette
              ou une commande ne peuvent pas être supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && (
              <form action={deleteDish.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  Supprimer définitivement
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
