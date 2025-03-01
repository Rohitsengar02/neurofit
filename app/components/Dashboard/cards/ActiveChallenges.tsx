'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaMedal, FaFire, FaStopwatch } from 'react-icons/fa';
import { GiPodiumWinner, GiStairsGoal, GiMuscleUp } from 'react-icons/gi';

const ActiveChallenges = () => {
  // Demo challenges data
  const challenges = [
    {
      id: 1,
      title: '30-Day Fitness',
      participants: 1240,
      progress: 75,
      daysLeft: 7,
      reward: '🏆 Gold Badge',
      icon: GiMuscleUp,
      color: 'from-amber-400 to-orange-600',
      position: '3rd'
    },
    {
      id: 2,
      title: '10K Steps',
      participants: 856,
      progress: 90,
      daysLeft: 2,
      reward: '🎯 Achievement',
      icon: GiStairsGoal,
      color: 'from-blue-400 to-indigo-600',
      position: '1st'
    },
    {
      id: 3,
      title: 'Weight Loss',
      participants: 654,
      progress: 60,
      daysLeft: 14,
      reward: '🌟 Premium Badge',
      icon: GiPodiumWinner,
      color: 'from-green-400 to-emerald-600',
      position: '5th'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: '2px',
              height: '40px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              y: [0, 100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaTrophy className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <h3 className="text-lg font-semibold">Active Challenges</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          3 Active
        </motion.div>
      </div>

      {/* Challenges List */}
      <div className="relative z-10 space-y-4">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 group hover:bg-white/20 transition-colors"
          >
            {/* Challenge Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${challenge.color}`}>
                  <challenge.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">{challenge.title}</div>
                  <div className="flex items-center space-x-3 text-xs opacity-80">
                    <div className="flex items-center space-x-1">
                      <FaUsers className="w-3 h-3" />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaStopwatch className="w-3 h-3" />
                      <span>{challenge.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaMedal className={`w-4 h-4 ${
                  challenge.position === '1st' ? 'text-yellow-300' :
                  challenge.position === '2nd' ? 'text-gray-300' :
                  challenge.position === '3rd' ? 'text-amber-600' : 'text-white/40'
                }`} />
                <span className="text-sm font-medium">{challenge.position}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Progress</span>
                <span>{challenge.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${challenge.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>

            {/* Reward */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center"
            >
              <div className="text-xs">
                <span className="opacity-80">Reward: </span>
                <span className="font-medium">{challenge.reward}</span>
              </div>
              <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                View Details
              </button>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-6 grid grid-cols-2 gap-3"
      >
        <button className="py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors text-sm flex items-center justify-center space-x-2">
          <FaFire className="w-4 h-4" />
          <span>Join New Challenge</span>
        </button>
        <button className="py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors text-sm">
          Browse All
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ActiveChallenges;
