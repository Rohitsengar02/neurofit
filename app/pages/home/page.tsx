"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiTrendingUp } from 'react-icons/fi';
import { GradientCard, PageTransition } from '../../components/shared/UIComponents';

const HomePage = () => {
  const stats = [
    { icon: FiActivity, value: '2,345', label: 'Steps', color: 'from-blue-500 to-cyan-500' },
    { icon: FiHeart, value: '75', label: 'BPM', color: 'from-rose-500 to-pink-500' },
    { icon: FiTrendingUp, value: '85%', label: 'Progress', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"
          >
            Welcome Back!
          </motion.h1>
          <p className="text-base text-gray-600 dark:text-gray-400">Let&apos;s achieve your fitness goals together!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </span>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* Activity Timeline */}
        <GradientCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Today&apos;s Activity
          </h2>
          <div className="space-y-4">
            {[
              { time: '9:00 AM', activity: 'Morning Workout', duration: '45 min' },
              { time: '2:00 PM', activity: 'Yoga Session', duration: '30 min' },
              { time: '6:00 PM', activity: 'Evening Run', duration: '20 min' },
            ].map((item, index) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.activity}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                  {item.duration}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400">You&apos;re on your way to a healthier you.</p>
        </GradientCard>
      </div>
    </PageTransition>
  );
};

export default HomePage;
