'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaHome, FaWalking, FaUtensils, FaUser, FaCog, 
  FaAppleAlt, FaChartLine, FaDumbbell, FaBrain,
  FaStore, FaUserFriends, FaSpa, FaHeart,
  FaYinYang, FaLeaf
} from 'react-icons/fa';
import { BsGrid3X3GapFill, BsRobot } from 'react-icons/bs';
import { GiMuscleUp } from 'react-icons/gi';
import { MdRestaurant } from 'react-icons/md';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

const moreMenuItems: Tab[] = [
  { id: 'physical', label: 'Physical', icon: FaDumbbell, color: 'from-blue-400 to-blue-600', href: '/' },
  { id: 'mental', label: 'Mental', icon: FaBrain, color: 'from-purple-400 to-purple-600', href: '/pages/mental' },
  { id: 'nutrition', label: 'Nutrition', icon: FaAppleAlt, color: 'from-green-400 to-green-600', href: '/nutrition' },
  { id: 'social', label: 'Social', icon: FaUserFriends, color: 'from-pink-400 to-pink-600', href: '/social' },
  { id: 'relax', label: 'Relax', icon: FaSpa, color: 'from-pink-400 to-pink-600', href: '/pages/relax' },
  { id: 'wellness', label: 'Wellness', icon: FaHeart, color: 'from-red-400 to-red-600', href: '/wellness' },
  { id: 'mindful', label: 'Mindful', icon: FaYinYang, color: 'from-yellow-400 to-yellow-600', href: '/mindful' },
  { id: 'nature', label: 'Nature', icon: FaLeaf, color: 'from-emerald-400 to-emerald-600', href: '/nature' },
  { id: 'diet', label: 'Diet', icon: MdRestaurant, color: 'from-orange-400 to-orange-600', href: '/diet' },
  { id: 'steps', label: 'Steps', icon: FaWalking, color: 'from-blue-400 to-blue-600', href: '/pages/steps' }
];

const bottomTabs: Tab[] = [
  { id: 'home', label: 'Home', icon: FaHome, color: 'from-blue-500 to-blue-700', href: '/' },
  { id: 'workouts', label: 'Workouts', icon: GiMuscleUp, color: 'from-purple-500 to-purple-700', href: '/pages/workout' },
  { id: 'shop', label: 'Shop', icon: FaStore, color: 'from-orange-400 to-orange-600', href: '/pages/shop' },
  { id: 'assistant', label: 'Assistant', icon: BsRobot, color: 'from-cyan-500 to-cyan-700', href: '/assistant' },
  { id: 'more', label: 'More', icon: BsGrid3X3GapFill, color: 'from-gray-500 to-gray-700' },
];

export default function MobileBottomMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);

  const handleTabClick = (tab: Tab) => {
    if (tab.id === 'more') {
      setIsMoreMenuOpen(!isMoreMenuOpen);
    } else if (tab.href) {
      router.push(tab.href);
      setIsMoreMenuOpen(false);
    }
  };

  return (
    <>
      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-between items-center px-6 py-2">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors
                ${pathname === tab.href 
                  ? `bg-gradient-to-r ${tab.color} text-white` 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* More Menu Modal */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-xl shadow-lg z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-2">More Options</h3>
              <div className="grid grid-cols-3 gap-4">
                {moreMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabClick(item);
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${item.color} text-white mb-1`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
