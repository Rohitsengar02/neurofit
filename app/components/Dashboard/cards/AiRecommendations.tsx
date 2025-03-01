'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaDumbbell, FaAppleAlt, FaBed, FaRunning } from 'react-icons/fa';

const AiRecommendations = () => {
  // Demo recommendations data
  const recommendations = [
    {
      id: 1,
      type: 'Workout',
      title: 'Try HIIT Training',
      description: 'Based on your goals, a 20-min HIIT session would be perfect for today.',
      icon: FaDumbbell,
      color: 'from-orange-400 to-red-600'
    },
    {
      id: 2,
      type: 'Nutrition',
      title: 'Increase Protein Intake',
      description: 'Add an extra 20g of protein to support your muscle recovery.',
      icon: FaAppleAlt,
      color: 'from-green-400 to-emerald-600'
    },
    {
      id: 3,
      type: 'Sleep',
      title: 'Earlier Bedtime',
      description: 'Try sleeping 30 minutes earlier to improve recovery.',
      icon: FaBed,
      color: 'from-blue-400 to-indigo-600'
    },
    {
      id: 4,
      type: 'Activity',
      title: 'Active Recovery',
      description: 'A light 20-min walk would help with muscle recovery.',
      icon: FaRunning,
      color: 'from-purple-400 to-violet-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
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
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaRobot className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
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

      {/* Recommendations Grid */}
      <div className="relative z-10 grid grid-cols-1 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="flex items-start space-x-4">
              <motion.div
                className={`p-3 rounded-xl bg-gradient-to-r ${rec.color}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <rec.icon className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-80">{rec.type}</div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-2 py-1"
                  >
                    Apply
                  </motion.button>
                </div>
                <div className="font-medium mt-1">{rec.title}</div>
                <div className="text-sm opacity-80 mt-1">{rec.description}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-1">AI Insight</div>
        <div className="text-sm opacity-80">
          These recommendations are personalized based on your recent activity patterns and goals. 🎯
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AiRecommendations;
