'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Tables');
  const tCommon = useTranslations('Common');
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
      ? t('error.hasOrders')
      : error === 'introuvable'
        ? t('error.notFound')
        : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle', { count: tables.length, name: establishmentName })}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t('addTable')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('createDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('createDialog.description')}
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
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pe-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            onClick={() => router.replace('/tables')}
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
              <TableHead>{t('columns.table')}</TableHead>
              <TableHead>{t('columns.zone')}</TableHead>
              <TableHead className="text-end">{t('columns.orders')}</TableHead>
              <TableHead>{t('columns.qrCode')}</TableHead>
              <TableHead className="text-end">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <ArmchairIcon className="text-muted-foreground size-4" />
                      {t('numberLabel', { number: table.number })}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {table.zone || '—'}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
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
                        {t('viewQr')}
                      </Button>
                    ) : (
                      <form action={regenerateQr.bind(null, table.id)}>
                        <Button variant="outline" size="sm" type="submit">
                          <QrCodeIcon />
                          {t('generateQr')}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(table)}
                      >
                        <PencilIcon />
                        <span className="sr-only">
                          {t('editAria', { number: table.number })}
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
                          {t('deleteAria', { number: table.number })}
                        </span>
                      </Button>
                    </div>
                    {table.orderCount > 0 && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {t('hasOrders')}
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
            <DialogTitle>
              {t('editDialog.title', { number: editTarget?.number ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDialog.description')}</DialogDescription>
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
              {t('qrDialog.title', { number: qrRow?.number ?? '' })}
              {qrRow?.zone ? ` · ${qrRow.zone}` : ''}
            </DialogTitle>
            <DialogDescription>{t('qrDialog.description')}</DialogDescription>
          </DialogHeader>
          {qrRow?.qrCode && <TableQr token={qrRow.qrCode} />}
          <DialogFooter className="sm:justify-start">
            {qrRow && (
              <form action={regenerateQr.bind(null, qrRow.id)}>
                <Button variant="outline" size="sm" type="submit">
                  {t('regenerateQr')}
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
              {t('deleteDialog.title', { number: deleteTarget?.number ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && (
              <form action={deleteTable.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  {t('deleteDialog.confirm')}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
