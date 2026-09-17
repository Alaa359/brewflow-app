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
import type { EstablishmentState } from '@/actions/establishments';

export type EstablishmentFormDefaults = {
  name: string;
  address: string | null;
  phone: string | null;
  timezone: string;
};

const TIMEZONES = [
  ['Africa/Tunis', 'Tunisie (UTC+1)'],
  ['Africa/Casablanca', 'Maroc (UTC+1)'],
  ['Africa/Algiers', 'Algérie (UTC+1)'],
  ['Africa/Cairo', 'Égypte (UTC+2)'],
  ['Europe/Paris', 'France (UTC+2)'],
  ['Europe/London', 'Royaume-Uni (UTC+1)'],
  ['Asia/Dubai', 'Émirats (UTC+4)'],
  ['America/New_York', 'New York (UTC-4)'],
] as const;

export function TIMEZONE_LABEL(timezone: string): string {
  return TIMEZONES.find(([tz]) => tz === timezone)?.[1] ?? timezone;
}

export function EstablishmentForm({
  action,
  establishment,
  onSuccess,
}: {
  action: (
    prevState: EstablishmentState,
    formData: FormData
  ) => Promise<EstablishmentState>;
  establishment?: EstablishmentFormDefaults | null;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [timezone, setTimezone] = useState(
    establishment?.timezone ?? 'Africa/Tunis'
  );

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ex. : El Farès Café"
          defaultValue={establishment?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="Ex. : Avenue Habib Bourguiba, Sousse"
          defaultValue={establishment?.address ?? ''}
          aria-invalid={!!state?.errors?.address}
        />
        {state?.errors?.address?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="text"
          placeholder="Ex. : +216 73 111 222"
          defaultValue={establishment?.phone ?? ''}
          aria-invalid={!!state?.errors?.phone}
        />
        {state?.errors?.phone?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Fuseau horaire</Label>
        <input type="hidden" name="timezone" value={timezone} />
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(([tz, label]) => (
              <SelectItem key={tz} value={tz}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.timezone?.map((e) => (
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
          : establishment
            ? 'Enregistrer les modifications'
            : 'Créer l’établissement'}
      </Button>
    </form>
  );
}
