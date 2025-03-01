'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaStop, FaFire, FaClock, FaDumbbell, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { format } from 'date-fns';

interface ActiveWorkout {
  id: string;
  type: string;
  title: string;
  startDate: Date;
  lastUpdated: Date;
  image: string;
  isActive?: boolean;
  intensity?: string;
  duration: number;
  calories?: string;
  focus?: string;
  completedDays?: string[];
}

export default function ActiveWorkouts() {
  const { user } = useAuth();
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveWorkouts = async () => {
      if (!user) return;

      try {
        const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
        const challengesDoc = await getDoc(challengesRef);

        if (challengesDoc.exists()) {
          const data = challengesDoc.data();
          
          // Combine all active programs
          const allWorkouts = [
            ...(data.challenges || []),
            ...(data.cardioPrograms || []),
            ...(data.strengthPrograms || [])
          ].filter(workout => workout.isActive).map(workout => ({
            ...workout,
            startDate: workout.startDate.toDate(),
            lastUpdated: workout.lastUpdated.toDate()
          }));
          
          setActiveWorkouts(allWorkouts);
        }
      } catch (error) {
        console.error('Error fetching active workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  const handleDeactivate = async (workout: ActiveWorkout) => {
    if (!user) return;

    try {
      const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
      const challengesDoc = await getDoc(challengesRef);

      if (challengesDoc.exists()) {
        const data = challengesDoc.data();
        let targetArray = 'challenges';
        
        // Determine which array to update
        if (workout.id.startsWith('cardio-challenge')) {
          targetArray = 'cardioPrograms';
        } else if (workout.id.startsWith('strength-challenge')) {
          targetArray = 'strengthPrograms';
        }

        // Filter out the deactivated workout
        const updatedPrograms = data[targetArray].filter((prog: any) => prog.id !== workout.id);

        // Update Firebase
        await updateDoc(challengesRef, {
          [targetArray]: updatedPrograms
        });

        // Update local state
        setActiveWorkouts(prev => prev.filter(w => w.id !== workout.id));
      }
    } catch (error) {
      console.error('Error deactivating workout:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading active workouts...</div>;
  }

  if (activeWorkouts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No active workouts or challenges.
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-amber-500 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Active Programs</h2>
        </div>
        <div className="text-sm text-gray-400">
          {activeWorkouts.length} active
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
        
        <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
            {activeWorkouts.map((workout) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl overflow-hidden group w-[300px] flex-shrink-0 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-40">
                  <Image
                    src={workout.image || '/default-workout.jpg'}
                    alt={workout.title}
                    fill
                    className="object-cover brightness-90 group-hover:brightness-100 transition-all duration-300 transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white shadow-lg">
                        {workout.duration} Days Challenge
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <motion.h3 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors"
                    >
                      {workout.title}
                    </motion.h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-gray-300"
                    >
                      <FaCalendarAlt className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-sm">
                        {format(workout.startDate, 'MMM d')}
                      </span>
                    </motion.div>
                    {workout.intensity && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <FaFire className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-sm">{workout.intensity}</span>
                      </motion.div>
                    )}
                    {workout.completedDays && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <FaTrophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-sm">
                          {workout.completedDays.length}/{workout.duration}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {workout.completedDays && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Days Complete</span>
                        <span className="text-xs font-medium text-blue-400">
                          {workout.completedDays.length} / {workout.duration} days
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(workout.completedDays.length / workout.duration) * 100}%` 
                          }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Link
                      href={`/workout/challenge/${workout.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-2 group"
                    >
                      View Progress
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        className="inline-block"
                      >
                        →
                      </motion.span>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeactivate(workout)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <FaStop className="text-sm" />
                      <span className="text-sm">Stop</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
