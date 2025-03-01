'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaRunning, FaSwimmer, FaBiking, FaDumbbell, FaWalking } from 'react-icons/fa';

const WeeklyFitness = () => {
  // Demo weekly fitness data
  const weekData = [
    { day: 'Mon', calories: 450, steps: 8500, activity: 'Running', icon: FaRunning, color: 'from-red-400 to-rose-600' },
    { day: 'Tue', calories: 380, steps: 7200, activity: 'Swimming', icon: FaSwimmer, color: 'from-blue-400 to-indigo-600' },
    { day: 'Wed', calories: 420, steps: 9000, activity: 'Cycling', icon: FaBiking, color: 'from-green-400 to-emerald-600' },
    { day: 'Thu', calories: 320, steps: 6800, activity: 'Weights', icon: FaDumbbell, color: 'from-purple-400 to-violet-600' },
    { day: 'Fri', calories: 400, steps: 8200, activity: 'Walking', icon: FaWalking, color: 'from-yellow-400 to-amber-600' },
    { day: 'Sat', calories: 480, steps: 9500, activity: 'Running', icon: FaRunning, color: 'from-red-400 to-rose-600' },
    { day: 'Sun', calories: 350, steps: 7000, activity: 'Swimming', icon: FaSwimmer, color: 'from-blue-400 to-indigo-600' }
  ];

  const maxCalories = Math.max(...weekData.map(d => d.calories));
  const maxSteps = Math.max(...weekData.map(d => d.steps));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5"
            style={{
              width: '2px',
              height: '100%',
              left: `${(i / 15) * 100}%`,
            }}
            animate={{
              scaleY: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
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
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaChartLine className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Weekly Fitness</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          This Week
        </motion.div>
      </div>

      {/* Activity Chart */}
      <div className="relative z-10 grid grid-cols-7 gap-2 mb-6">
        {weekData.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="space-y-2"
          >
            <div className="h-32 relative">
              <motion.div
                className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${day.color}`}
                initial={{ height: 0 }}
                animate={{ height: `${(day.calories / maxCalories) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium">{day.day}</div>
              <motion.div
                className={`p-1.5 rounded-lg bg-gradient-to-r ${day.color}`}
                whileHover={{ scale: 1.1 }}
              >
                <day.icon className="w-3 h-3" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Calories', value: '2800', unit: 'kcal' },
          { label: 'Avg Steps', value: '8200', unit: 'steps' },
          { label: 'Active Days', value: '6', unit: 'days' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
          >
            <div className="text-sm opacity-80">{stat.label}</div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs opacity-60">{stat.unit}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-1">Weekly Insight</div>
        <div className="text-sm opacity-80">
          Great progress! You've increased your activity by 15% compared to last week. 🎯
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyFitness;
