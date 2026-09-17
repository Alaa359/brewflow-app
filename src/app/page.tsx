import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';

export default async function Home() {
  const t = await getTranslations('Landing');
  const tCommon = await getTranslations('Common');

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {tCommon('appName')}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-lg">
          {t('tagline')}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">{t('login')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/register">{t('register')}</Link>
        </Button>
      </div>
    </main>
  );
}
