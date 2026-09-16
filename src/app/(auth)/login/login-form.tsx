'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
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

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card size="sm" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace BrewFlow.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@brewflow.tn"
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
              placeholder="••••••••"
              autoComplete="current-password"
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
            {pending ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 px-(--card-spacing)">
        <p className="text-muted-foreground text-sm">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Créer mon établissement
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
