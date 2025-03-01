'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaCalendarAlt, FaCheck, FaClock, FaFire, FaRunning } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiMeditation } from 'react-icons/gi';

const WorkoutPlan = () => {
  // Demo workout plan data
  const workouts = [
    {
      id: 1,
      name: 'Upper Body Strength',
      time: '7:00 AM',
      duration: '45 min',
      intensity: 'High',
      calories: '320',
      exercises: [
        { name: 'Bench Press', sets: '4x10' },
        { name: 'Pull-ups', sets: '3x8' },
        { name: 'Shoulder Press', sets: '3x12' }
      ],
      icon: GiMuscleUp,
      color: 'from-red-400 to-rose-600',
      completed: true
    },
    {
      id: 2,
      name: 'HIIT Cardio',
      time: '2:30 PM',
      duration: '30 min',
      intensity: 'High',
      calories: '280',
      exercises: [
        { name: 'Burpees', sets: '4x30s' },
        { name: 'Mountain Climbers', sets: '4x45s' },
        { name: 'Jump Rope', sets: '4x60s' }
      ],
      icon: FaRunning,
      color: 'from-blue-400 to-indigo-600',
      completed: false
    },
    {
      id: 3,
      name: 'Lower Body Power',
      time: '5:00 PM',
      duration: '50 min',
      intensity: 'Medium',
      calories: '400',
      exercises: [
        { name: 'Squats', sets: '4x12' },
        { name: 'Deadlifts', sets: '3x10' },
        { name: 'Lunges', sets: '3x15' }
      ],
      icon: GiWeightLiftingUp,
      color: 'from-purple-400 to-violet-600',
      completed: false
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 border border-white/10 rounded-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
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
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaDumbbell className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Today's Workout Plan</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          <FaCalendarAlt className="w-4 h-4" />
          <span>Today</span>
        </motion.div>
      </div>

      {/* Workouts List */}
      <div className="relative z-10 space-y-4">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 group hover:bg-white/20 transition-colors ${
              workout.completed ? 'border-l-4 border-green-400' : ''
            }`}
          >
            {/* Workout Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${workout.color}`}>
                  <workout.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{workout.name}</span>
                    {workout.completed && (
                      <FaCheck className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-sm opacity-80">
                    <div className="flex items-center space-x-1">
                      <FaClock className="w-3 h-3" />
                      <span>{workout.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaFire className="w-3 h-3" />
                      <span>{workout.calories} cal</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm opacity-80">{workout.duration}</div>
            </div>

            {/* Exercises List */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {workout.exercises.map((exercise, i) => (
                <motion.div
                  key={exercise.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                  className="p-2 bg-white/5 rounded-lg text-center"
                >
                  <div className="text-xs opacity-80">{exercise.name}</div>
                  <div className="text-sm font-medium">{exercise.sets}</div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="mt-3 pt-3 border-t border-white/10 flex justify-between"
            >
              <button className="text-xs opacity-80 hover:opacity-100 transition-opacity">
                {workout.completed ? 'View Summary' : 'Start Workout'}
              </button>
              <button className="text-xs opacity-80 hover:opacity-100 transition-opacity">
                Modify Plan
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
        <button className="py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors text-sm">
          Add Workout
        </button>
        <button className="py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors text-sm">
          View Weekly Plan
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutPlan;
