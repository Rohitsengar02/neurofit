'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaWalking } from 'react-icons/fa';

const StepsTracker = () => {
  const steps = 7235;
  const goal = 10000;
  const progress = (steps / goal) * 100;

  // Animation variants for the background bubbles
  const bubbleVariants = {
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background bubbles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          variants={bubbleVariants}
          animate="animate"
          custom={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: Math.random() * 60 + 20,
            height: Math.random() * 60 + 20,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}

      {/* Card Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaWalking className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">Daily Steps</h3>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full"
          >
            {Math.round(progress)}%
          </motion.div>
        </div>

        <div className="flex items-center justify-center my-8">
          <motion.div
            className="relative w-36 h-36"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="68"
                className="stroke-white/20"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="72"
                cy="72"
                r="68"
                className="stroke-white"
                strokeWidth="6"
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
            <motion.div
              className="absolute inset-0 flex items-center justify-center flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.span
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {steps.toLocaleString()}
              </motion.span>
              <span className="text-sm opacity-80">steps</span>
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-80">Progress</span>
              <span>{steps.toLocaleString()} / {goal.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <motion.div
            className="grid grid-cols-3 gap-2 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="text-center p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-sm opacity-80">Distance</div>
              <div className="font-semibold">5.8 km</div>
            </div>
            <div className="text-center p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-sm opacity-80">Calories</div>
              <div className="font-semibold">320</div>
            </div>
            <div className="text-center p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-sm opacity-80">Time</div>
              <div className="font-semibold">1h 12m</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepsTracker;
