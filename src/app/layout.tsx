import './globals.css';
import type { Metadata } from 'next';
import { Merriweather, Open_Sans } from 'next/font/google';

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PAGB - Pakistan Army Green Book | Academic Excellence in Military Research',
  description: 'A premier platform for military research, strategic analysis, and professional development. Featuring scholarly discussions and debates by the defense community.',
  keywords: ['military research', 'strategic analysis', 'defense studies', 'army publications', 'academic journal', 'military doctrine'],
  authors: [{ name: 'Pakistan Army' }],
  openGraph: {
    title: 'PAGB - Pakistan Army Green Book',
    description: 'A premier platform for military research and strategic analysis.',
    url: 'https://pagb.army.mil',
    siteName: 'PAGB',
    images: [
      {
        url: 'https://pagb.army.mil/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAGB - Pakistan Army Green Book',
    description: 'A premier platform for military research and strategic analysis.',
    creator: '@PakArmy',
    images: ['https://pagb.army.mil/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${merriweather.variable} ${openSans.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
