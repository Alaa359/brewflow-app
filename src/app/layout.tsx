import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { SpatialBackground } from '@/components/three/spatial-background';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BrewFlow — Gestion café & restaurant',
  description:
    'Application de gestion pour café/restaurant : ventes, stock, recettes et marges.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SpatialBackground />
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
