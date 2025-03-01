'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaWater, FaPlus, FaMinus, FaTint, FaClock } from 'react-icons/fa';

const HydrationTracker = () => {
  // Demo hydration data
  const waterData = {
    current: 1800,
    target: 2500,
    unit: 'ml',
    lastDrink: '15 mins ago',
    logs: [
      { time: '8:00 AM', amount: 300 },
      { time: '10:30 AM', amount: 250 },
      { time: '1:00 PM', amount: 500 },
      { time: '3:30 PM', amount: 400 },
      { time: '5:00 PM', amount: 350 }
    ]
  };

  const progress = (waterData.current / waterData.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-600 dark:from-blue-600 dark:to-cyan-800 rounded-2xl p-6 text-white"
    >
      {/* Animated water waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cyan-400/20"
          style={{
            borderRadius: '50%',
            scale: 2,
            y: `${100 - progress}%`,
          }}
          animate={{
            y: [`${100 - progress}%`, `${98 - progress}%`, `${100 - progress}%`],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute inset-0 bg-blue-400/20"
          style={{
            borderRadius: '50%',
            scale: 2,
            y: `${100 - progress}%`,
          }}
          animate={{
            y: [`${100 - progress}%`, `${102 - progress}%`, `${100 - progress}%`],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
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
            <FaWater className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Hydration Tracker</h3>
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

      {/* Main Stats */}
      <div className="relative z-10 text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-2"
        >
          {waterData.current}/{waterData.target}
          <span className="text-lg ml-1">{waterData.unit}</span>
        </motion.div>
        <div className="text-sm opacity-80">
          Last drink {waterData.lastDrink}
        </div>
      </div>

      {/* Quick Add Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 grid grid-cols-3 gap-3 mb-6"
      >
        {[100, 200, 300].map((amount, index) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors text-sm font-medium"
          >
            +{amount}ml
          </motion.button>
        ))}
      </motion.div>

      {/* Water Log */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Today's Log</h4>
        <div className="space-y-3">
          {waterData.logs.map((log, index) => (
            <motion.div
              key={log.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaTint className="w-3 h-3" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{log.amount}ml</div>
                  <div className="opacity-80 text-xs flex items-center space-x-1">
                    <FaClock className="w-3 h-3" />
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaPlus className="w-3 h-3" />
                </button>
                <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaMinus className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl text-sm"
      >
        <div className="font-medium mb-1">Hydration Tip</div>
        <div className="opacity-80">
          Try to drink water before you feel thirsty - it's a sign you're already slightly dehydrated! 💧
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HydrationTracker;
