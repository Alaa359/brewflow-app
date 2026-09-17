'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TableState } from '@/actions/tables';

export type TableFormDefaults = {
  number: number;
  zone: string | null;
};

export function TableForm({
  action,
  table,
  onSuccess,
}: {
  action: (prevState: TableState, formData: FormData) => Promise<TableState>;
  table?: TableFormDefaults | null;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="number">Numéro</Label>
        <Input
          id="number"
          name="number"
          type="number"
          min={1}
          max={999}
          step={1}
          placeholder="Ex. : 1"
          defaultValue={table?.number}
          aria-invalid={!!state?.errors?.number}
        />
        {state?.errors?.number?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="zone">Zone</Label>
        <Input
          id="zone"
          name="zone"
          type="text"
          placeholder="Ex. : Salle, Terrasse…"
          defaultValue={table?.zone ?? ''}
          aria-invalid={!!state?.errors?.zone}
        />
        {state?.errors?.zone?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      {state?.errors?.form?.map((e) => (
        <p
          key={e}
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
        >
          {e}
        </p>
      ))}

      <Button type="submit" disabled={pending}>
        {pending
          ? 'Enregistrement…'
          : table
            ? 'Enregistrer les modifications'
            : 'Créer la table'}
      </Button>
    </form>
  );
}
