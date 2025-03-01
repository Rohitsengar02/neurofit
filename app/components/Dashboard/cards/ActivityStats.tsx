'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaFire, FaHeartbeat, FaClock, FaBolt } from 'react-icons/fa';

const ActivityStats = () => {
  // Demo activity data
  const stats = [
    {
      id: 1,
      title: 'Active Minutes',
      value: '45',
      unit: 'min',
      icon: FaClock,
      change: '+15%',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      title: 'Calories Burned',
      value: '423',
      unit: 'cal',
      icon: FaFire,
      change: '+8%',
      color: 'from-orange-400 to-red-600'
    },
    {
      id: 3,
      title: 'Avg Heart Rate',
      value: '72',
      unit: 'bpm',
      icon: FaHeartbeat,
      change: '-3%',
      color: 'from-red-400 to-pink-600'
    },
    {
      id: 4,
      title: 'Energy Level',
      value: '85',
      unit: '%',
      icon: FaBolt,
      change: '+12%',
      color: 'from-yellow-400 to-amber-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-800 rounded-2xl p-6 text-white"
    >
      {/* Animated graph lines in background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-white"
            style={{
              top: `${20 + i * 15}%`,
              left: 0,
              right: 0,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaChartLine className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Activity Stats</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          Today
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 relative overflow-hidden group"
          >
            {/* Background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 transition-opacity duration-300`}
              initial={false}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 0.1 }}
            />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <stat.icon className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">{stat.title}</span>
              </div>
              <motion.div
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {stat.change}
              </motion.div>
            </div>

            <div className="flex items-baseline space-x-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.unit}</div>
            </div>

            {/* Animated highlight on hover */}
            <motion.div
              className="absolute inset-0 bg-white opacity-0"
              whileHover={{ opacity: 0.05 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex justify-between text-sm">
          <button className="opacity-80 hover:opacity-100 transition-opacity">Day</button>
          <button className="opacity-80 hover:opacity-100 transition-opacity">Week</button>
          <button className="opacity-80 hover:opacity-100 transition-opacity">Month</button>
          <button className="opacity-80 hover:opacity-100 transition-opacity">Year</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityStats;
