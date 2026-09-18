'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Establishments');
  const tCommon = useTranslations('Common');
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
      ? t('errorCurrent')
      : error === 'dernier'
        ? t('errorLast')
        : error === 'commandes'
          ? t('errorOrders')
          : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle', { count: establishments.length })}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t('create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('createDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('createDialogDescription')}
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
        <div className="bg-destructive/10 text-destructive relative rounded-md border px-3 py-2.5 pe-10 text-sm">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            onClick={() => router.replace('/etablissements')}
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
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.address')}</TableHead>
              <TableHead>{t('columns.phone')}</TableHead>
              <TableHead>{t('columns.timezone')}</TableHead>
              <TableHead className="text-end">{t('columns.members')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead className="text-end">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {establishments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t('empty')}
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
                    <TableCell className="text-end">
                      {est.memberCount}
                    </TableCell>
                    <TableCell>
                      {est.isCurrent ? (
                        <Badge>{t('active')}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {t('inactive')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTarget(est)}
                        >
                          <PencilIcon />
                          <span className="sr-only">
                            {`${tCommon('actions.edit')} ${est.name}`}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!deletable}
                          onClick={() => setDeleteTarget(est)}
                        >
                          <Trash2Icon />
                          <span className="sr-only">
                            {`${tCommon('actions.delete')} ${est.name}`}
                          </span>
                        </Button>
                      </div>
                      {est.isCurrent && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t('currentHint')}
                        </p>
                      )}
                      {!est.isCurrent && membershipCount <= 1 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t('onlyOne')}
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
              {t('editDialogTitle', { name: editTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDialogDescription')}</DialogDescription>
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
            <DialogTitle>
              {t('deleteDialogTitle', { name: deleteTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {t('deleteDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && (
              <form action={deleteEstablishment.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  {t('deleteConfirm')}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
