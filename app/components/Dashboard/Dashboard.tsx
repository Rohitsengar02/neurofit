'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WeeklyProgress from './WeeklyProgress';
import WorkoutPlan from './WorkoutPlan';
import { UserData } from '../../utils/userService';
import { FaUser, FaDumbbell, FaWeight, FaCalendarAlt, FaClock, FaHeartbeat, FaRunning } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { MdHealthAndSafety } from 'react-icons/md';
import UserDataCard from './UserDataCard';

interface DashboardProps {
  userData?: UserData;
}

export default function Dashboard({ userData }: DashboardProps) {
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }

  const dataCards = [
    {
      title: 'Personal Info',
      icon: FaUser,
      data: userData.personalInfo,
      color: 'bg-blue-600'
    },
    {
      title: 'Fitness Goals',
      icon: GiMuscleUp,
      data: { goals: userData.fitnessGoals },
      color: 'bg-purple-600'
    },
    {
      title: 'Weight Goals',
      icon: FaWeight,
      data: userData.weightGoals,
      color: 'bg-green-600'
    },
    {
      title: 'Experience',
      icon: GiWeightLiftingUp,
      data: {
        level: userData.experienceLevel,
        weightliftingExperience: userData.weightliftingExperience
      },
      color: 'bg-yellow-600'
    },
    {
      title: 'Workout Preferences',
      icon: FaDumbbell,
      data: userData.workoutPreferences,
      color: 'bg-red-600'
    },
    {
      title: 'Schedule',
      icon: FaCalendarAlt,
      data: {
        weeklySchedule: userData.weeklySchedule,
        ...userData.dailyRoutine
      },
      color: 'bg-indigo-600'
    },
    {
      title: 'Exercise Preferences',
      icon: FaRunning,
      data: userData.exercisePreferences,
      color: 'bg-pink-600'
    },
    {
      title: 'Health',
      icon: MdHealthAndSafety,
      data: userData.healthConditions,
      color: 'bg-teal-600'
    },
    {
      title: 'Measurements',
      icon: FaWeight,
      data: userData.measurements,
      color: 'bg-orange-600'
    },
    {
      title: 'Stress Management',
      icon: FaHeartbeat,
      data: userData.stressLevel,
      color: 'bg-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to NeuroFit</h1>
          <p className="text-gray-400">Let&apos;s achieve your fitness goals together</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progress and Workout Plan */}
          <section className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
              <WeeklyProgress />
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Today&apos;s Workout</h2>
              <WorkoutPlan />
            </div>
          </section>

          {/* User Data Cards */}
          {dataCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <UserDataCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}