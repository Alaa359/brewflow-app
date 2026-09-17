'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PencilIcon,
  PlusIcon,
  StoreIcon,
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
  createEstablishment,
  deleteEstablishment,
  updateEstablishment,
} from '@/actions/establishments';
import {
  EstablishmentForm,
  type EstablishmentFormDefaults,
  TIMEZONE_LABEL,
} from '@/components/establishments/establishment-form';

export type EstablishmentRow = EstablishmentFormDefaults & {
  id: string;
  memberCount: number;
  isCurrent: boolean;
};

export function EstablishmentsTable({
  establishments,
  membershipCount,
  error,
}: {
  establishments: EstablishmentRow[];
  membershipCount: number;
  error?: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EstablishmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EstablishmentRow | null>(
    null
  );

  const deleteOpen =
    deleteTarget !== null &&
    establishments.some((est) => est.id === deleteTarget.id);

  const errorMessage =
    error === 'courant'
      ? "Suppression impossible : l'établissement actuellement sélectionné ne peut pas être supprimé."
      : error === 'dernier'
        ? 'Suppression impossible : vous devez conserver au moins un établissement.'
        : error === 'commandes'
          ? 'Suppression impossible : cet établissement possède des commandes.'
          : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Établissements
          </h1>
          <p className="text-muted-foreground text-sm">
            {establishments.length} établissement
            {establishments.length > 1 ? 's' : ''} rattaché
            {establishments.length > 1 ? 's' : ''} à votre compte · le sélecteur
            dans l’en-tête bascule le magasin actif
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Créer un établissement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvel établissement</DialogTitle>
              <DialogDescription>
                Vous serez rattaché à ce magasin automatiquement et pourrez y
                basculer depuis l’en-tête.
              </DialogDescription>
            </DialogHeader>
            <EstablishmentForm
              action={createEstablishment}
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
            onClick={() => router.replace('/etablissements')}
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
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Fuseau</TableHead>
              <TableHead className="text-right">Membres</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {establishments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-24 text-center"
                >
                  Aucun établissement. Commencez par en créer un.
                </TableCell>
              </TableRow>
            ) : (
              establishments.map((est) => {
                const deletable = !est.isCurrent && membershipCount > 1;
                return (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <StoreIcon className="text-muted-foreground size-4" />
                        {est.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {est.address || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {est.phone || '—'}
                    </TableCell>
                    <TableCell>{TIMEZONE_LABEL(est.timezone)}</TableCell>
                    <TableCell className="text-right">
                      {est.memberCount}
                    </TableCell>
                    <TableCell>
                      {est.isCurrent ? (
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
                          onClick={() => setEditTarget(est)}
                        >
                          <PencilIcon />
                          <span className="sr-only">Modifier {est.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!deletable}
                          onClick={() => setDeleteTarget(est)}
                        >
                          <Trash2Icon />
                          <span className="sr-only">Supprimer {est.name}</span>
                        </Button>
                      </div>
                      {est.isCurrent && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Magasin actif — basculez d’abord ailleurs
                        </p>
                      )}
                      {!est.isCurrent && membershipCount <= 1 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Seul établissement du compte
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
              Mettez à jour les coordonnées du magasin.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EstablishmentForm
              key={editTarget.id}
              establishment={editTarget}
              action={updateEstablishment.bind(null, editTarget.id)}
              onSuccess={() => setEditTarget(null)}
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
              Cette action est irréversible : plats, ingrédients, tables,
              plannings et accès de tout le personnel de ce magasin seront
              supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && (
              <form action={deleteEstablishment.bind(null, deleteTarget.id)}>
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
