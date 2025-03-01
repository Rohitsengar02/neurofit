'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaClock, FaCalendarCheck, FaMedal } from 'react-icons/fa';

const MindfulnessTracker = () => {
  const minutes = 25;
  const dailyGoal = 30;
  const streak = 7;
  const progress = (minutes / dailyGoal) * 100;

  // Animation variants for floating particles
  const particleVariants = {
    animate: (custom: number) => ({
      y: [0, -20, 0],
      x: [0, custom * 10, 0],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: custom * 0.2
      }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 rounded-2xl p-6 text-white"
    >
      {/* Animated floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          variants={particleVariants}
          animate="animate"
          custom={i - 3}
          className="absolute w-3 h-3 rounded-full bg-white/10"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${30 + (i * 10)}%`
          }}
        />
      ))}

      {/* Card Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaBrain className="w-6 h-6" />
            </motion.div>
            <h3 className="text-lg font-semibold">Mindfulness</h3>
          </div>
          <motion.div
            className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaMedal className="w-4 h-4 text-yellow-300" />
            <span>{streak} days</span>
          </motion.div>
        </div>

        <div className="flex justify-center mb-6">
          <motion.div
            className="relative w-32 h-32"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                className="stroke-white/20"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                className="stroke-white"
                strokeWidth="8"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round"
                style={{
                  strokeDasharray: "400, 400"
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold">{minutes}</div>
                <div className="text-sm opacity-80">minutes</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FaClock className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Today's Goal</span>
              </div>
              <div className="text-lg font-semibold">{dailyGoal} min</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FaCalendarCheck className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Best Streak</span>
              </div>
              <div className="text-lg font-semibold">14 days</div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Daily Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
              />
            </div>
          </motion.div>

          <motion.button
            className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Session
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MindfulnessTracker;
