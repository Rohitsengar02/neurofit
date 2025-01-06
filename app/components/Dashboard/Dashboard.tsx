'use client';

import React from 'react';
import WeeklyProgress from './WeeklyProgress';
import WorkoutPlan from './WorkoutPlan';
import { UserData } from '../../utils/userService';

interface DashboardProps {
  userData?: UserData;
}

export default function Dashboard({ userData }: DashboardProps) {
  const defaultValue = '--';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to NeuroFit</h1>
          <p className="text-gray-400">Let&apos;s achieve your fitness goals together</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Progress Section */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
            <WeeklyProgress />
          </section>

          {/* Workout Plan Section */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Today&apos;s Workout</h2>
            <WorkoutPlan />
          </section>

          {/* Goals Section */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
            <div className="space-y-4">
              {userData?.fitnessGoals?.map((goal, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <p>{goal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Current Weight</p>
                <p className="text-2xl font-bold">{userData?.weightGoals?.currentWeight || defaultValue} kg</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Target Weight</p>
                <p className="text-2xl font-bold">{userData?.weightGoals?.targetWeight || defaultValue} kg</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Workouts/Week</p>
                <p className="text-2xl font-bold">{userData?.workoutPreferences?.daysPerWeek || defaultValue}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Experience Level</p>
                <p className="text-2xl font-bold">{userData?.experienceLevel || defaultValue}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}