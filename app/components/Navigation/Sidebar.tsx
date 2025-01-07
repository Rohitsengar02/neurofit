import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { name: 'Profile', icon: UserIcon, path: '/profile' },
  { name: 'Progress', icon: ChartBarIcon, path: '/progress' },
  { name: 'Schedule', icon: CalendarIcon, path: '/schedule' },
  { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={false}
    >
      <div className="flex flex-col h-full">
        <div className="p-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-3 py-2 my-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isExpanded ? 'justify-start' : 'justify-center'
              }`}
            >
              <item.icon className="w-6 h-6" />
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 text-sm font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
