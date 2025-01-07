'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { 
  FaSun, 
  FaMoon, 
  FaDumbbell,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaUser as FaUserIcon,
  FaFire,
  FaWeight,
  FaBullseye
} from 'react-icons/fa';
import { 
  HiOutlineHome,
  HiHome,
  HiOutlineUser,
  HiUser,
  HiOutlineChartBar,
  HiChartBar,
  HiOutlineCog,
  HiCog
} from 'react-icons/hi';
import { 
  IoFitnessOutline,
  IoFitness
} from 'react-icons/io5';
import { UserData } from '../../utils/userService';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface DashboardProps {
  userData: UserData;
}

const dummyData = {
  macros: {
    carbs: 45,
    protein: 35,
    fats: 20
  },
  output: {
    calories: [
      { value: 2100 },
      { value: 2300 },
      { value: 2200 },
      { value: 2400 },
      { value: 2150 },
      { value: 2250 },
      { value: 2350 }
    ],
    weight: [
      { value: 75 },
      { value: 74.8 },
      { value: 74.5 },
      { value: 74.2 },
      { value: 74.0 },
      { value: 73.8 },
      { value: 73.5 }
    ]
  },
  goals: [
    { title: 'Weight Loss', progress: 65 },
    { title: 'Muscle Gain', progress: 40 },
    { title: 'Cardio', progress: 80 }
  ]
};

export default function Dashboard({ userData }: DashboardProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // GSAP Animations
    const ctx = gsap.context(() => {
      // Macro circles animation
      gsap.to('.macro-circle', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      });

      // Progress bars animation
      gsap.from('.goal-progress', {
        scaleX: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.7)',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.goals-section',
          start: 'top center',
          toggleActions: 'restart none none reverse'
        }
      });

      // Calendar animation
      gsap.from('.calendar-container', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.calendar-container',
          start: 'top bottom',
          toggleActions: 'restart none none reverse'
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - rect.left - window.scrollX;
    const y = e.pageY - rect.top - window.scrollY;

    gsap.to(e.currentTarget, {
      '--x': `${x}px`,
      '--y': `${y}px`,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      '--x': '50%',
      '--y': '50%',
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const navItems = [
    { 
      icon: HiOutlineHome, 
      activeIcon: HiHome,
      label: 'Dashboard',
      color: '#a20bdb' 
    },
    { 
      icon: HiOutlineUser, 
      activeIcon: HiUser,
      label: 'Profile',
      color: '#FF6B6B' 
    },
    { 
      icon: IoFitnessOutline, 
      activeIcon: IoFitness,
      label: 'Workouts',
      color: '#4ECDC4' 
    },
    { 
      icon: HiOutlineChartBar, 
      activeIcon: HiChartBar,
      label: 'Progress',
      color: '#45B7D1' 
    },
    { 
      icon: HiOutlineCog, 
      activeIcon: HiCog,
      label: 'Settings',
      color: '#96C' 
    }
  ];

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <style jsx global>{`
        @keyframes lift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(10deg); }
        }
        @keyframes walk {
          0%, 100% { transform: translateX(-20%) scaleX(1); }
          50% { transform: translateX(20%) scaleX(-1); }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <motion.div 
        ref={sidebarRef}
        initial={false}
        animate={{ 
          width: isExpanded ? 240 : 72,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="fixed left-0 top-0 h-screen bg-zinc-900 dark:bg-zinc-900 shadow-[0_0_40px_rgba(162,11,219,0.15)] z-[9999] border-r border-[#a20bdb]/20 hidden md:block"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <motion.div
            initial={false}
            animate={{ 
              paddingLeft: isExpanded ? 24 : 20,
            }}
            className="mb-8 flex items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex items-center"
            >
              <FaDumbbell className="w-8 h-8 text-[#a20bdb]" />
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                    className="ml-3 text-lg font-semibold text-white whitespace-nowrap"
                  >
                    NeuroFit
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Navigation Items */}
          <motion.nav
            initial={false}
            animate={{ 
              paddingLeft: isExpanded ? 16 : 12,
              paddingRight: isExpanded ? 16 : 12,
            }}
            className="flex-1"
          >
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ 
                    x: 4,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center px-3 py-3 rounded-xl text-gray-300 transition-all duration-200 group relative overflow-hidden backdrop-blur-sm ${
                    index === 0 
                      ? 'bg-[#a20bdb]/10 text-[#a20bdb] shadow-[0_0_20px_rgba(162,11,219,0.15)]' 
                      : 'hover:bg-[#a20bdb]/5 hover:shadow-[0_0_20px_rgba(162,11,219,0.1)]'
                  }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#a20bdb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <div className="flex items-center w-full relative z-10">
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 10,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }
                      }}
                    >
                      <item.icon className={`w-5 h-5 ${
                        index === 0 
                          ? 'text-[#a20bdb]' 
                          : 'text-gray-400 group-hover:text-[#a20bdb]'
                      } transition-colors duration-200`} />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15, delay: 0.05 }}
                          className={`ml-3 text-sm font-medium whitespace-nowrap ${
                            index === 0 
                              ? 'text-[#a20bdb]' 
                              : 'text-gray-300 group-hover:text-[#a20bdb]'
                          } transition-colors duration-200`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.nav>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden z-[9999]">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center w-20 h-full relative group"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: index === 0 ? 1.1 : 1,
                  y: index === 0 ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex flex-col items-center"
              >
                {index === 0 ? (
                  <item.activeIcon 
                    className="w-6 h-6 mb-1.5 text-[#a20bdb]"
                  />
                ) : (
                  <item.icon 
                    className="w-6 h-6 mb-1.5 text-gray-400 group-hover:text-[#a20bdb] transition-colors duration-200"
                  />
                )}
                <span 
                  className={`font-outfit text-xs font-medium tracking-wide transition-colors duration-200 ${
                    index === 0 
                      ? 'text-[#a20bdb] scale-105 transform' 
                      : 'text-gray-500 group-hover:text-[#a20bdb]'
                  }`}
                  style={{
                    fontFamily: 'var(--font-outfit)'
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content with Navbar */}
      <div className={`flex-1 transition-all duration-300 ${isExpanded ? 'md:ml-60' : 'md:ml-[72px]'}`}>
        {/* Navbar */}
        <div className="h-16 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between px-4 fixed right-0 left-0 md:left-[72px] top-0 z-40 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800">
          {/* Logo (Mobile Only) and Search Bar */}
          <div className="flex items-center flex-1">
            <div className="md:hidden flex items-center">
              <FaDumbbell className="w-8 h-8 text-[#a20bdb]" />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">NeuroFit</span>
            </div>
            
            {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:block w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-9 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-zinc-800 border-0 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#a20bdb] transition-all duration-300"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="text-[#a20bdb]"
                  >
                    <FaSun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, rotate: 180, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -180, scale: 0.5 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="text-[#a20bdb]"
                  >
                    <FaMoon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications (Hidden on Mobile) */}
            <div className="relative hidden md:block">
              <motion.button
                className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>

            {/* User Profile */}
            <div className="relative flex items-center space-x-3">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
              </div>
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" 
                  alt="User" 
                  className="w-9 h-9 rounded-lg object-cover"
                />
              </motion.button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg py-1 z-50 border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center group"
                      whileHover={{ x: 2 }}
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:text-[#a20bdb]" />
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-16 pb-16 md:pb-0 px-4">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Macros Overview Section */}
              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.3)] p-4 sm:p-4 mx-[-12px] sm:mx-0 px-3 sm:px-4 mb-4 lg:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Macros Overview</h2>
                    <select 
                      className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border-none outline-none cursor-pointer"
                      defaultValue="monthly"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  <div className="block sm:flex sm:items-start sm:space-x-6">
                    {/* Single Multi-colored Progress Circle */}
                    <div className="relative w-36 h-36 flex-shrink-0 mx-auto sm:mx-0 mb-8 sm:mb-0">
                      {/* Background Circle */}
                      <svg className="w-full h-full">
                        <circle
                          className="text-gray-100 dark:text-zinc-800"
                          strokeWidth="9"
                          stroke="currentColor"
                          fill="transparent"
                          r="66"
                          cx="72"
                          cy="72"
                        />
                      </svg>
                      
                      {/* Carbs Progress - Outer */}
                      <div 
                        className="macro-ring-hover group cursor-pointer"
                        onClick={() => {
                          const tooltip = document.getElementById('macro-tooltip');
                          if (tooltip) {
                            tooltip.innerHTML = `
                              <div className="text-lg">
                                <span className="text-green-500 font-semibold">45%</span>
                                <span className="text-xs text-gray-500 ml-1">Carbs</span>
                              </div>
                            `;
                          }
                        }}
                      >
                        <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                          <circle
                            className="text-green-500 transition-all duration-200"
                            strokeWidth="9"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="66"
                            cx="72"
                            cy="72"
                            strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                            transform="rotate(0 72 72)"
                          />
                        </svg>
                      </div>

                      {/* Protein Progress - Middle */}
                      <div 
                        className="macro-ring-hover group cursor-pointer"
                        onClick={() => {
                          const tooltip = document.getElementById('macro-tooltip');
                          if (tooltip) {
                            tooltip.innerHTML = `
                              <div className="text-lg">
                                <span className="text-blue-500 font-semibold">35%</span>
                                <span className="text-xs text-gray-500 ml-1">Protein</span>
                              </div>
                            `;
                          }
                        }}
                      >
                        <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                          <circle
                            className="text-blue-500 transition-all duration-200"
                            strokeWidth="9"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="66"
                            cx="72"
                            cy="72"
                            strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                            transform="rotate(120 72 72)"
                          />
                        </svg>
                      </div>

                      {/* Fats Progress - Inner */}
                      <div 
                        className="macro-ring-hover group cursor-pointer"
                        onClick={() => {
                          const tooltip = document.getElementById('macro-tooltip');
                          if (tooltip) {
                            tooltip.innerHTML = `
                              <div className="text-lg">
                                <span className="text-purple-500 font-semibold">25%</span>
                                <span className="text-xs text-gray-500 ml-1">Fats</span>
                              </div>
                            `;
                          }
                        }}
                      >
                        <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                          <circle
                            className="text-purple-500 transition-all duration-200"
                            strokeWidth="9"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="66"
                            cx="72"
                            cy="72"
                            strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                            transform="rotate(240 72 72)"
                          />
                        </svg>
                      </div>

                      {/* Center Text */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div id="macro-tooltip">
                          <div className="text-lg">
                            <span className="text-gray-900 dark:text-white font-semibold">2,100</span>
                            <div className="text-xs text-gray-500">calories</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Macros List */}
                    <div className="flex-grow">
                      <div className="grid grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-0">
                        {/* Carbs Section */}
                        <div className="sm:mb-4">
                          {/* Macro Heading */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">Carbs</span>
                          </div>
                          {/* Progress Section */}
                          <div className="w-full">
                            {/* Grams Display */}
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>180g</span>
                              <span>250g</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                              <div className="h-1.5 bg-green-500 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Protein Section */}
                        <div className="sm:mb-4">
                          {/* Macro Heading */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">Protein</span>
                          </div>
                          {/* Progress Section */}
                          <div className="w-full">
                            {/* Grams Display */}
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>140g</span>
                              <span>180g</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                              <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '77%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Fats Section */}
                        <div>
                          {/* Macro Heading */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">Fats</span>
                          </div>
                          {/* Progress Section */}
                          <div className="w-full">
                            {/* Grams Display */}
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>80g</span>
                              <span>100g</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                              <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="lg:col-span-8">
                  <div className="flex flex-row lg:justify-end gap-4 mx-[-12px] sm:mx-0 lg:mt-8 lg:mr-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                    {/* Water Card */}
                    <div className="relative w-[100px] h-[100px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 p-3 rounded-xl flex flex-col justify-between">
                      <div className="text-center">
                        <span className="text-xs text-white font-medium">Water</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69zm0-2.83L3.66 8.2a9.98 9.98 0 008.34 17.4 9.98 9.98 0 008.34-17.4L12-.14z"/>
                          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white">
                          <span>1.8L</span>
                          <span>3.0L</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Card */}
                    <div className="relative w-[100px] h-[100px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-600 dark:to-red-700 p-3 rounded-xl flex flex-col justify-between">
                      <div className="text-center">
                        <span className="text-xs text-white font-medium">Exercise</span>
                      </div>
                      <div className="flex justify-center items-center">
                        <div className="animate-[lift_2s_ease-in-out_infinite]">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white">
                          <span>320</span>
                          <span>500 cal</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Steps Card */}
                    <div className="relative w-[100px] h-[100px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 p-3 rounded-xl flex flex-col justify-between">
                      <div className="text-center">
                        <span className="text-xs text-white font-medium">Steps</span>
                      </div>
                      <div className="flex justify-center items-center overflow-hidden">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white">
                          <span>8,400</span>
                          <span>10K</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full" style={{ width: '84%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other content can go here */}
              <div className="lg:col-span-8">
                {/* Add other content */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900 border-l border-gray-100 dark:border-zinc-800 overflow-y-auto">
          {/* Output Section */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Output</h2>
            <div className="space-y-4">
              {/* Calories Card */}
              <div 
                className="p-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl text-white output-card hover:shadow-lg transition-shadow duration-300"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  '--x': '50%',
                  '--y': '50%',
                  background: 'linear-gradient(to bottom right, #f97316, #ec4899)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '-1px',
                    background: 'radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.2), transparent 50%)',
                    borderRadius: 'inherit',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                } as any}>
                <div className="flex items-center mb-2">
                  <FaFire className="w-5 h-5 mr-2" />
                  <span className="font-medium">Calories Burned</span>
                </div>
                <div className="text-2xl font-bold mb-2">1,234 kcal</div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dummyData.output.calories}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ffffff" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weight Card */}
              <div 
                className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white output-card hover:shadow-lg transition-shadow duration-300"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  '--x': '50%',
                  '--y': '50%',
                  background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '-1px',
                    background: 'radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.2), transparent 50%)',
                    borderRadius: 'inherit',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                } as any}>
                <div className="flex items-center mb-2">
                  <FaWeight className="w-5 h-5 mr-2" />
                  <span className="font-medium">Weight Progress</span>
                </div>
                <div className="text-2xl font-bold mb-2">73.5 kg</div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dummyData.output.weight}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ffffff" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 goals-section">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fitness Goals</h2>
            <div className="space-y-4">
              {dummyData.goals.map((goal, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.title}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#a20bdb] rounded-full goal-progress"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar</h2>
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev',
                  center: 'title',
                  right: 'next'
                }}
                height="auto"
                events={[
                  { title: 'Workout', date: '2025-01-07', color: '#a20bdb' },
                  { title: 'Cardio', date: '2025-01-09', color: '#22c55e' },
                  { title: 'Rest', date: '2025-01-11', color: '#f59e0b' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}