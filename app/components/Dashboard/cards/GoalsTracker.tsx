'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaCheckCircle, FaClock, FaRunning, FaDumbbell, FaHeart } from 'react-icons/fa';

const GoalsTracker = () => {
  // Demo goals data
  const goals = [
    {
      id: 1,
      title: 'Run 5K',
      progress: 80,
      icon: FaRunning,
      deadline: '3 days left',
      status: 'In Progress',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      title: 'Weight Training',
      progress: 100,
      icon: FaDumbbell,
      deadline: 'Completed',
      status: 'Completed',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 3,
      title: 'Cardio Minutes',
      progress: 60,
      icon: FaHeart,
      deadline: '5 days left',
      status: 'In Progress',
      color: 'from-red-400 to-red-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-800 rounded-2xl p-6 text-white"
    >
      {/* Animated particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
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
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaTrophy className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <h3 className="text-lg font-semibold">Goals Tracker</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          2/3 Active Goals
        </motion.div>
      </div>

      {/* Goals List */}
      <div className="relative z-10 space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${goal.color}`}>
                  <goal.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">{goal.title}</div>
                  <div className="flex items-center space-x-2 text-xs opacity-80">
                    <FaClock className="w-3 h-3" />
                    <span>{goal.deadline}</span>
                  </div>
                </div>
              </div>
              {goal.progress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <FaCheckCircle className="w-5 h-5 text-green-300" />
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">{goal.status}</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Add Button */}
      <motion.button
        className="relative z-10 w-full mt-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Add New Goal
      </motion.button>
    </motion.div>
  );
};

export default GoalsTracker;
