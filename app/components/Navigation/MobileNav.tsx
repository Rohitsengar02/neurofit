import { motion } from 'framer-motion';
import { FaHome, FaUser, FaDumbbell, FaUtensils } from 'react-icons/fa';
import Link from 'next/link';

const navItems = [
  { icon: FaHome, label: 'Home', href: '/' },
  { icon: FaDumbbell, label: 'Workouts', href: '/workouts' },
  { icon: FaUtensils, label: 'Diet', href: '/diet' },
  { icon: FaUser, label: 'Profile', href: '/profile' },
];

export default function MobileNav() {
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => (
          <Link href={item.href} key={item.label}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}