"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GradientCard, PageTransition } from '../../components/shared/UIComponents';
import { FiTrendingUp, FiActivity, FiAward } from 'react-icons/fi';

const ProgressPage = () => {
  const achievements = [
    { title: 'Workout Streak', value: '7 days', icon: FiTrendingUp, color: 'from-purple-500 to-indigo-500' },
    { title: 'Total Workouts', value: '24', icon: FiActivity, color: 'from-emerald-500 to-green-500' },
    { title: 'Achievements', value: '12', icon: FiAward, color: 'from-amber-500 to-orange-500' },
  ];

  const weeklyProgress = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 60 },
  ];

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent"
          >
            Your Progress
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your fitness journey
          </p>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${achievement.color}`}>
                    <achievement.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {achievement.value}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {achievement.title}
                  </span>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* Weekly Progress Chart */}
        <GradientCard className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Weekly Progress
          </h2>
          <div className="flex items-end justify-between h-48">
            {weeklyProgress.map((day, index) => (
              <motion.div
                key={day.day}
                className="flex flex-col items-center space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="w-8 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg"
                  style={{ height: `${day.value}%` }}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day.day}
                </span>
              </motion.div>
            ))}
          </div>
        </GradientCard>

        {/* Recent Achievements */}
        <GradientCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Achievements
          </h2>
          <div className="space-y-4">
            {[
              { title: '7 Day Streak', date: 'Today', icon: FiTrendingUp },
              { title: '100 Workouts', date: '2 days ago', icon: FiActivity },
              { title: 'First HIIT', date: '1 week ago', icon: FiAward },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
              >
                <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                  <achievement.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {achievement.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GradientCard>
      </div>
    </PageTransition>
  );
};

export default ProgressPage;
