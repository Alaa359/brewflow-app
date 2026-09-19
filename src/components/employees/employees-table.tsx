'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PencilIcon, PlusIcon, Trash2Icon, UserIcon } from 'lucide-react';
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
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from '@/actions/employees';
import type { EmployeeRole } from '@/lib/validations/employee';
import {
  EmployeeForm,
  type EmployeeFormDefaults,
  type ManagedEstablishment,
} from '@/components/employees/employee-form';

export type EmployeeRow = EmployeeFormDefaults & {
  id: string;
  memberships: ManagedEstablishment[];
};

function roleBadge(role: EmployeeRole, tRoles: (key: string) => string) {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="secondary">{tRoles(role)}</Badge>;
    case 'SERVER':
      return <Badge>{tRoles(role)}</Badge>;
    case 'KITCHEN':
      return (
        <Badge variant="outline" className="border-success text-success">
          {tRoles(role)}
        </Badge>
      );
  }
}

export function EmployeesTable({
  employees,
  establishments,
  currentEstablishmentId,
}: {
  employees: EmployeeRow[];
  establishments: ManagedEstablishment[];
  currentEstablishmentId: string;
}) {
  const router = useRouter();
  const t = useTranslations('Employees');
  const tCommon = useTranslations('Common');
  const tRoles = useTranslations('Roles');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle', { count: employees.length })}
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
            <EmployeeForm
              action={createEmployee}
              establishments={establishments}
              currentEstablishmentId={currentEstablishmentId}
              onSuccess={() => {
                setCreateOpen(false);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.email')}</TableHead>
              <TableHead>{t('columns.role')}</TableHead>
              <TableHead>{t('columns.establishments')}</TableHead>
              <TableHead className="text-end">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <UserIcon className="text-muted-foreground size-4" />
                      {employee.name}
                      {employee.isSelf && (
                        <span className="text-muted-foreground text-xs">
                          ({t('you')})
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.email}
                  </TableCell>
                  <TableCell>{roleBadge(employee.role, tRoles)}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {employee.memberships.map((membership) => (
                        <Badge key={membership.id} variant="outline">
                          {membership.name}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(employee)}
                      >
                        <PencilIcon />
                        <span className="sr-only">
                          {`${tCommon('actions.edit')} ${employee.name}`}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(employee)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">
                          {`${tCommon('actions.delete')} ${employee.name}`}
                        </span>
                      </Button>
                    </div>
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
              {t('editDialogTitle', { name: editTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDialogDescription')}</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EmployeeForm
              key={editTarget.id}
              employee={editTarget}
              action={updateEmployee.bind(null, editTarget.id)}
              establishments={establishments}
              currentEstablishmentId={currentEstablishmentId}
              onSuccess={() => {
                setEditTarget(null);
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('deleteDialogTitle', { name: deleteTarget?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.isSelf
                ? t('deleteSelf')
                : t('deleteConfirm', { name: deleteTarget?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && !deleteTarget.isSelf && (
              <form action={deleteEmployee.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  {tCommon('actions.remove')}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
