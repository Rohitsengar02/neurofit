'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaDumbbell, FaRunning, FaBiking, FaSwimmer } from 'react-icons/fa';
import { IoMdFitness } from 'react-icons/io';

const WorkoutStreak = () => {
  const currentStreak = 7;
  const bestStreak = 14;

  // Demo workout history data
  const workoutHistory = [
    { id: 1, type: 'Running', icon: FaRunning, duration: '45 min', calories: 320, date: 'Today' },
    { id: 2, type: 'Cycling', icon: FaBiking, duration: '60 min', calories: 450, date: 'Yesterday' },
    { id: 3, type: 'Swimming', icon: FaSwimmer, duration: '30 min', calories: 280, date: '2 days ago' },
    { id: 4, type: 'Yoga', icon: IoMdFitness, duration: '40 min', calories: 180, date: '3 days ago' },
    { id: 5, type: 'Running', icon: FaRunning, duration: '50 min', calories: 380, date: '4 days ago' },
    { id: 6, type: 'Cycling', icon: FaBiking, duration: '45 min', calories: 340, date: '5 days ago' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-800 rounded-2xl p-6 text-white"
    >
      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaFire className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <h3 className="text-lg font-semibold">Workout Streak</h3>
        </div>
        <div className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          Best: {bestStreak} days
        </div>
      </div>

      {/* Current Streak */}
      <div className="relative z-10 text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-1"
        >
          {currentStreak} Days
        </motion.div>
        <div className="text-sm opacity-80">Current Streak</div>
      </div>

      {/* Workout History - Horizontally Scrollable */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-4">Recent Workouts</h4>
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
            {workoutHistory.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2"
                style={{ minWidth: '140px' }}
              >
                <workout.icon className="w-6 h-6 mb-1" />
                <div className="text-sm font-medium">{workout.type}</div>
                <div className="text-xs opacity-80">{workout.duration}</div>
                <div className="text-xs opacity-80">{workout.calories} cal</div>
                <div className="text-xs opacity-60">{workout.date}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex justify-between items-center text-sm">
          <span className="opacity-80">This Week</span>
          <span className="font-medium">4 workouts · 890 cal</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutStreak;
