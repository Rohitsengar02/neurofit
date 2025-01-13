"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayout } from '@/app/context/LayoutContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiHome,
  FiPlusCircle,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const MobileBottomMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { isPullDownOpen, setIsPullDownOpen } = useLayout();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { 
      id: 'home', 
      icon: FiHome, 
      color: 'from-purple-500 to-indigo-500',
      activeColor: 'text-indigo-700 dark:text-indigo-400',
      inactiveColor: 'text-gray-400 dark:text-gray-500',
      href: '/'
    },
    { 
      id: 'workout', 
      icon: GiMuscleUp, 
      color: 'from-pink-500 to-rose-500',
      activeColor: 'text-rose-700 dark:text-rose-400',
      inactiveColor: 'text-gray-400 dark:text-gray-500',
      href: '/pages/workout'
    },
    { 
      id: 'add', 
      icon: FiPlusCircle, 
      special: true,
      action: () => setIsPullDownOpen(!isPullDownOpen)
    },
    { 
      id: 'progress', 
      icon: FiTrendingUp, 
      color: 'from-green-500 to-emerald-500',
      activeColor: 'text-emerald-700 dark:text-emerald-400',
      inactiveColor: 'text-gray-400 dark:text-gray-500',
      href: '/pages/progress'
    },
    { 
      id: 'profile', 
      icon: FiUser, 
      color: 'from-blue-500 to-cyan-500',
      activeColor: 'text-cyan-700 dark:text-cyan-400',
      inactiveColor: 'text-gray-400 dark:text-gray-500',
      href: '/pages/profile'
    }
  ];

  const handleTabClick = (tabId: string, href?: string) => {
    if (tabId === 'add') {
      setIsPullDownOpen(!isPullDownOpen);
    } else {
      setActiveTab(tabId);
      if (href) {
        router.push(href);
      }
    }
  };

  // Calculate active index for slider
  const activeIndex = menuItems.findIndex(item => item.id === activeTab);
  const sliderOffset = activeIndex * 40; // 40px per item (w-10)

  return (
    <div className="fixed bottom-8 left-4 right-4 z-[9998] md:hidden">
      <motion.div 
        className="relative bg-white dark:bg-gray-900 rounded-full shadow-lg px-6 py-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Background slider */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800"
          animate={{
            x: sliderOffset + 24, // 24px for padding
            scale: activeTab === 'add' ? 0 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        />

        <div className="relative flex items-center justify-between">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => item.action ? item.action() : handleTabClick(item.id, item.href)}
              className={`
                relative flex flex-col items-center justify-center group
                ${item.special 
                  ? 'w-16 h-16 -mt-8 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg text-white transform -translate-y-1/3' 
                  : 'w-10 h-10 rounded-full'
                }
                ${!item.special && 'overflow-hidden'}
                ${!item.special && (activeTab === item.id ? item.activeColor : item.inactiveColor)}
                transition-all duration-300 ease-in-out
              `}
              style={item.special ? {
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
              } : {}}
              whileHover={!item.special ? { 
                scale: 1.15,
                transition: { type: 'spring', stiffness: 400, damping: 17 }
              } : {}}
              whileTap={{ scale: 0.9 }}
              animate={item.special ? {
                y: isPullDownOpen ? -4 : -12,
                rotate: isPullDownOpen ? 45 : 0,
                scale: isPullDownOpen ? 0.95 : 1,
                transition: { 
                  duration: 0.3,
                  ease: 'easeInOut'
                }
              } : {}}
            >
              {/* Background fill effect */}
              {!item.special && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0`}
                  initial={false}
                  animate={{
                    opacity: activeTab === item.id ? 0.15 : 0
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <motion.div
                className={`relative z-10 flex items-center justify-center ${!item.special ? 'w-full h-full' : ''}`}
                animate={activeTab === item.id && !item.special ? {
                  scale: [1, 1.2, 1],
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut"
                  }
                } : {}}
              >
                {React.createElement(item.icon, {
                  className: `${item.special ? 'text-4xl' : 'text-2xl'}
                    transition-all duration-300`,
                  style: {
                    strokeWidth: activeTab === item.id && !item.special ? 2.5 : 2,
                    filter: activeTab === item.id && !item.special ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none'
                  }
                })}
              </motion.div>

              {/* Active indicator with gradient */}
              {!item.special && (
                <motion.div
                  className={`
                    absolute -bottom-4 w-1.5 h-1.5 rounded-full
                    ${activeTab === item.id ? `bg-gradient-to-r ${item.color} shadow-lg` : 'bg-transparent'}
                  `}
                  layoutId="activeIndicator"
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 25 
                  }}
                >
                  {activeTab === item.id && (
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${item.color} opacity-50`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MobileBottomMenu;
