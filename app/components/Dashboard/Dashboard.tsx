'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCards } from 'swiper/modules';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { extractNameFromEmail } from '../../utils/userUtils';
import Navbar from '../Navigation/Navbar';
import MobileBottomMenu from '../Navigation/MobileBottomMenu';
import Sidebar from '../Navigation/Sidebar';
import PullDownFitnessStats from '../PullToRefresh/PullDownCalendar';
import { useLayout } from '@/app/context/LayoutContext';
import { 
  FaDumbbell, 
  FaFire, 
  FaHeartbeat, 
  FaRunning, 
  FaMedal, 
  FaAppleAlt, 
  FaWater, 
  FaShoePrints, 
  FaBed, 
  FaClock,
  FaChartLine,
  FaCalendar,
  FaBolt,
  FaRegBell
} from 'react-icons/fa';
import { IoWater, IoFitness, IoNutrition, IoTrendingUp } from 'react-icons/io5';
import { FiBell } from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import MacroOverview from './MacroOverview';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const activityData = [
  { name: 'Mon', calories: 2100, steps: 8000, weight: 75.5 },
  { name: 'Tue', calories: 2300, steps: 10000, weight: 75.3 },
  { name: 'Wed', calories: 2200, steps: 7500, weight: 75.2 },
  { name: 'Thu', calories: 2400, steps: 12000, weight: 75.0 },
  { name: 'Fri', calories: 2150, steps: 9000, weight: 74.8 },
  { name: 'Sat', calories: 2250, steps: 11000, weight: 74.7 },
  { name: 'Sun', calories: 2350, steps: 8500, weight: 74.5 },
];

const fitnessScoreData = [
  { subject: 'Strength', A: 85, fullMark: 100 },
  { subject: 'Endurance', A: 75, fullMark: 100 },
  { subject: 'Flexibility', A: 65, fullMark: 100 },
  { subject: 'Balance', A: 70, fullMark: 100 },
  { subject: 'Speed', A: 80, fullMark: 100 },
  { subject: 'Power', A: 78, fullMark: 100 },
];

const sleepData = [
  { name: 'Deep', value: 2.5, color: '#4F46E5' },
  { name: 'Light', value: 4.5, color: '#818CF8' },
  { name: 'REM', value: 1.5, color: '#C7D2FE' },
  { name: 'Awake', value: 0.5, color: '#E0E7FF' },
];

const workoutData = [
  { title: 'Morning Run', type: 'Cardio', duration: '45 min', calories: 450, icon: FaRunning, intensity: 'High' },
  { title: 'Upper Body', type: 'Strength', duration: '60 min', calories: 380, icon: FaDumbbell, intensity: 'Medium' },
  { title: 'HIIT Session', type: 'High Intensity', duration: '30 min', calories: 320, icon: FaFire, intensity: 'High' },
  { title: 'Yoga Flow', type: 'Flexibility', duration: '40 min', calories: 200, icon: IoFitness, intensity: 'Low' },
];

const upcomingWorkouts = [
  { title: 'Leg Day', time: '10:00 AM', trainer: 'Mike Johnson', type: 'Strength' },
  { title: 'Cardio Blast', time: '2:00 PM', trainer: 'Sarah Smith', type: 'Cardio' },
  { title: 'Yoga Flow', time: '5:00 PM', trainer: 'Emma Davis', type: 'Flexibility' },
];

const quickActions = [
  { title: 'Start Workout', icon: FaDumbbell, color: 'from-purple-500 to-indigo-500' },
  { title: 'Track Meal', icon: FaAppleAlt, color: 'from-green-500 to-emerald-500' },
  { title: 'Log Weight', icon: FaChartLine, color: 'from-blue-500 to-cyan-500' },
  { title: 'Set Goals', icon: FaMedal, color: 'from-yellow-500 to-orange-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const Dashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const [waterIntake, setWaterIntake] = useState(2.4);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { 
    isExpanded, 
    setIsExpanded, 
    isMobileOpen, 
    setIsMobileOpen,
    isPullDownOpen,
    setIsPullDownOpen 
  } = useLayout();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDataDoc = await getDoc(doc(db, 'userdata', user.uid));
          if (userDataDoc.exists()) {
            const userData = userDataDoc.data();
            const firstName = userData.profile?.firstName || '';
            setUserName(firstName);
          } else {
            console.log('No user data found');
            setUserName('');
          }
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setUserName('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserName();
  }, []);

  return (
    <>
      <Navbar setIsMobileOpen={setIsMobileOpen} />
      <Sidebar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 pb-20">
        <div className={`max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 transition-all duration-300 ${
          isExpanded ? 'md:ml-64' : 'md:ml-20'
        }`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 md:space-y-8"
          >
            {/* Compact Welcome Message */}
            <motion.div 
              className="flex items-center justify-between px-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2 
                  }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 rounded-full blur-sm" />
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg relative">
                    👋
                  </div>
                </motion.div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  >
                    Welcome back
                    {!isLoading && userName && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text"
                      >
                        , {userName}
                      </motion.span>
                    )}!
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    Ready for today&apos;s goals?
                  </motion.div>
                </div>
              </div>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <FiBell className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    className="flex-shrink-0 w-[160px] snap-start first:ml-0 last:mr-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`
                      bg-gradient-to-br ${action.color} p-6 rounded-3xl
                      h-[180px] flex flex-col items-center justify-center gap-4
                      text-white shadow-lg hover:shadow-xl
                      transition-shadow duration-300
                      border border-white/10 backdrop-blur-sm
                      cursor-pointer
                    `}>
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: index * 0.1 + 0.2,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="relative"
                      >
                        <div className="absolute -inset-3 bg-white/20 rounded-full blur-lg" />
                        <action.icon size={32} className="relative z-10" />
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                        className="text-center"
                      >
                        <div className="font-semibold text-lg">{action.title}</div>
                        <div className="text-xs text-white/80 mt-1">Tap to start</div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Subtle scroll indicator */}
              <motion.div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-6 h-1 rounded-full bg-violet-500/50" />
                <div className="w-1 h-1 rounded-full bg-violet-500/30" />
                <div className="w-1 h-1 rounded-full bg-violet-500/30" />
                <div className="w-1 h-1 rounded-full bg-violet-500/30" />
              </motion.div>
            </motion.div>

            {/* Macro Overview at Top */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <IoNutrition className="mr-2 text-purple-500" />
                  Macro Overview
                </h2>
                <select className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <MacroOverview />
            </motion.div>

          

            {/* Activity and Sleep Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Trends */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-2xl p-6 backdrop-blur-lg relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative gradient blur */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full blur-3xl" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6 relative">
                  <motion.h2 
                    className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <motion.div
                      className="mr-2 p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FaChartLine className="text-violet-500" />
                    </motion.div>
                    Activity Trends
                  </motion.h2>

                  <div className="flex space-x-3">
                    <motion.select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="appearance-none bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer outline-none transition-all hover:shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option value="calories">Calories</option>
                      <option value="steps">Steps</option>
                      <option value="weight">Weight</option>
                    </motion.select>

                    <motion.select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="appearance-none bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer outline-none transition-all hover:shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </motion.select>
                  </div>
                </div>

                <motion.div 
                  className="h-[300px] md:h-[400px] relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="#94A3B8" 
                        tick={{ fill: '#94A3B8' }}
                        tickLine={{ stroke: '#94A3B8' }}
                      />
                      <YAxis 
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8' }}
                        tickLine={{ stroke: '#94A3B8' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fill="url(#colorMetric)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>

              {/* Sleep Overview */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-2xl p-6 backdrop-blur-lg relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative gradient blur */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
                
                <motion.h2 
                  className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <motion.div
                    className="mr-2 p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaBed className="text-blue-500" />
                  </motion.div>
                  Sleep Analysis
                </motion.h2>

                <motion.div 
                  className="h-[250px] md:h-[300px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sleepData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sleepData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {sleepData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                      className="flex items-center space-x-2 p-3 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <motion.div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {item.name} ({item.value}h)
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* AI Fitness Integration Section */}
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-8"
            >
              <motion.h2 
                className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                AI-Powered Fitness Solutions
              </motion.h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Generate Workout Plan',
                    description: 'Get personalized workout routines based on your fitness goals and level',
                    icon: '💪',
                    gradient: 'from-violet-500 to-purple-500',
                    shadowColor: 'rgba(139, 92, 246, 0.3)',
                    action: 'Generate Plan'
                  },
                  {
                    title: 'Smart Diet Planner',
                    description: 'Create custom meal plans aligned with your nutritional needs and preferences',
                    icon: '🥗',
                    gradient: 'from-emerald-500 to-teal-500',
                    shadowColor: 'rgba(16, 185, 129, 0.3)',
                    action: 'Create Plan'
                  },
                  {
                    title: 'Form Analysis',
                    description: 'AI-powered exercise form analysis using your device camera',
                    icon: '📸',
                    gradient: 'from-blue-500 to-cyan-500',
                    shadowColor: 'rgba(56, 189, 248, 0.3)',
                    action: 'Analyze Form'
                  },
                  {
                    title: 'Progress Insights',
                    description: 'Get AI insights and recommendations based on your fitness progress',
                    icon: '📊',
                    gradient: 'from-orange-500 to-red-500',
                    shadowColor: 'rgba(251, 146, 60, 0.3)',
                    action: 'View Insights'
                  },
                  {
                    title: 'Virtual Coach',
                    description: 'Real-time workout guidance and motivation from your AI coach',
                    icon: '🎯',
                    gradient: 'from-pink-500 to-rose-500',
                    shadowColor: 'rgba(244, 63, 94, 0.3)',
                    action: 'Start Session'
                  },
                  {
                    title: 'Health Predictions',
                    description: 'AI-driven health forecasts and personalized recommendations',
                    icon: '🔮',
                    gradient: 'from-indigo-500 to-blue-500',
                    shadowColor: 'rgba(99, 102, 241, 0.3)',
                    action: 'Get Prediction'
                  }
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: `0 20px 40px ${card.shadowColor}`
                    }}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    <div className={`p-6 bg-gradient-to-br ${card.gradient} h-full`}>
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10">
                        {/* Icon */}
                        <motion.div
                          className="mb-4 inline-block p-3 rounded-xl bg-white/10 text-2xl"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {card.icon}
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {card.title}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                          {card.description}
                        </p>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors duration-200"
                        >
                          {card.action}
                        </motion.button>

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Workouts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Upcoming Workouts */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-xl border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FaCalendar className="mr-2 text-purple-500" />
                  Upcoming Workouts
                </h2>
                <div className="space-y-4">
                  {upcomingWorkouts.map((workout, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{workout.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{workout.trainer}</p>
                        </div>
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{workout.time}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full">
                          {workout.type}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Workouts */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-xl border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FaDumbbell className="mr-2 text-purple-500" />
                  Recent Workouts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workoutData.map((workout, index) => (
                    <motion.div
                      key={workout.title}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-all duration-300">
                          <workout.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{workout.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{workout.type}</p>
                        </div>
                        <span className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${
                          workout.intensity === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          workout.intensity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {workout.intensity}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-4">
                        <span>{workout.duration}</span>
                        <span>{workout.calories} kcal</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Add custom styles for Swiper */}
            <style jsx global>{`
              .swiper-pagination-bullet {
                background: #8B5CF6;
              }
              .quick-actions-swiper {
                padding: 10px 0 30px 0;
              }
              .stats-swiper {
                padding: 10px 0 40px 0;
              }
            `}</style>
          </motion.div>
        </div>
      </div>
      <div className="md:hidden">
        <MobileBottomMenu />
      </div>
      <AnimatePresence>
        {isPullDownOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 right-0 h-[80%] bg-white dark:bg-gray-900 rounded-b-3xl shadow-2xl overflow-y-auto"
              style={{ 
                overscrollBehavior: 'contain',
                transform: isPullDownOpen ? 'translateY(0)' : 'translateY(-100%)'
              }}
            >
              <div className="p-4 h-full relative">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                <button 
                  onClick={() => setIsPullDownOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-gray-500 dark:text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
                <PullDownFitnessStats />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;