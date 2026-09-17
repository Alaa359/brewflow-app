import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          BrewFlow
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-lg">
          Gestion complète de votre café/restaurant : ventes, stock, recettes et
          marges.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">Se connecter</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/register">Créer un établissement</Link>
        </Button>
      </div>
    </main>
  );
}
