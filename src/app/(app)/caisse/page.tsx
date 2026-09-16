import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';

export default async function CaissePage() {
  const user = await requireRole(Role.SERVER);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Caisse (POS)</h1>
      <p className="text-muted-foreground max-w-md">
        Bienvenue, {user.name} — {user.establishmentName}. Le point de vente
        (plats, panier, encaissement) arrive à l’étape 8.
      </p>
    </main>
  );
}
