'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaAppleAlt, FaCarrot, FaFish, FaEgg } from 'react-icons/fa';

const NutritionScore = () => {
  const score = 85;
  const macros = {
    proteins: 75,
    carbs: 65,
    fats: 80,
    fiber: 70
  };

  // Animation variants for the floating food icons
  const floatingVariants = {
    animate: (custom: number) => ({
      y: [0, -10, 0],
      rotate: [0, custom * 10, 0],
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
      className="relative overflow-hidden bg-gradient-to-br from-lime-500 to-green-600 dark:from-lime-600 dark:to-green-800 rounded-2xl p-6 text-white"
    >
      {/* Floating food icons */}
      <div className="absolute inset-0 opacity-10">
        {[FaAppleAlt, FaCarrot, FaFish, FaEgg].map((Icon, index) => (
          <motion.div
            key={index}
            variants={floatingVariants}
            animate="animate"
            custom={index}
            className="absolute text-3xl"
            style={{
              left: `${20 + index * 20}%`,
              top: `${20 + ((index % 2) * 40)}%`
            }}
          >
            <Icon />
          </motion.div>
        ))}
      </div>

      {/* Card Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaAppleAlt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">Nutrition Score</h3>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            {score}/100
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Macro nutrients */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(macros).map(([macro, value], index) => (
              <motion.div
                key={macro}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm capitalize opacity-80">{macro}</span>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Daily Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3"
          >
            <h4 className="text-sm font-medium">Today's Tips</h4>
            <div className="space-y-2">
              {[
                "Add more leafy greens to your lunch 🥗",
                "Stay hydrated! 8 glasses of water 💧",
                "Include protein in your next meal 🥩"
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="opacity-80">{tip}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="pt-4 border-t border-white/20"
          >
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="opacity-80">Weekly Progress</span>
              <span className="font-medium">+12% from last week</span>
            </div>
            <div className="flex items-end h-12 space-x-1">
              {[65, 70, 75, 80, 78, 85, 85].map((height, index) => (
                <motion.div
                  key={index}
                  className="flex-1 bg-white/20 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                >
                  <motion.div
                    className="w-full h-full"
                    style={{
                      background: index === 6 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs opacity-60">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionScore;
