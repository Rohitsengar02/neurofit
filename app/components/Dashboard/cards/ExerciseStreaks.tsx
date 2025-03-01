'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaMedal, FaCalendarCheck, FaBolt } from 'react-icons/fa';

const ExerciseStreaks = () => {
  // Demo streak data
  const streakData = {
    currentStreak: 12,
    longestStreak: 21,
    totalWorkouts: 145,
    weeklyGoal: 5,
    weeklyProgress: 4,
    achievements: [
      { name: '10 Day Streak', icon: FaFire, achieved: true },
      { name: '50 Workouts', icon: FaMedal, achieved: true },
      { name: '100 Workouts', icon: FaTrophy, achieved: true },
      { name: '20 Day Streak', icon: FaFire, achieved: false }
    ],
    recentWorkouts: [
      { date: 'Today', type: 'Strength', completed: true },
      { date: 'Yesterday', type: 'Cardio', completed: true },
      { date: '2 days ago', type: 'Yoga', completed: true },
      { date: '3 days ago', type: 'HIIT', completed: true },
      { date: '4 days ago', type: 'Rest', completed: true }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: '3px',
              height: '3px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
              filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          >
            <FaFire className="text-white/20" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaFire className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Exercise Streaks</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          {streakData.weeklyProgress}/{streakData.weeklyGoal} This Week
        </motion.div>
      </div>

      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-center mb-8"
      >
        <div className="text-center">
          <motion.div
            className="text-6xl font-bold mb-1"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {streakData.currentStreak}
          </motion.div>
          <div className="text-sm opacity-80">Day Streak 🔥</div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Longest Streak', value: `${streakData.longestStreak} Days`, icon: FaTrophy },
          { label: 'Total Workouts', value: streakData.totalWorkouts, icon: FaMedal }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Workouts */}
      <div className="relative z-10 mb-6">
        <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {streakData.recentWorkouts.map((workout, index) => (
            <motion.div
              key={workout.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <FaCalendarCheck className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-sm font-medium">{workout.date}</div>
                  <div className="text-xs opacity-80">{workout.type}</div>
                </div>
              </div>
              {workout.completed && (
                <FaBolt className="w-4 h-4 text-yellow-300" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Achievements</h4>
        <div className="grid grid-cols-4 gap-2">
          {streakData.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`p-3 rounded-xl text-center ${
                achievement.achieved ? 'bg-white/20' : 'bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <achievement.icon className={`w-5 h-5 mx-auto mb-1 ${
                achievement.achieved ? 'text-yellow-300' : 'opacity-50'
              }`} />
              <div className="text-xs mt-1 opacity-80">
                {achievement.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Motivation Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm opacity-80">
          You're on fire! Keep the streak alive and crush your fitness goals! 🔥
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExerciseStreaks;
