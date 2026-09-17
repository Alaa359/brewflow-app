import Link from 'next/link';
import { QrCodeIcon } from 'lucide-react';

export default function TableMenuNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <QrCodeIcon className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          QR code invalide
        </h1>
        <p className="text-muted-foreground text-sm">
          Ce lien de commande n’est plus valide. Demandez le QR code à jour à
          votre serveur.
        </p>
      </div>
      <Link href="/" className="text-primary text-sm font-medium">
        Retour à BrewFlow
      </Link>
    </main>
  );
}
