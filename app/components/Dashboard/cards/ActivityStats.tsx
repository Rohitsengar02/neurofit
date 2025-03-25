'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaChartLine, FaFire, FaHeartbeat, FaClock, FaDumbbell, FaArrowRight, FaBolt } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface CurrentWorkout {
  day: string;
  totalTime: number;
  totalCalories: number;
  exercises: {
    name: string;
    completedSets: number;
    totalWeight: number;
    totalReps: number;
  }[];
  date: string;
}

const ActivityStats = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentWorkout = async () => {
      if (user) {
        try {
          const workoutRef = doc(db, `users/${user.uid}/customWorkout/currentDayWorkout`);
          const workoutSnap = await getDoc(workoutRef);
          
          if (workoutSnap.exists()) {
            const data = workoutSnap.data();
            setCurrentWorkout({
              ...data,
              totalTime: data.totalTime || 0,
              totalCalories: data.totalCalories || 0,
              exercises: data.exercises || []
            } as CurrentWorkout);
          }
        } catch (err) {
          console.error('Error fetching current workout:', err);
        }
      }
      setLoading(false);
    };

    fetchCurrentWorkout();
  }, [user]);

  const formatTime = (ms: number): string => {
    if (!ms || isNaN(ms)) return '0';
    const minutes = Math.floor(ms / 60000);
    return minutes.toString();
  };

  const calculateTotalWeight = (): string => {
    if (!currentWorkout?.exercises) return '0';
    const total = currentWorkout.exercises.reduce((sum, ex) => sum + (ex.totalWeight || 0), 0);
    return total.toString();
  };

  const getTotalReps = (): string => {
    if (!currentWorkout?.exercises) return '0';
    const total = currentWorkout.exercises.reduce((sum, ex) => sum + (ex.totalReps || 0), 0);
    return total.toString();
  };

  const getCalories = (): string => {
    if (!currentWorkout?.totalCalories || isNaN(currentWorkout.totalCalories)) return '0';
    return Math.round(currentWorkout.totalCalories).toString();
  };

  const stats = currentWorkout ? [
    {
      id: 1,
      title: 'Workout Time',
      value: formatTime(currentWorkout.totalTime),
      unit: 'min',
      icon: FaClock,
      color: 'from-blue-500 via-blue-400 to-cyan-300',
     bgStart: 'from-blue-700',
bgEnd: 'to-teal-400'
    },
    {
      id: 2,
      title: 'Calories Burned',
      value: getCalories(),
      unit: 'kcal',
      icon: FaFire,
      color: 'from-orange-500 via-red-400 to-pink-300',
      bgStart: 'from-purple-700',
      bgEnd: 'to-pink-500'
      
    },
    {
      id: 3,
      title: 'Total Weight',
      value: calculateTotalWeight(),
      unit: 'kg',
      icon: FaDumbbell,
      color: 'from-purple-1 via-violet-1 to-fuchsia-300',
      bgStart: 'from-red-800',
      bgEnd: 'to-red-500'
      
    },
    {
      id: 4,
      title: 'Total Reps',
      value: getTotalReps(),
      unit: 'reps',
      icon: FaBolt,
      color: 'from-green-500 via-emerald-400 to-teal-300',
      bgStart: 'from-green-600',
      bgEnd: 'to-teal-500'
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-200 to-gray-400 rounded-3xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 w-60 flex-shrink-0 bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-2xl overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/5 text-white rounded-full blur-2xl"
              style={{
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-white bg-gradient-to-r from-blue-400 to-purple-400">
              Today's Workout
            </h2>
            {currentWorkout?.day && (
              <p className="text-gray-400 text-white  mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/workout-planner')}
            className="flex items-center px-3 py-3 rounded-xl bg-gradient-to-r from-green-800 to-green-500 text-white text-[16px] hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
             <FaArrowRight />
          </motion.button>
        </div>

        {currentWorkout ? (
          <>
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                  className={`relative flex-shrink-0 w-72 h-48 p-6 rounded-2xl snap-center
                    bg-gradient-to-br ${stat.bgStart} ${stat.bgEnd}
                    border border-white/10 backdrop-blur-xl
                    hover:border-white/20 transition-all duration-300
                    group`}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg mb-4
                        group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon size={24} className="text-white" />
                      </div>
                      <p className="text-white text-sm">{stat.title}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
                      <span className="text-sm text-white">{stat.unit}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Exercise List */}
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Exercise Summary</h3>
              <div className="space-y-4">
                {currentWorkout.exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-300"
                  >
                    <div>
                      <h4 className="text-white font-medium">{exercise.name}</h4>
                      <p className="text-white text-sm">
                        {exercise.completedSets} sets • {exercise.totalReps} reps
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{exercise.totalWeight} kg</p>
                      <p className="text-white text-sm">total weight</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaDumbbell className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 mb-6">No workout data available</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/workout-planner')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
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
