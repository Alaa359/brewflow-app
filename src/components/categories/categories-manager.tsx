'use client';

import { useActionState, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryState,
} from '@/actions/categories';

export type CategoryRow = {
  id: string;
  name: string;
  sortOrder: number;
  dishCount: number;
};

function CategoryForm({
  action,
  defaults,
  orderHint,
  onSuccess,
  onCancel,
}: {
  action: (
    prevState: CategoryState,
    formData: FormData
  ) => Promise<CategoryState>;
  defaults?: { name: string; sortOrder: number };
  orderHint?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const t = useTranslations('Categories');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Input
          name="name"
          type="text"
          placeholder={t('form.namePlaceholder')}
          defaultValue={defaults?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name?.map((e) => (
          <p key={e} className="text-destructive text-xs">
            {e}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="sortOrder" className="shrink-0 text-xs">
          {t('form.order')}
        </Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min="0"
          className="w-20"
          defaultValue={defaults?.sortOrder ?? orderHint}
          aria-invalid={!!state?.errors?.sortOrder}
        />
        {state?.errors?.sortOrder?.map((e) => (
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {tCommon('actions.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending
            ? t('saving')
            : defaults
              ? tCommon('actions.save')
              : tCommon('actions.add')}
        </Button>
      </div>
    </form>
  );
}

export function CategoriesManager({
  categories,
  open,
  onOpenChange,
}: {
  categories: CategoryRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const t = useTranslations('Categories');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const list = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, locale)
  );
  const nextOrder =
    list.reduce((max, cat) => Math.max(max, cat.sortOrder), 0) + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('manageCategories')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {list.length === 0 && !adding && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t('empty')}
            </p>
          )}

          {list.map((cat) =>
            editingId === cat.id ? (
              <div key={cat.id} className="rounded-lg border p-3">
                <CategoryForm
                  action={updateCategory.bind(null, cat.id)}
                  defaults={{
                    name: cat.name,
                    sortOrder: cat.sortOrder,
                  }}
                  onSuccess={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {cat.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t('orderLabel', { order: cat.sortOrder })} ·{' '}
                    {t('dishCount', { count: cat.dishCount })}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {confirmDeleteId === cat.id ? (
                    <>
                      <form action={deleteCategory.bind(null, cat.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          {t('confirmDelete')}
                        </Button>
                      </form>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        {tCommon('actions.cancel')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('editCategory', { name: cat.name })}
                        onClick={() => setEditingId(cat.id)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('deleteCategory', { name: cat.name })}
                        disabled={cat.dishCount > 0}
                        onClick={() => setConfirmDeleteId(cat.id)}
                      >
                        <Trash2Icon />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {adding && (
            <div className="rounded-lg border p-3">
              <CategoryForm
                action={createCategory}
                orderHint={nextOrder}
                onSuccess={() => setAdding(false)}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}
        </div>

        {!adding && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAdding(true)}
          >
            <PlusIcon />
            {t('addCategory')}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
