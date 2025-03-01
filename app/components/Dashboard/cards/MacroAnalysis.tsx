'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaChartPie, FaCarrot, FaDrumstickBite, FaOilCan } from 'react-icons/fa';

const MacroAnalysis = () => {
  // Demo macro data
  const macros = [
    {
      name: 'Carbohydrates',
      current: 180,
      target: 250,
      unit: 'g',
      icon: FaCarrot,
      color: 'from-orange-400 to-amber-600',
      details: [
        { label: 'Sugar', value: '45g' },
        { label: 'Fiber', value: '28g' },
        { label: 'Other', value: '107g' }
      ]
    },
    {
      name: 'Protein',
      current: 95,
      target: 120,
      unit: 'g',
      icon: FaDrumstickBite,
      color: 'from-red-400 to-rose-600',
      details: [
        { label: 'Essential', value: '35g' },
        { label: 'BCAAs', value: '15g' },
        { label: 'Other', value: '45g' }
      ]
    },
    {
      name: 'Fats',
      current: 55,
      target: 65,
      unit: 'g',
      icon: FaOilCan,
      color: 'from-blue-400 to-indigo-600',
      details: [
        { label: 'Saturated', value: '15g' },
        { label: 'Unsaturated', value: '35g' },
        { label: 'Other', value: '5g' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background circles */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${(i * 20) - 50}px`,
              top: `${(i * 20) - 50}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
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
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <FaChartPie className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Macro Analysis</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          Daily Overview
        </motion.div>
      </div>

      {/* Macros Grid */}
      <div className="relative z-10 grid gap-4">
        {macros.map((macro, index) => (
          <motion.div
            key={macro.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${macro.color}`}>
                  <macro.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">{macro.name}</div>
                  <div className="text-sm opacity-80">
                    {macro.current}/{macro.target}{macro.unit}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                {Math.round((macro.current / macro.target) * 100)}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${macro.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${(macro.current / macro.target) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-2">
              {macro.details.map((detail, i) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 + i * 0.05 }}
                  className="text-center p-2 bg-white/5 rounded-lg"
                >
                  <div className="text-xs opacity-80">{detail.label}</div>
                  <div className="text-sm font-medium">{detail.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-2">Today's Tip</div>
        <div className="text-sm opacity-80">
          Try to consume protein throughout the day instead of in one meal for better absorption! 🥩
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MacroAnalysis;
