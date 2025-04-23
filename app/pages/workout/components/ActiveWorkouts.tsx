'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { ActiveWorkout } from '@/app/types/workout';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaDumbbell, FaFire, FaChevronRight, FaCheck } from 'react-icons/fa';

const ActiveWorkouts: React.FC = () => {
  const { user } = useAuth();
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveWorkouts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const activeWorkoutsRef = collection(db, `users/${user.uid}/activeWorkouts`);
        const querySnapshot = await getDocs(activeWorkoutsRef);
        
        if (querySnapshot.empty) {
          setActiveWorkouts([]);
          setLoading(false);
          return;
        }

        const workoutsData = querySnapshot.docs.map(doc => {
          const data = doc.data() as ActiveWorkout;
          return {
            ...data,
            workoutId: doc.id,
            startDate: data.startDate instanceof Date ? data.startDate : new Date(data.startDate),
            endDate: data.endDate instanceof Date ? data.endDate : new Date(data.endDate),
            completedDays: Array.isArray(data.completedDays) 
              ? data.completedDays.map(d => d instanceof Date ? d : new Date(d))
              : []
          };
        });

        setActiveWorkouts(workoutsData);
      } catch (err) {
        console.error('Error fetching active workouts:', err);
        setError('Failed to load active workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Active Workouts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Active Workouts
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      </section>
    );
  }

  if (activeWorkouts.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Active Workouts
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <FaDumbbell className="text-3xl text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Active Workouts
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start a new workout challenge to begin tracking your progress.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Active Workouts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeWorkouts.map((workout) => {
          // Calculate progress
          const progress = Math.round((workout.completedDays.length / workout.totalDays) * 100);
          
          return (
            <motion.div
              key={workout.workoutId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <Link href={`/workout/days/${workout.workoutId}`}>
                <div className="flex h-full">
                  <div className="relative w-1/3">
                    <div className="absolute inset-0">
                      <Image
                        src={workout.imageUrl || '/images/default-workout.jpg'}
                        alt={workout.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    </div>
                  </div>
                  <div className="p-4 w-2/3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {workout.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        workout.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 space-x-3">
                      <div className="flex items-center">
                        <FaDumbbell className="mr-1" />
                        <span>{workout.level}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        <span>{workout.completedDays.length} / {workout.totalDays} days</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {progress}% Complete
                      </span>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                        <span className="mr-1">Continue</span>
                        <FaChevronRight className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ActiveWorkouts;
