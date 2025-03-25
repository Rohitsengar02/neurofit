'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaMedal, FaFire, FaStopwatch, FaPlay, FaCalendarAlt, FaDumbbell } from 'react-icons/fa';
import { GiPodiumWinner, GiStairsGoal, GiMuscleUp } from 'react-icons/gi';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface ActiveWorkout {
  id: string;
  title: string;
  categoryName: string;
  imageUrl: string;
  level: string;
  startDate: string;
  totalDays: number;
  completedDays?: number;
  calories?: number;
  lastWorkout?: string;
  days?: number;
  caloriesPerDay?: number;
}

const ActiveChallenges = () => {
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveWorkouts = async () => {
      if (!user) return;

      try {
        const workoutsRef = collection(db, `users/${user.uid}/activeWorkouts`);
        // Create a query to get only 4 most recent workouts
        const workoutsQuery = query(
          workoutsRef,
          orderBy('startDate', 'desc'),
          limit(4)
        );
        const querySnapshot = await getDocs(workoutsQuery);
        
        const workouts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            days: data.totalDays || 30, 
            caloriesPerDay: Math.floor((data.calories || 300) / (data.totalDays || 30)), 
            completedDays: data.completedDays || 0,
            calories: data.calories || 300 
          };
        }) as ActiveWorkout[];

        setActiveWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching active workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-800 rounded-2xl p-6 text-white h-[300px]"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-white/20 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-800 rounded-2xl p-6 text-white"
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
          <h3 className="text-lg font-semibold">Active Workouts</h3>
        </div>
        <Link href="/pages/workout" className="text-sm text-white/80 hover:text-white">
          View All
        </Link>
      </div>

      {/* Active Workouts List */}
      <div className="relative z-10 space-y-4">
        {activeWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/80">No active workouts</p>
            <Link href="/pages/workout" className="inline-block mt-4 px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
              Start a Workout
            </Link>
          </div>
        ) : (
          activeWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {workout.imageUrl && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={workout.imageUrl}
                        alt={workout.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{workout.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-white/70">
                      <span>{workout.categoryName}</span>
                      <span>•</span>
                      <span>Level: {workout.level}</span>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/pages/workout`}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FaPlay className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ActiveChallenges;
