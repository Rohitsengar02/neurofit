"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GradientCard, GradientButton, PageTransition } from '../../components/shared/UIComponents';
import { FiUser, FiSettings, FiMoon, FiSun, FiBell, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { useTheme } from 'next-themes';

const ProfilePage = () => {
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { icon: FiBell, label: 'Notifications', badge: '3' },
    { icon: FiSettings, label: 'Settings' },
    { icon: FiHelpCircle, label: 'Help & Support' },
    { icon: FiLogOut, label: 'Logout', danger: true },
  ];

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <GradientCard className="p-6">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FiUser className="w-10 h-10 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </motion.div>
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                John Doe
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 dark:text-gray-400"
              >
                Premium Member
              </motion.p>
            </div>
            <GradientButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </GradientButton>
          </div>
        </GradientCard>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard
                className={`p-4 cursor-pointer transform transition-all hover:scale-[1.02] ${
                  item.danger ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
                    <span className={`font-medium ${item.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full">
                      {item.badge}
                    </div>
                  )}
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
