'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { CheckIcon, StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { switchEstablishment } from '@/actions/establishments';

export function EstablishmentSwitcher({
  currentId,
  establishments,
}: {
  currentId: string;
  establishments: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const t = useTranslations('Establishments');
  const current =
    establishments.find((est) => est.id === currentId) ?? establishments[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={pending}
        >
          <StoreIcon />
          {current?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('switcherLabel')}</DropdownMenuLabel>
        {establishments.map((est) => (
          <DropdownMenuItem
            key={est.id}
            disabled={est.id === currentId || pending}
            onClick={() => startTransition(() => switchEstablishment(est.id))}
          >
            {est.id === currentId && <CheckIcon />}
            {est.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
