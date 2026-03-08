'use client';

import { motion } from 'framer-motion';
import { FaHome, FaUser, FaDumbbell, FaCompass, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: FaHome, label: 'Home', href: '/' },
  { icon: FaDumbbell, label: 'Train', href: '/workout' },
  { icon: FaCompass, label: 'Explore', href: '/pages/doctors' },
  { icon: FaHeart, label: 'Health', href: '/diet' },
  { icon: FaUser, label: 'Profile', href: '/profile' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 md:hidden">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 h-20 px-4 flex items-center justify-between"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="relative group">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center w-14 h-14"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-[1.5rem]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'
                  }`} 
                />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] sm:text-xs font-bold mt-1 text-indigo-500"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}