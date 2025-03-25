'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaFire, FaHeartbeat, FaClock, FaDumbbell, FaArrowRight, FaBolt, FaRunning, FaTrophy, FaCheck } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Set {
  weight: number;
  reps: number;
  isCompleted: boolean;
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface CurrentWorkout {
  day: string;
  totalTime: number;
  totalCalories: number;
  exercises: Exercise[];
  date: string;
}

const ActivityStats = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentWorkout = async () => {
      if (user) {
        try {
          const workoutRef = doc(db, `users/${user.uid}/customWorkout/currentDayWorkout`);
          const workoutSnap = await getDoc(workoutRef);
          
          if (workoutSnap.exists()) {
            const data = workoutSnap.data();
            console.log('Raw workout data:', data);
            
            // Transform the data to match our interface
            const transformedData: CurrentWorkout = {
              day: data.day || '',
              totalTime: data.totalTime || 0,
              totalCalories: Number(data.totalCalories) || 0, 
              exercises: data.exercises?.map((ex: any) => ({
                name: ex.name || '',
                sets: ex.sets?.map((set: any) => ({
                  weight: Number(set.weight) || 0,
                  reps: Number(set.reps) || 0,
                  isCompleted: Boolean(set.isCompleted)
                })) || []
              })) || [],
              date: data.date || new Date().toISOString()
            };
            
            console.log('Transformed workout data:', transformedData);
            setCurrentWorkout(transformedData);
          } else {
            console.log('No workout data found');
          }
        } catch (err) {
          console.error('Error fetching current workout:', err);
        }
      }
      setLoading(false);
    };

    fetchCurrentWorkout();
  }, [user]);

  const formatTime = (totalTime: number): string => {
    if (!totalTime || isNaN(totalTime)) {
      console.log('Invalid time value:', totalTime);
      return '0';
    }
    // Convert seconds to minutes
    const minutes = Math.floor(totalTime / 60);
    console.log('Formatted time:', minutes, 'minutes from', totalTime, 'seconds');
    return minutes.toString();
  };

  const calculateTotalWeight = (): string => {
    if (!currentWorkout?.exercises) {
      console.log('No exercises found for weight calculation');
      return '0';
    }
    const total = currentWorkout.exercises.reduce((sum, exercise) => {
      const exerciseTotal = exercise.sets.reduce((setSum, set) => setSum + (set.weight || 0), 0);
      return sum + exerciseTotal;
    }, 0);
    console.log('Calculated total weight:', total);
    return total.toString();
  };

  const getCalories = (): string => {
    const calories = currentWorkout?.totalCalories;
    console.log('Getting calories:', calories);
    if (!calories || isNaN(calories)) {
      return '0';
    }
    return Math.round(calories).toString();
  };

  const getExerciseStats = (exercise: Exercise) => {
    const totalWeight = exercise.sets.reduce((sum, set) => sum + (set.weight || 0), 0);
    const totalSets = exercise.sets.length;
    const completedSets = exercise.sets.filter(set => set.isCompleted).length;
    return { totalWeight, totalSets, completedSets };
  };

  const stats = currentWorkout ? [
    {
      id: 1,
      title: 'Workout Time',
      value: formatTime(currentWorkout.totalTime),
      unit: 'min',
      icon: FaClock,
      gradient: 'from-blue-600 to-cyan-400',
      iconGradient: 'from-blue-400 to-cyan-300'
    },
    {
      id: 2,
      title: 'Calories Burned',
      value: getCalories(),
      unit: 'kcal',
      icon: FaFire,
      gradient: 'from-orange-600 to-red-400',
      iconGradient: 'from-orange-400 to-red-300'
    },
    {
      id: 3,
      title: 'Total Weight',
      value: calculateTotalWeight(),
      unit: 'kg',
      icon: FaDumbbell,
      gradient: 'from-purple-600 to-pink-400',
      iconGradient: 'from-purple-400 to-pink-300'
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/30 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-700/30 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-700/30 rounded-2xl mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-white/5 to-transparent rounded-full"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
              animate={{
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaTrophy className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Workout Activity
              </h2>
              <p className="text-gray-400 text-sm">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/pages/workout')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <FaArrowRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {currentWorkout ? (
          <>
            {/* Stats Cards - Now Horizontally Scrollable */}
            <div className="overflow-x-auto pb-4 mb-6 -mx-6 px-6">
              <div className="flex space-x-4 min-w-max">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                    className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.gradient}
                      backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 group w-[200px]`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.iconGradient} 
                          shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon size={20} className="text-white" />
                        </div>
                        <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">{stat.value}</span>
                          <span className="text-sm text-white/80">{stat.unit}</span>
                        </div>
                      </div>
                      <motion.div
                        className="w-16 h-16 opacity-10"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <stat.icon size={64} className="text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Exercise Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Exercise Summary</h3>
                <span className="text-sm text-white/60">
                  {currentWorkout?.exercises?.length || 0} exercises
                </span>
              </div>
              <div className="space-y-3">
                {currentWorkout?.exercises?.map((exercise: Exercise, index: number) => {
                  const stats = getExerciseStats(exercise);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <FaRunning className="w-4 h-4 text-white/80" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{exercise.name}</h4>
                          <p className="text-white/60 text-sm">
                            {stats.totalSets} sets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{stats.totalWeight} kg</p>
                        <p className="text-white/60 text-sm">total weight</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
              <FaDumbbell className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-white/60 mb-6">No workout data available</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/pages/workout')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl 
                hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start a Workout
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ActivityStats;
