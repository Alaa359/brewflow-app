'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Employees');
  const tRoles = useTranslations('Roles');
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
        <Label htmlFor="name">{t('form.name')}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={t('form.namePlaceholder')}
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
        <Label htmlFor="email">{t('form.email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('form.emailPlaceholder')}
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
        <Label htmlFor="role">{t('form.role')}</Label>
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
                {tRoles(value)}
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
          {employee ? t('form.passwordEdit') : t('form.passwordCreate')}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={
            employee
              ? t('form.passwordPlaceholderEdit')
              : t('form.passwordPlaceholderCreate')
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
        <Label>{t('form.establishments')}</Label>
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
                {disabled && ` (${t('form.active')})`}
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
            ? t('form.submitting')
            : employee
              ? t('form.submitEdit')
              : t('form.submitCreate')}
        </Button>
      </div>
    </form>
  );
}
