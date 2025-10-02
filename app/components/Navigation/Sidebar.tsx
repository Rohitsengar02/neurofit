"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaDumbbell, 
  FaChartLine, 
  FaUser, 
  FaUsers,
  FaCalendarAlt, 
  FaCog, 
  FaQuestionCircle,
  FaTimes,
  FaUtensils,
  FaAppleAlt,
  FaBrain,
  FaStore,
  FaUserFriends,
  FaSpa,
  FaHeart,
  FaNewspaper,
  FaRunning,
  FaWalking
} from 'react-icons/fa';
import { RiCommunityFill, RiTeamFill } from 'react-icons/ri';
import { BsGrid3X3GapFill, BsRobot, BsTrophy } from 'react-icons/bs';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { MdRestaurant, MdFeedback } from 'react-icons/md';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const menuSections = [
  {
    title: 'Main',
    items: [
      { icon: FaHome, label: 'Home', path: '/' },
      { icon: FaDumbbell, label: 'Workouts', path: '/workout' },
      { icon: FaRunning, label: 'Exercises', path: '/exercises' },
      { icon: GiWeightLiftingUp, label: 'Custom Workout', path: '/workout-planner' },
      { icon: FaUtensils, label: 'Nutrition', path: '/nutrition' },
      { icon: MdRestaurant, label: 'Diet', path: '/diet' },
      { icon: FaChartLine, label: 'Progress', path: '/progress' },
      { icon: FaCalendarAlt, label: 'Schedule', path: '/schedule' },
    ]
  },
  {
    title: 'Wellness',
    items: [
      { icon: FaBrain, label: 'Mental', path: '/pages/mental' },
      { icon: FaSpa, label: 'Relax', path: '/pages/relax' },
      { icon: FaWalking, label: 'Steps', path: '/pages/steps' },
    ]
  },
  {
    title: 'Community',
    items: [
      { icon: FaUsers, label: 'Community', path: '/pages/community' },
      { icon: RiTeamFill, label: 'Team', path: '/team' },
      { icon: FaNewspaper, label: 'Blog', path: '/blog' },
    ]
  },
  {
    title: 'More',
    items: [
      { icon: BsRobot, label: 'Assistant', path: '/assistant' },
      { icon: BsTrophy, label: 'Neurons', path: '/pages/rewards' },
      { icon: FaStore, label: 'Shop', path: '/pages/shop' },
      { icon: FaUser, label: 'Profile', path: '/profile' },
      { icon: MdFeedback, label: 'Suggestion', path: '/pages/contact' },
      { icon: FaCog, label: 'Settings', path: '/settings' },
      { icon: FaQuestionCircle, label: 'Help', path: '/help' },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const pathname = usePathname();

  const sidebarVariants = {
    expanded: {
      width: "240px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: "72px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={`hidden md:flex fixed left-0 top-0 h-full bg-white dark:bg-zinc-900 shadow-lg z-50 flex-col`}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        initial={false}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center">
            <FaDumbbell className="w-8 h-8 text-[#a20bdb]" />
            <motion.span
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0 }}
              className={`ml-3 text-lg font-semibold text-gray-900 dark:text-white ${!isExpanded && 'hidden'}`}
            >
              NeuroFit
            </motion.span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {isExpanded && (
                <motion.div 
                  className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {section.title}
                </motion.div>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link href={item.path} key={`${sectionIndex}-${itemIndex}`}>
                      <motion.div
                        className={`flex items-center px-4 py-3 cursor-pointer relative group ${
                          isActive ? 'text-[#a20bdb]' : 'text-gray-600 dark:text-gray-400 hover:text-[#a20bdb] dark:hover:text-white'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <motion.span
                          initial={false}
                          animate={{ 
                            opacity: isExpanded ? 1 : 0,
                            display: isExpanded ? 'block' : 'none'
                          }}
                          className="ml-4 text-sm font-medium truncate"
                        >
                          {item.label}
                        </motion.span>
                        {!isExpanded && (
                          <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 w-1 h-full bg-[#a20bdb] rounded-r"
                            layoutId="activeTab"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-[240px] bg-white dark:bg-zinc-900 z-50 md:hidden"
        initial={{ x: -240 }}
        animate={{ x: isMobileOpen ? 0 : -240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mobile Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center">
            <FaDumbbell className="w-8 h-8 text-[#a20bdb]" />
            <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              NeuroFit
            </span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Mobile Navigation Items */}
        <div className="py-4 overflow-y-auto h-[calc(100vh-64px)]">
          {menuSections.map((section, sectionIndex) => (
            <div key={`mobile-${sectionIndex}`} className="mb-6">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      href={item.path} 
                      key={`mobile-${sectionIndex}-${itemIndex}`} 
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <motion.div
                        className={`flex items-center px-4 py-3 cursor-pointer relative ${
                          isActive ? 'text-[#a20bdb]' : 'text-gray-600 dark:text-gray-400 hover:text-[#a20bdb] dark:hover:text-white'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-4 text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="absolute left-0 w-1 h-full bg-[#a20bdb] rounded-r"
                            layoutId="mobileActiveTab"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
