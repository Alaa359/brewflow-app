'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { formatCost, formatQuantity, UNIT_LABEL } from '@/lib/ingredients';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IngredientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IngredientRow | null>(null);
  const [stockTarget, setStockTarget] = useState<IngredientRow | null>(null);

  const deleteOpen =
    deleteTarget !== null && ingredients.some((i) => i.id === deleteTarget.id);

  const errorMessage =
    error === 'recette' || error === 'recettes'
      ? 'Suppression impossible : cet ingrédient est utilisé dans une recette.'
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Ingrédients</h1>
          <p className="text-muted-foreground text-sm">
            {ingredients.length} ingrédient
            {ingredients.length > 1 ? 's' : ''} ·{' '}
            {lowCount > 0 ? (
              <span className="text-destructive font-medium">
                {lowCount} sous le seuil minimum
              </span>
            ) : (
              'aucun stock en dessous du seuil'
            )}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Ajouter un ingrédient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvel ingrédient</DialogTitle>
              <DialogDescription>
                Renseignez le nom, l’unité, le stock, le seuil minimum et le
                coût par unité.
              </DialogDescription>
            </DialogHeader>
            <IngredientForm
              action={createIngredient}
              onSuccess={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pr-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => router.replace('/ingredients')}
          >
            <XIcon />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Seuil min.</TableHead>
              <TableHead className="text-right">Coût</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-24 text-center"
                >
                  Aucun ingrédient. Commencez par en créer un.
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
                      {UNIT_LABEL[ingredient.unit] ?? ingredient.unit}
                    </TableCell>
                    <TableCell
                      className={
                        low
                          ? 'text-destructive text-right font-medium'
                          : 'text-right'
                      }
                    >
                      {formatQuantity(ingredient.currentStock, ingredient.unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(ingredient.minThreshold, ingredient.unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCost(ingredient.costPerUnit)}
                    </TableCell>
                    <TableCell>
                      {low ? (
                        <Badge variant="destructive">Stock bas</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          OK
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStockTarget(ingredient)}
                        >
                          <PackagePlusIcon />
                          <span className="sr-only">
                            Réapprovisionner {ingredient.name}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTarget(ingredient)}
                        >
                          <PencilIcon />
                          <span className="sr-only">
                            Modifier {ingredient.name}
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
                            Supprimer {ingredient.name}
                          </span>
                        </Button>
                      </div>
                      {ingredient.recipeCount > 0 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Utilisé dans {ingredient.recipeCount} recette
                          {ingredient.recipeCount > 1 ? 's' : ''}
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
            <DialogTitle>Modifier {editTarget?.name}</DialogTitle>
            <DialogDescription>
              Ajustez l’unité, le stock, le seuil ou le coût.
            </DialogDescription>
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
            <DialogTitle>Réapprovisionner {stockTarget?.name}</DialogTitle>
            <DialogDescription>
              La quantité sera ajoutée au stock actuel et l’entrée apparaîtra
              dans l’historique.
            </DialogDescription>
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
            <DialogTitle>Supprimer {deleteTarget?.name} ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le stock et la photo de
              l’ingrédient seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && (
              <form action={deleteIngredient.bind(null, deleteTarget.id)}>
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
