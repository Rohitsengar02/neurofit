"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GradientCard, GradientButton, PageTransition } from '../../components/shared/UIComponents';
import { FiClock, FiZap, FiTarget } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const WorkoutPage = () => {
  const workoutCategories = [
    { name: 'Strength', icon: GiMuscleUp, color: 'from-rose-500 to-pink-500' },
    { name: 'Cardio', icon: FiZap, color: 'from-orange-500 to-amber-500' },
    { name: 'Flexibility', icon: FiTarget, color: 'from-blue-500 to-cyan-500' },
  ];

  const workouts = [
    {
      name: 'Full Body Workout',
      duration: '45 min',
      difficulty: 'Intermediate',
      calories: '320',
    },
    {
      name: 'HIIT Training',
      duration: '30 min',
      difficulty: 'Advanced',
      calories: '400',
    },
    {
      name: 'Yoga Flow',
      duration: '60 min',
      difficulty: 'Beginner',
      calories: '200',
    },
  ];

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent"
          >
            Workouts
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose your workout category
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-3 gap-4">
          {workoutCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard className="p-4 cursor-pointer hover:scale-105 transition-transform">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* Workout List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recommended Workouts
          </h2>
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {workout.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        {workout.duration}
                      </div>
                      <div>•</div>
                      <div>{workout.difficulty}</div>
                      <div>•</div>
                      <div>{workout.calories} cal</div>
                    </div>
                  </div>
                  <GradientButton
                    gradient="from-rose-500 to-pink-500"
                    className="px-3 py-1 text-sm"
                  >
                    Start
                  </GradientButton>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkoutPage;
