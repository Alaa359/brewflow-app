'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_LABEL } from '@/lib/auth/roles';
import { employeeRoles, type EmployeeRole } from '@/lib/validations/employee';
import type { EmployeeState } from '@/actions/employees';

export type EmployeeFormDefaults = {
  name: string;
  email: string;
  role: EmployeeRole;
  establishmentIds: string[];
  isSelf: boolean;
};

export type ManagedEstablishment = { id: string; name: string };

export function EmployeeForm({
  action,
  employee,
  establishments,
  currentEstablishmentId,
  onSuccess,
}: {
  action: (
    prevState: EmployeeState,
    formData: FormData
  ) => Promise<EmployeeState>;
  employee?: EmployeeFormDefaults | null;
  establishments: ManagedEstablishment[];
  currentEstablishmentId: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [role, setRole] = useState<EmployeeRole>(employee?.role ?? 'SERVER');
  const [checked, setChecked] = useState<string[]>(
    employee?.establishmentIds ?? [currentEstablishmentId]
  );

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  const toggle = (establishmentId: string) => {
    setChecked((current) =>
      current.includes(establishmentId)
        ? current.filter((id) => id !== establishmentId)
        : [...current, establishmentId]
    );
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ex. : Amine Ben Salah"
          defaultValue={employee?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name?.map((error) => (
          <p key={error} className="text-destructive text-xs">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ex. : amine@brewflow.tn"
          defaultValue={employee?.email}
          aria-invalid={!!state?.errors?.email}
        />
        {state?.errors?.email?.map((error) => (
          <p key={error} className="text-destructive text-xs">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Rôle</Label>
        <input type="hidden" name="role" value={role} />
        <Select
          value={role}
          onValueChange={(value) => setRole(value as EmployeeRole)}
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {employeeRoles.map((value) => (
              <SelectItem key={value} value={value}>
                {ROLE_LABEL[value] ?? value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.role?.map((error) => (
          <p key={error} className="text-destructive text-xs">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">
          {employee ? 'Nouveau mot de passe' : 'Mot de passe initial'}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={
            employee ? 'Laisser vide pour conserver' : '8 caractères minimum'
          }
          aria-invalid={!!state?.errors?.password}
        />
        {state?.errors?.password?.map((error) => (
          <p key={error} className="text-destructive text-xs">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Établissements rattachés</Label>
        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
          {establishments.map((establishment) => {
            const disabled =
              (employee?.isSelf ?? false) &&
              establishment.id === currentEstablishmentId;
            return (
              <label
                key={establishment.id}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  disabled
                    ? 'border-muted text-muted-foreground cursor-not-allowed'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  name="establishments"
                  value={establishment.id}
                  checked={checked.includes(establishment.id)}
                  disabled={disabled}
                  onChange={() => toggle(establishment.id)}
                  className="accent-foreground size-4"
                />
                {establishment.name}
                {disabled && ' (actif)'}
              </label>
            );
          })}
        </div>
      </div>

      {state?.errors?.form?.map((error) => (
        <p
          key={error}
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
        >
          {error}
        </p>
      ))}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? 'Enregistrement…'
            : employee
              ? 'Enregistrer les modifications'
              : 'Créer l’employé'}
        </Button>
      </div>
    </form>
  );
}
