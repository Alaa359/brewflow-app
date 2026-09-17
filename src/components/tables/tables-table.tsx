'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArmchairIcon,
  PencilIcon,
  PlusIcon,
  QrCodeIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
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
  createTable,
  deleteTable,
  regenerateQr,
  updateTable,
} from '@/actions/tables';
import { TableForm } from '@/components/tables/table-form';
import { TableQr } from '@/components/tables/table-qr';

export type TableListRow = {
  id: string;
  number: number;
  zone: string | null;
  qrCode: string | null;
  orderCount: number;
};

export function TablesTable({
  tables,
  establishmentName,
  error,
}: {
  tables: TableListRow[];
  establishmentName: string;
  error?: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TableListRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableListRow | null>(null);
  const [qrTarget, setQrTarget] = useState<TableListRow | null>(null);

  const deleteOpen =
    deleteTarget !== null &&
    tables.some((table) => table.id === deleteTarget.id);
  const qrRow = qrTarget
    ? (tables.find((table) => table.id === qrTarget.id) ?? null)
    : null;

  const errorMessage =
    error === 'commandes'
      ? 'Suppression impossible : cette table possède des commandes. Désactivez-la plutôt que de la supprimer.'
      : error === 'introuvable'
        ? 'Table introuvable dans cet établissement.'
        : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tables</h1>
          <p className="text-muted-foreground text-sm">
            {tables.length} table{tables.length > 1 ? 's' : ''} pour{' '}
            {establishmentName} · chaque QR code ouvre le menu client de la
            table
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Ajouter une table
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle table</DialogTitle>
              <DialogDescription>
                Le QR code du menu client est généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <TableForm
              action={createTable}
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
            onClick={() => router.replace('/tables')}
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
              <TableHead>Table</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="text-right">Commandes</TableHead>
              <TableHead>QR code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  Aucune table. Commencez par en ajouter une.
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <ArmchairIcon className="text-muted-foreground size-4" />
                      n° {table.number}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {table.zone || '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {table.orderCount}
                  </TableCell>
                  <TableCell>
                    {table.qrCode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrTarget(table)}
                      >
                        <QrCodeIcon />
                        Voir le QR
                      </Button>
                    ) : (
                      <form action={regenerateQr.bind(null, table.id)}>
                        <Button variant="outline" size="sm" type="submit">
                          <QrCodeIcon />
                          Générer le QR
                        </Button>
                      </form>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(table)}
                      >
                        <PencilIcon />
                        <span className="sr-only">
                          Modifier la table {table.number}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={table.orderCount > 0}
                        onClick={() => setDeleteTarget(table)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">
                          Supprimer la table {table.number}
                        </span>
                      </Button>
                    </div>
                    {table.orderCount > 0 && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Des commandes sont rattachées à cette table
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))
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
            <DialogTitle>Modifier la table {editTarget?.number}</DialogTitle>
            <DialogDescription>
              Mettez à jour le numéro ou la zone de la table.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <TableForm
              key={editTarget.id}
              table={{ number: editTarget.number, zone: editTarget.zone }}
              action={updateTable.bind(null, editTarget.id)}
              onSuccess={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!qrRow}
        onOpenChange={(open) => !open && setQrTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              QR code — table {qrRow?.number}
              {qrRow?.zone ? ` · ${qrRow.zone}` : ''}
            </DialogTitle>
            <DialogDescription>
              Imprimez ce code et posez-le sur la table : le client le scanne
              pour ouvrir le menu et envoyer sa commande.
            </DialogDescription>
          </DialogHeader>
          {qrRow?.qrCode && <TableQr token={qrRow.qrCode} />}
          <DialogFooter className="sm:justify-start">
            {qrRow && (
              <form action={regenerateQr.bind(null, qrRow.id)}>
                <Button variant="outline" size="sm" type="submit">
                  Régénérer le QR code
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Supprimer la table {deleteTarget?.number} ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le QR code associé cessera
              immédiatement de fonctionner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && (
              <form action={deleteTable.bind(null, deleteTarget.id)}>
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
