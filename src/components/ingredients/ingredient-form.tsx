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
import type { Unit } from '@/generated/client';
import type { IngredientState } from '@/actions/ingredients';

export type IngredientFormDefaults = {
  id: string;
  name: string;
  unit: Unit;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  imageUrl: string | null;
};

export function IngredientForm({
  action,
  ingredient,
  onSuccess,
}: {
  action: (
    prevState: IngredientState,
    formData: FormData
  ) => Promise<IngredientState>;
  ingredient?: IngredientFormDefaults | null;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [unit, setUnit] = useState<Unit>(ingredient?.unit ?? 'KG');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  const preview = filePreview ?? ingredient?.imageUrl ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ex. : café, lait, sucre…"
          defaultValue={ingredient?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Unité</Label>
        <input type="hidden" name="unit" value={unit} />
        <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KG">Kilogramme (kg)</SelectItem>
            <SelectItem value="L">Litre (L)</SelectItem>
            <SelectItem value="PIECE">Pièce</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.unit?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentStock">Stock actuel</Label>
          <Input
            id="currentStock"
            name="currentStock"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            defaultValue={ingredient?.currentStock}
            aria-invalid={!!state?.errors?.currentStock}
          />
          {state?.errors?.currentStock?.map((e) => (
            <p key={e} className="text-destructive text-xs">
              {e}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="minThreshold">Seuil minimum</Label>
          <Input
            id="minThreshold"
            name="minThreshold"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            defaultValue={ingredient?.minThreshold}
            aria-invalid={!!state?.errors?.minThreshold}
          />
          {state?.errors?.minThreshold?.map((e) => (
            <p key={e} className="text-destructive text-xs">
              {e}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="costPerUnit">Coût par unité (DT)</Label>
        <Input
          id="costPerUnit"
          name="costPerUnit"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          defaultValue={ingredient?.costPerUnit}
          aria-invalid={!!state?.errors?.costPerUnit}
        />
        {state?.errors?.costPerUnit?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Photo (optionnel)</Label>
        <div className="flex items-center gap-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Aperçu"
              className="bg-muted size-14 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-muted size-14 rounded-lg" />
          )}
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="max-w-56"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFilePreview(URL.createObjectURL(file));
              else setFilePreview(null);
            }}
          />
        </div>
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
          : ingredient
            ? 'Enregistrer les modifications'
            : 'Créer l’ingrédient'}
      </Button>
    </form>
  );
}
