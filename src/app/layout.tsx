import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { DirectionProvider } from 'radix-ui/direction';
import { Toaster } from '@/components/ui/sonner';
import { SpatialBackground } from '@/components/three/spatial-background';
import { localeDirection } from '@/i18n/config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoArabic = Noto_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = localeDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>
            <SpatialBackground />
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
            <Toaster richColors position="top-center" />
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
