import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './styles/components.css'
import './styles/scrollbar.css';
import { AuthContextProvider } from './context/AuthContext'
import MainLayout from './components/Layout/MainLayout'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'NeuroFit - Your AI Fitness Companion',
  description: 'Advanced fitness tracking and AI-powered workout assistance',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthContextProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
