import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { QrCodeIcon } from 'lucide-react';

export default async function TableMenuNotFound() {
  const t = await getTranslations('Menu.notFound');

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <QrCodeIcon className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>
      <Link href="/" className="text-primary text-sm font-medium">
        {t('back')}
      </Link>
    </main>
  );
}
