'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiMoon, FiBell, FiLock, FiHelpCircle, FiInfo } from 'react-icons/fi';

const SettingsPage = () => {
  const settingsSections = [
    {
      icon: FiMoon,
      title: 'Appearance',
      description: 'Dark mode, theme settings',
      color: 'text-purple-500'
    },
    {
      icon: FiBell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      color: 'text-blue-500'
    },
    {
      icon: FiLock,
      title: 'Privacy & Security',
      description: 'Password, account security',
      color: 'text-green-500'
    },
    {
      icon: FiHelpCircle,
      title: 'Help & Support',
      description: 'FAQs, contact support',
      color: 'text-amber-500'
    },
    {
      icon: FiInfo,
      title: 'About',
      description: 'App version, legal info',
      color: 'text-red-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <FiSettings className="text-2xl text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`${section.color} text-xl`}>
                <section.icon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsPage;
