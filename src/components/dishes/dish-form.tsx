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
import { Textarea } from '@/components/ui/textarea';
import type { DishState } from '@/actions/dishes';

export type DishFormDefaults = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
};

export function DishForm({
  action,
  dish,
  categories,
  onSuccess,
}: {
  action: (prevState: DishState, formData: FormData) => Promise<DishState>;
  dish?: DishFormDefaults | null;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const t = useTranslations('Dishes');
  const tCommon = useTranslations('Common');
  const [active, setActive] = useState<string>(
    dish ? String(dish.isActive) : 'true'
  );
  const [categoryId, setCategoryId] = useState<string>(dish?.categoryId ?? '');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  const preview = filePreview ?? dish?.imageUrl ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t('form.name')}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={t('form.namePlaceholder')}
          defaultValue={dish?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{t('form.descriptionOptional')}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t('form.descriptionPlaceholder')}
          defaultValue={dish?.description ?? ''}
          aria-invalid={!!state?.errors?.description}
        />
        {state?.errors?.description?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="price">
          {t('form.priceLabel', { currency: tCommon('currency') })}
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.001"
          min="0.001"
          inputMode="decimal"
          defaultValue={dish?.price}
          aria-invalid={!!state?.errors?.price}
        />
        {state?.errors?.price?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('form.category')}</Label>
        <input type="hidden" name="categoryId" value={categoryId} />
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('form.chooseCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.categoryId?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('form.status')}</Label>
        <input type="hidden" name="isActive" value={active} />
        <Select value={active} onValueChange={(v) => setActive(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{t('status.active')}</SelectItem>
            <SelectItem value="false">{t('status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.isActive?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image">{t('form.photoOptional')}</Label>
        <div className="flex items-center gap-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={t('form.preview')}
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
          ? t('form.saving')
          : dish
            ? t('form.saveChanges')
            : t('createDish')}
      </Button>
    </form>
  );
}
