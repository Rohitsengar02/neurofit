import './globals.css';
import './styles/animations.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import PullDownCalendar from './components/PullToRefresh/PullDownCalendar';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: 'NeuroFitness - Your Personal Fitness Journey',
  description: 'AI-powered personalized fitness and nutrition plans',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="m-0 p-0">
      <body className={`${inter.className} ${outfit.variable} m-0 p-0`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="m-0 p-0 min-h-screen">
            <PullDownCalendar />
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}