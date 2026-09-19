import type { Metadata } from 'next';
import { Sora, Space_Grotesk, Noto_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { DirectionProvider } from 'radix-ui/direction';
import { Toaster } from '@/components/ui/sonner';
import { SpatialBackground } from '@/components/three/spatial-background';
import { localeDirection } from '@/i18n/config';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
      className={`${sora.variable} ${spaceGrotesk.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
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
