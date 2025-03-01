'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaChartLine, FaRunning, FaBed } from 'react-icons/fa';

const HeartRate = () => {
  // Demo heart rate data
  const heartData = {
    current: 72,
    min: 58,
    max: 142,
    average: 75,
    zones: [
      { name: 'Rest', rate: '58-70', time: '8h 30m', color: 'from-blue-400 to-blue-600' },
      { name: 'Fat Burn', rate: '71-100', time: '3h 45m', color: 'from-green-400 to-green-600' },
      { name: 'Cardio', rate: '101-130', time: '1h 15m', color: 'from-yellow-400 to-yellow-600' },
      { name: 'Peak', rate: '131-160', time: '25m', color: 'from-red-400 to-red-600' }
    ],
    timeline: [65, 68, 72, 75, 80, 85, 82, 78, 75, 72, 70, 68]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-800 rounded-2xl p-6 text-white"
    >
      {/* Animated pulse background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-white/5 rounded-full"
          style={{
            scale: 2,
          }}
          animate={{
            scale: [2, 2.2, 2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaHeartbeat className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Heart Rate</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          Live
        </motion.div>
      </div>

      {/* Current Heart Rate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-center mb-8"
      >
        <div className="text-center">
          <motion.div
            className="text-5xl font-bold mb-1"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {heartData.current}
          </motion.div>
          <div className="text-sm opacity-80">BPM</div>
        </div>
      </motion.div>

      {/* Heart Rate Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Min', value: heartData.min, icon: FaBed },
          { label: 'Avg', value: heartData.average, icon: FaChartLine },
          { label: 'Max', value: heartData.max, icon: FaRunning }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
          >
            <div className="flex justify-center mb-1">
              <stat.icon className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Heart Rate Zones */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Heart Rate Zones</h4>
        <div className="space-y-3">
          {heartData.zones.map((zone, index) => (
            <motion.div
              key={zone.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium">{zone.name}</div>
                <div className="text-xs opacity-80">{zone.rate} bpm</div>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${zone.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                />
              </div>
              <div className="text-xs opacity-80 mt-1">Time: {zone.time}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Heart Rate Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-1">Heart Rate Insight</div>
        <div className="text-sm opacity-80">
          Your resting heart rate indicates excellent cardiovascular fitness! ❤️
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeartRate;
