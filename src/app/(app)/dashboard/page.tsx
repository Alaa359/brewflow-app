import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';

export default async function DashboardPage() {
  const user = await requireRole(Role.ADMIN);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="text-muted-foreground max-w-md">
        Bienvenue, {user.name} — {user.establishmentName}. Le tableau de bord
        (ventes, marges, alertes stock) arrive à l’étape 11.
      </p>
    </main>
  );
}
