import { ThemeProvider } from 'next-themes';
import Sidebar from '../Navigation/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="pl-16 transition-all duration-300">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
