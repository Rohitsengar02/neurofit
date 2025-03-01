'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaAppleAlt, FaCarrot, FaEgg, FaBreadSlice } from 'react-icons/fa';
import { GiMeat } from 'react-icons/gi';

const CalorieTracker = () => {
  const caloriesConsumed = 1850;
  const calorieGoal = 2200;
  const progress = (caloriesConsumed / calorieGoal) * 100;

  // Demo meal data
  const meals = [
    { id: 1, name: 'Breakfast', time: '8:00 AM', calories: 450, icon: FaEgg, items: ['Oatmeal', 'Eggs', 'Coffee'] },
    { id: 2, name: 'Lunch', time: '1:00 PM', calories: 650, icon: FaCarrot, items: ['Grilled Chicken', 'Salad', 'Rice'] },
    { id: 3, name: 'Snack', time: '4:00 PM', calories: 200, icon: FaAppleAlt, items: ['Apple', 'Almonds'] },
    { id: 4, name: 'Dinner', time: '7:30 PM', calories: 550, icon: GiMeat, items: ['Salmon', 'Vegetables', 'Quinoa'] }
  ];

  // Macro distribution
  const macros = {
    protein: 35,
    carbs: 45,
    fats: 20
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-800 rounded-2xl p-6 text-white"
    >
      {/* Animated food particles */}
      <div className="absolute inset-0">
        {[FaAppleAlt, FaCarrot, FaEgg, FaBreadSlice].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-white/10"
            animate={{
              y: [0, -30, 0],
              x: [0, index % 2 === 0 ? 10 : -10, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + index * 20}%`,
              top: `${70 + (index % 3) * 10}%`,
              fontSize: '2rem',
            }}
          >
            <Icon />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
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
            <FaFire className="w-6 h-6 text-red-300" />
          </motion.div>
          <h3 className="text-lg font-semibold">Calorie Tracker</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          {caloriesConsumed} / {calorieGoal} cal
        </motion.div>
      </div>

      {/* Progress Circle */}
      <div className="relative z-10 flex justify-center mb-6">
        <motion.div
          className="relative w-32 h-32"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              className="stroke-white/20"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              className="stroke-white"
              strokeWidth="8"
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
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold">{Math.round(progress)}%</div>
              <div className="text-sm opacity-80">of daily goal</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Macros Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6"
      >
        <h4 className="text-sm font-medium mb-3">Macro Distribution</h4>
        <div className="space-y-3">
          {Object.entries(macros).map(([macro, percentage], index) => (
            <div key={macro} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize opacity-80">{macro}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Meals List */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Today's Meals</h4>
        <div className="space-y-3">
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-3"
            >
              <div className="p-2 bg-white/10 rounded-lg">
                <meal.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{meal.name}</div>
                  <div className="text-xs opacity-80">{meal.calories} cal</div>
                </div>
                <div className="text-xs opacity-60 mt-0.5">{meal.time}</div>
                <div className="text-xs opacity-80 mt-1">{meal.items.join(', ')}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CalorieTracker;
