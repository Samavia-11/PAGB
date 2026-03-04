import './globals.css';
import type { Metadata } from 'next';
import { Merriweather, Open_Sans } from 'next/font/google';
import { ToastContainer } from '@/components/Toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext';

// Load the fonts with the new recommended approach
const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-opensans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
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
        <ThemeProvider>
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        </ThemeProvider>
        <ToastContainer />
        {/* Security: Client-side deterrence script to disable developer tools */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Security: Deterrence mechanism to disable developer tools access
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });
              
              document.addEventListener('keydown', function(e) {
                // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.keyCode === 123 || // F12
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
                    (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
              
              // Additional protection against console access
              (function() {
                var _log = console.log;
                var _warn = console.warn;
                var _error = console.error;
                console.log = function() { return; };
                console.warn = function() { return; };
                console.error = function() { return; };
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
