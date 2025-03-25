'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaFire, FaClock, FaCalendarAlt, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';

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

export default function WorkoutPlannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    const fetchCurrentWorkout = async () => {
      if (user) {
        try {
          const workoutRef = doc(db, `users/${user.uid}/customWorkout/currentDayWorkout`);
          const workoutSnap = await getDoc(workoutRef);
          
          if (workoutSnap.exists()) {
            setCurrentWorkout(workoutSnap.data() as CurrentWorkout);
          }
        } catch (err) {
          console.error('Error fetching current workout:', err);
        }
      }
      setLoading(false);
    };

    fetchCurrentWorkout();
  }, [user]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl text-blue-500">
          <FaDumbbell />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
          Workout Planner
        </h1>

        {/* Current Workout Summary */}
        <AnimatePresence>
          {currentWorkout && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <div className="flex items-center justify-between text-white mb-4">
                  <h2 className="text-2xl font-bold">Current Workout</h2>
                  <span className="text-sm opacity-90">{formatDate(currentWorkout.date)}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div className="text-center">
                    <FaClock className="mx-auto mb-2" size={24} />
                    <div className="text-lg font-bold">{formatTime(currentWorkout.totalTime)}</div>
                    <div className="text-sm opacity-75">Duration</div>
                  </div>
                  <div className="text-center">
                    <FaFire className="mx-auto mb-2" size={24} />
                    <div className="text-lg font-bold">{currentWorkout.totalCalories}</div>
                    <div className="text-sm opacity-75">Calories</div>
                  </div>
                  <div className="text-center">
                    <FaDumbbell className="mx-auto mb-2" size={24} />
                    <div className="text-lg font-bold">{currentWorkout.exercises.length}</div>
                    <div className="text-sm opacity-75">Exercises</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Exercise Summary</h3>
                <div className="space-y-3">
                  {currentWorkout.exercises.map((ex, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-sm text-gray-500">
                          {ex.completedSets} sets • {ex.totalReps} reps • {ex.totalWeight}kg
                        </div>
                      </div>
                      <FaTrophy className={`text-${ex.completedSets > 2 ? 'yellow' : 'gray'}-500`} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day, index) => (
            <motion.button
              key={day}
              onClick={() => router.push(`/workout-planner/${day}`)}
              className="group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <FaCalendarAlt className="text-blue-500 group-hover:text-purple-500 transition-colors" size={24} />
                    <FaArrowRight className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold capitalize mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {day}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Plan your {day}'s workout routine
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
