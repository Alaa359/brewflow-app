import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';

export default async function CuisinePage() {
  const user = await requireRole(Role.KITCHEN);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Cuisine</h1>
      <p className="text-muted-foreground max-w-md">
        Bienvenue, {user.name} — {user.establishmentName}. La file des commandes
        en cours arrive à l’étape 14.
      </p>
    </main>
  );
}
