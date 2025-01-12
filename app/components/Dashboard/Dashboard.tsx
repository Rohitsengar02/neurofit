'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
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

const quickActions = [
  { title: 'Start Workout', icon: FaDumbbell, color: 'from-purple-500 to-indigo-500' },
  { title: 'Track Meal', icon: FaAppleAlt, color: 'from-green-500 to-emerald-500' },
  { title: 'Log Weight', icon: FaChartLine, color: 'from-blue-500 to-cyan-500' },
  { title: 'Set Goals', icon: FaMedal, color: 'from-yellow-500 to-orange-500' },
];

const Dashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const [waterIntake, setWaterIntake] = useState(2.4);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 md:space-y-8"
        >
          {/* Compact Welcome Message */}
          <div className="flex items-center justify-between">
            <motion.div 
              variants={itemVariants}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-xl">👋</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back, John!</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ready for today&apos;s goals?</p>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FaRegBell className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quick Actions Swiper */}
          <motion.div variants={itemVariants} className="w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView="auto"
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              className="quick-actions-swiper"
            >
              {quickActions.map((action, index) => (
                <SwiperSlide key={index} style={{ width: 'auto' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${action.color} p-4 rounded-2xl shadow-lg cursor-pointer`}
                  >
                    <action.icon className="w-6 h-6 text-white mb-2" />
                    <span className="text-sm font-medium text-white">{action.title}</span>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
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

          {/* Quick Stats Swiper */}
          <motion.div variants={itemVariants} className="w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              className="stats-swiper"
            >
              {[
                { title: 'Daily Steps', value: '8,439', icon: FaRunning, gradient: 'from-emerald-400 to-teal-500' },
                { title: 'Calories Burned', value: '684', icon: FaFire, gradient: 'from-orange-400 to-red-500' },
                { title: 'Heart Rate', value: '72 bpm', icon: FaHeartbeat, gradient: 'from-red-400 to-pink-500' },
                { title: 'Water Intake', value: '2.4L', icon: IoWater, gradient: 'from-blue-400 to-cyan-500' },
              ].map((stat, index) => (
                <SwiperSlide key={index}>
                  <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} p-6 rounded-2xl shadow-lg`}
                  >
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                    <div className="relative z-10">
                      <stat.icon className="w-8 h-8 text-white/90 mb-4" />
                      <h3 className="text-sm font-medium text-white/90">{stat.title}</h3>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

          {/* Activity and Sleep Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FaChartLine className="mr-2 text-purple-500" />
                  Activity Trends
                </h2>
                <div className="flex space-x-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="calories">Calories</option>
                    <option value="steps">Steps</option>
                    <option value="weight">Weight</option>
                  </select>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Sleep Overview */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-xl border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaBed className="mr-2 text-purple-500" />
                Sleep Analysis
              </h2>
              <div className="h-[250px] md:h-[300px]">
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
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {sleepData.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.name} ({item.value}h)</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

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
  );
};

export default Dashboard;