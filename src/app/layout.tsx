import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JournalFlow - Your Digital Journaling Companion',
  description: 'A modern journaling application to capture your thoughts, ideas, and memories.',
  keywords: ['journal', 'diary', 'writing', 'reflection', 'personal growth', 'mindfulness'],
  authors: [{ name: 'INOTECH' }],
  openGraph: {
    title: 'JournalFlow - Your Digital Journaling Companion',
    description: 'A modern journaling application to capture your thoughts, ideas, and memories.',
    url: 'https://your-journal-app.com',
    siteName: 'JournalFlow',
    images: [
      {
        url: 'https://your-journal-app.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JournalFlow - Your Digital Journaling Companion',
    description: 'A modern journaling application to capture your thoughts, ideas, and memories.',
    creator: '@yourtwitterhandle',
    images: ['https://your-journal-app.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
