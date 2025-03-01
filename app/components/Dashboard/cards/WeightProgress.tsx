'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaWeight, FaChartLine, FaBullseye, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const WeightProgress = () => {
  // Demo weight data
  const weightData = {
    current: 75.5,
    target: 72,
    start: 82,
    unit: 'kg',
    history: [
      { date: 'Jan 1', weight: 82.0 },
      { date: 'Jan 8', weight: 80.5 },
      { date: 'Jan 15', weight: 79.0 },
      { date: 'Jan 22', weight: 77.8 },
      { date: 'Jan 29', weight: 76.5 },
      { date: 'Feb 5', weight: 75.5 }
    ],
    weeklyChange: -0.8,
    totalChange: -6.5,
    remainingToGoal: 3.5
  };

  const progressPercentage = ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5"
            style={{
              width: '2px',
              height: '40px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: `${Math.random() * 90}deg`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              height: ['40px', '60px', '40px'],
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
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaWeight className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Weight Progress</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          {Math.round(progressPercentage)}% Complete
        </motion.div>
      </div>

      {/* Current Weight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-center mb-8"
      >
        <div className="text-center">
          <div className="text-5xl font-bold mb-1">
            {weightData.current}
            <span className="text-2xl ml-1">{weightData.unit}</span>
          </div>
          <div className="text-sm opacity-80">Current Weight</div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <div>Start: {weightData.start}{weightData.unit}</div>
          <div>Goal: {weightData.target}{weightData.unit}</div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/30 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>
      </div>

      {/* Weight Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
        {[
          { 
            label: 'Weekly Change',
            value: weightData.weeklyChange,
            icon: weightData.weeklyChange < 0 ? FaArrowDown : FaArrowUp,
            color: weightData.weeklyChange < 0 ? 'text-green-300' : 'text-red-300'
          },
          { 
            label: 'Total Loss',
            value: weightData.totalChange,
            icon: FaChartLine,
            color: 'text-blue-300'
          },
          { 
            label: 'To Goal',
            value: weightData.remainingToGoal,
            icon: FaBullseye,
            color: 'text-purple-300'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
          >
            <div className="flex justify-center mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-lg font-bold">{Math.abs(stat.value)}{weightData.unit}</div>
            <div className="text-xs opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weight History */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Weight History</h4>
        <div className="space-y-2">
          {weightData.history.map((record, index) => (
            <motion.div
              key={record.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2"
            >
              <div className="text-sm">{record.date}</div>
              <div className="font-medium">{record.weight}{weightData.unit}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weight Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-1">Weight Insight</div>
        <div className="text-sm opacity-80">
          Great progress! You're consistently losing weight at a healthy rate. Keep it up! 💪
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeightProgress;
