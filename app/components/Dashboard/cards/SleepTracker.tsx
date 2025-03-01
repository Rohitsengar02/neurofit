'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaMoon, FaBed, FaClock, FaStar } from 'react-icons/fa';
import { WiMoonAltWaningCrescent4 } from 'react-icons/wi';

const SleepTracker = () => {
  const sleepScore = 85;
  const sleepHours = 7.5;
  const bedTime = '10:30 PM';
  const wakeTime = '6:00 AM';

  // Demo sleep data for the week
  const weeklyData = [
    { day: 'Mon', hours: 7.5, quality: 85 },
    { day: 'Tue', hours: 8, quality: 90 },
    { day: 'Wed', hours: 6.5, quality: 75 },
    { day: 'Thu', hours: 7, quality: 80 },
    { day: 'Fri', hours: 7.5, quality: 85 },
    { day: 'Sat', hours: 8.5, quality: 95 },
    { day: 'Sun', hours: 7.5, quality: 85 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-800 rounded-2xl p-6 text-white"
    >
      {/* Animated stars background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <WiMoonAltWaningCrescent4 className="w-6 h-6 text-yellow-200" />
          </motion.div>
          <h3 className="text-lg font-semibold">Sleep Tracker</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
        >
          <FaStar className="w-4 h-4 text-yellow-300" />
          <span>{sleepScore}/100</span>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <FaBed className="w-4 h-4 opacity-80" />
            <span className="text-sm opacity-80">Sleep Duration</span>
          </div>
          <div className="text-2xl font-bold">{sleepHours}h</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <FaClock className="w-4 h-4 opacity-80" />
            <span className="text-sm opacity-80">Sleep Schedule</span>
          </div>
          <div className="text-sm">
            <div>{bedTime} - {wakeTime}</div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Sleep Chart */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-4">Weekly Sleep Pattern</h4>
        <div className="flex items-end space-x-2 h-32">
          {weeklyData.map((day, index) => (
            <motion.div
              key={day.day}
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="w-full bg-white/10 rounded-t-lg overflow-hidden">
                <motion.div
                  className="bg-white/30 w-full"
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.hours / 12) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  style={{ minHeight: '20px' }}
                >
                  <div className="h-full relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-white/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: day.quality / 100 }}
                      transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              </div>
              <div className="text-xs mt-2 opacity-60">{day.day}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sleep Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex justify-between items-center text-sm">
          <span className="opacity-80">Sleep Quality</span>
          <span className="font-medium">Excellent 🌙</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SleepTracker;
