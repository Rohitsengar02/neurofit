"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';

interface MacroData {
  type: string;
  percentage: number;
  color: string;
  icon: string;
}

const MacroOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);

  const macros: MacroData[] = [
    { type: 'Carbs', percentage: 45, color: 'from-green-400 to-green-500', icon: '🌾' },
    { type: 'Protein', percentage: 35, color: 'from-blue-400 to-blue-500', icon: '🥩' },
    { type: 'Fats', percentage: 20, color: 'from-purple-400 to-purple-500', icon: '🥑' },
  ];

  const CalorieCircle = () => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = 75; // 75% of daily goal
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <motion.div 
        className="relative w-48 h-48 mx-auto mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 1.5
        }}
      >
        {/* Backdrop Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 rounded-full blur-xl" />
        
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-200 dark:text-gray-800"
          />
        </svg>

        {/* Progress Circle */}
        <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span 
            className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.7 }}
          >
            1,850
          </motion.span>
          <motion.div 
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.8 }}
          >
            calories
            <div className="text-xs mt-1">
              of 2,100 goal
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-4"
    >
      <motion.div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-2xl p-6 backdrop-blur-lg"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
      

        {/* Calorie Circle */}
        <CalorieCircle />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {macros.map((macro, index) => (
            <motion.div
              key={macro.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              onHoverStart={() => setHoveredMacro(macro.type)}
              onHoverEnd={() => setHoveredMacro(null)}
            >
              <motion.div
                className={`p-4 rounded-xl bg-gradient-to-br ${macro.color} relative overflow-hidden`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{macro.icon}</span>
                    <motion.span 
                      className="text-white font-bold text-xl"
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: hoveredMacro === macro.type ? [1, 1.2, 1] : 1 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {macro.percentage}%
                    </motion.span>
                  </div>
                  
                  <h3 className="text-white font-medium">{macro.type}</h3>
                  
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${macro.percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Tap on each macro to see detailed breakdown
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MacroOverview;
