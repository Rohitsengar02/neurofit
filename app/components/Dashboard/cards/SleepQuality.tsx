'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaMoon, FaBed, FaClock, FaChartLine, FaStar } from 'react-icons/fa';

const SleepQuality = () => {
  // Demo sleep data
  const sleepData = {
    score: 85,
    duration: '7h 30m',
    deepSleep: '2h 15m',
    remSleep: '1h 45m',
    lightSleep: '3h 30m',
    timeline: [
      { time: '11:00 PM', phase: 'Light Sleep' },
      { time: '12:30 AM', phase: 'Deep Sleep' },
      { time: '2:45 AM', phase: 'REM' },
      { time: '4:00 AM', phase: 'Light Sleep' },
      { time: '5:30 AM', phase: 'Deep Sleep' },
      { time: '6:30 AM', phase: 'Wake Up' }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-6 text-white"
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: "easeInOut",
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
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaMoon className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Sleep Quality</h3>
        </div>
        <motion.div
          className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaStar className="w-3 h-3 text-yellow-300" />
          <span className="text-sm font-medium">{sleepData.score}</span>
        </motion.div>
      </div>

      {/* Sleep Duration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-center mb-6"
      >
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{sleepData.duration}</div>
          <div className="text-sm opacity-80">Total Sleep Time</div>
        </div>
      </motion.div>

      {/* Sleep Phases */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Deep Sleep', value: sleepData.deepSleep, color: 'from-blue-400 to-blue-600' },
          { label: 'REM', value: sleepData.remSleep, color: 'from-purple-400 to-purple-600' },
          { label: 'Light Sleep', value: sleepData.lightSleep, color: 'from-indigo-400 to-indigo-600' }
        ].map((phase, index) => (
          <motion.div
            key={phase.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
          >
            <div className={`h-1 mb-2 rounded-full bg-gradient-to-r ${phase.color}`} />
            <div className="text-lg font-bold">{phase.value}</div>
            <div className="text-xs opacity-80">{phase.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sleep Timeline */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Sleep Timeline</h4>
        <div className="space-y-2">
          {sleepData.timeline.map((event, index) => (
            <motion.div
              key={event.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-2"
            >
              <div className="p-2 bg-white/10 rounded-lg">
                <FaClock className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{event.time}</div>
                <div className="text-xs opacity-80">{event.phase}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sleep Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="flex items-center space-x-2">
          <FaBed className="w-4 h-4" />
          <div className="text-sm font-medium">Sleep Tip</div>
        </div>
        <div className="text-sm opacity-80 mt-1">
          Try to maintain a consistent sleep schedule, even on weekends, for better sleep quality. 💤
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SleepQuality;
