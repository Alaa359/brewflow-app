'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ROLE_LABEL } from '@/lib/auth/roles';
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

function roleBadge(role: EmployeeRole) {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="secondary">{ROLE_LABEL[role]}</Badge>;
    case 'SERVER':
      return <Badge>{ROLE_LABEL[role]}</Badge>;
    case 'KITCHEN':
      return (
        <Badge
          variant="outline"
          className="border-emerald-400 text-emerald-700"
        >
          {ROLE_LABEL[role]}
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Employés</h1>
          <p className="text-muted-foreground text-sm">
            {employees.length} employé{employees.length > 1 ? 's' : ''} dans cet
            établissement · les créneaux se planifient sur la page Planning
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Créer un employé
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvel employé</DialogTitle>
              <DialogDescription>
                Créez un compte de connexion (serveur, cuisinier ou admin) et
                rattachez-le à vos établissements.
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
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Établissements</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  Aucun employé dans cet établissement.
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
                          (vous)
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.email}
                  </TableCell>
                  <TableCell>{roleBadge(employee.role)}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {employee.memberships.map((membership) => (
                        <Badge key={membership.id} variant="outline">
                          {membership.name}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(employee)}
                      >
                        <PencilIcon />
                        <span className="sr-only">
                          Modifier {employee.name}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(employee)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">
                          Supprimer {employee.name}
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
            <DialogTitle>Modifier {editTarget?.name}</DialogTitle>
            <DialogDescription>
              Mettez à jour le rôle, le mot de passe ou les établissements
              rattachés.
            </DialogDescription>
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
            <DialogTitle>Retirer {deleteTarget?.name} ?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.isSelf
                ? "Vous ne pouvez pas retirer votre propre compte de l'établissement actif."
                : `${deleteTarget?.name} perdra l'accès à cet établissement, ses créneaux planifiés seront retirés. Les autres rattachements sont conservés.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && !deleteTarget.isSelf && (
              <form action={deleteEmployee.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  Retirer
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
