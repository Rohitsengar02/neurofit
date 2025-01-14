"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaComments } from 'react-icons/fa';
import { IoMdFitness } from 'react-icons/io';
import { BsGrid3X3GapFill, BsRobot } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { GiMuscleUp } from 'react-icons/gi';
import { TbHeartRateMonitor } from 'react-icons/tb';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { useLayout } from '@/app/context/LayoutContext';
import PullDownCalendar from '../PullToRefresh/PullDownCalendar';

interface Tab {
  name: string;
  href: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'Workout', href: '/pages/workout', icon: GiMuscleUp },
  { name: 'Assistant', href: '/assistant', icon: BsRobot },
  { name: 'Health', href: '#', icon: TbHeartRateMonitor },
];

const allTabs: Tab[] = [
  ...tabs.filter(tab => tab.name !== 'Health'),
  { name: 'Diet', href: '/diet', icon: IoMdFitness },
  { name: 'Progress', href: '/progress', icon: IoMdFitness },
  { name: 'Settings', href: '/pages/settings', icon: IoMdFitness },
  { name: 'Help', href: '/help', icon: IoMdFitness },
  { name: 'Profile', href: '/pages/profile', icon: IoMdFitness },
];

export default function MobileBottomMenu() {
  const { isPullDownOpen, setIsPullDownOpen } = useLayout();
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (href: string, name: string) => {
    if (name === 'Health') {
      setIsPullDownOpen(!isPullDownOpen);
    } else {
      setIsPullDownOpen(false);
      router.push(href);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${isPullDownOpen ? 'translate-y-0' : ''}`}>
      <div className="relative">
        {isPullDownOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsPullDownOpen(true)}
            className="absolute -top-12 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-1.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="w-5 h-5 text-white"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </div>
          </motion.button>
        )}
        
        <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.href, tab.name)}
                className="flex flex-col items-center p-2 relative"
              >
                {tab.name === 'Health' ? (
                  <motion.div
                    className="relative"
                    animate={{ rotate: isPullDownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isPullDownOpen ? (
                      <IoClose className={`w-6 h-6 text-blue-500`} />
                    ) : (
                      <tab.icon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
                    )}
                    <motion.div
                      className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                      animate={{ rotate: isPullDownOpen ? 180 : 0, opacity: isPullDownOpen ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MdKeyboardArrowDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                  </motion.div>
                ) : (
                  <tab.icon
                    className={`w-6 h-6 ${
                      pathname === tab.href
                        ? 'text-blue-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                )}
                <span
                  className={`text-xs mt-1 ${
                    (pathname === tab.href) || (tab.name === 'Health' && isPullDownOpen)
                      ? 'text-blue-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => setIsPullDownOpen(false)}
              className="flex flex-col items-center p-2"
            >
              <BsGrid3X3GapFill className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">More</span>
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {isPullDownOpen && (
            <motion.div
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%' }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed top-0 left-0 right-0 bottom-16 bg-white dark:bg-gray-900 z-40"
            >
              <div className="relative h-full w-full">
                <div className="sticky top-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 z-50 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Overview</h2>
                </div>
                <div className="h-[calc(100%-4rem)] overflow-y-auto">
                  <PullDownCalendar />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
