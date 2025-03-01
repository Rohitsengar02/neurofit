'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaRunning, FaDumbbell, FaHeartbeat, FaWeight, FaPlus } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';

const FitnessGoals = () => {
  // Demo goals data
  const goals = [
    {
      id: 1,
      title: 'Weight Loss',
      target: '-5 kg',
      progress: 60,
      icon: FaWeight,
      timeline: '2 months',
      color: 'from-pink-400 to-rose-600'
    },
    {
      id: 2,
      title: 'Muscle Gain',
      target: '+3 kg',
      progress: 45,
      icon: GiMuscleUp,
      timeline: '3 months',
      color: 'from-blue-400 to-indigo-600'
    },
    {
      id: 3,
      title: 'Cardio Fitness',
      target: '5K Run',
      progress: 75,
      icon: FaRunning,
      timeline: '1 month',
      color: 'from-green-400 to-emerald-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border-2 border-white rounded-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
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
            <FaDumbbell className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Fitness Goals</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
        >
          <FaPlus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Goals List */}
      <div className="relative z-10 space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 group hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${goal.color}`}>
                  <goal.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">{goal.title}</div>
                  <div className="text-sm opacity-80">Target: {goal.target}</div>
                </div>
              </div>
              <div className="text-sm opacity-80">{goal.timeline}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="mt-3 pt-3 border-t border-white/10 flex justify-between"
            >
              <button className="text-xs opacity-80 hover:opacity-100 transition-opacity">Update Progress</button>
              <button className="text-xs opacity-80 hover:opacity-100 transition-opacity">View Details</button>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 text-center text-sm opacity-80"
      >
        Stay consistent, results take time! 💪
      </motion.div>
    </motion.div>
  );
};

export default FitnessGoals;
