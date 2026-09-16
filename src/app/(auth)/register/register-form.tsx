'use client';

import { useActionState } from 'react';
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer mon établissement</CardTitle>
        <CardDescription>
          Votre compte administrateur et votre café/restaurant seront créés
          ensemble.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Votre nom</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Sami Ben Ali"
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
              <Label htmlFor="establishmentName">Nom de l’établissement</Label>
              <Input
                id="establishmentName"
                name="establishmentName"
                type="text"
                placeholder="Café El Farès"
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
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Tunis"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+216 …" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.tn"
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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8 caractères minimum"
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
            {pending ? 'Création…' : 'Créer le compte'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 px-(--card-spacing)">
        <p className="text-muted-foreground text-sm">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
