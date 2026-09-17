'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { register } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const t = useTranslations('Auth.register');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('namePlaceholder')}
                autoComplete="name"
                aria-invalid={!!state?.errors?.name}
              />
              {state?.errors?.name?.map((e) => (
                <p key={e} className="text-destructive text-xs">
                  {e}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="establishmentName">
                {t('establishmentName')}
              </Label>
              <Input
                id="establishmentName"
                name="establishmentName"
                type="text"
                placeholder={t('establishmentNamePlaceholder')}
                aria-invalid={!!state?.errors?.establishmentName}
              />
              {state?.errors?.establishmentName?.map((e) => (
                <p key={e} className="text-destructive text-xs">
                  {e}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder={t('addressPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              aria-invalid={!!state?.errors?.email}
            />
            {state?.errors?.email?.map((e) => (
              <p key={e} className="text-destructive text-xs">
                {e}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              autoComplete="new-password"
              aria-invalid={!!state?.errors?.password}
            />
            {state?.errors?.password?.map((e) => (
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
            {pending ? t('submitting') : t('submit')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 px-(--card-spacing)">
        <p className="text-muted-foreground text-sm">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
