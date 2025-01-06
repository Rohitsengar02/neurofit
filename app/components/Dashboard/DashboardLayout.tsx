import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState('dashboard');

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, id: 'dashboard' },
    { name: 'Progress', icon: ChartBarIcon, id: 'progress' },
    { name: 'Schedule', icon: CalendarIcon, id: 'schedule' },
    { name: 'Profile', icon: UserCircleIcon, id: 'profile' },
    { name: 'Settings', icon: Cog6ToothIcon, id: 'settings' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-6">
        <div className="flex-1 space-y-4">
          {navigation.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center
                       transition-colors duration-200
                       ${activePage === item.id
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={handleSignOut}
          className="w-12 h-12 rounded-xl flex items-center justify-center
                   text-red-400 hover:bg-red-500/20 hover:text-red-300
                   transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="ml-20">
        {children}
      </main>
    </div>
  );
}
