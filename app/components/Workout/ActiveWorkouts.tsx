'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStop, FaFire, FaClock, FaDumbbell, FaCalendarAlt, FaTrophy, FaTrash, FaCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        toast.error('Failed to load active workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  const handleDelete = async (workout: ActiveWorkout) => {
    if (!user || deletingId) return;

    try {
      setDeletingId(workout.id);
      const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
      const challengesDoc = await getDoc(challengesRef);

      if (challengesDoc.exists()) {
        const data = challengesDoc.data();
        let targetArray = 'challenges';
        
        if (workout.id.startsWith('cardio-challenge')) {
          targetArray = 'cardioPrograms';
        } else if (workout.id.startsWith('strength-challenge')) {
          targetArray = 'strengthPrograms';
        }

        const updatedPrograms = data[targetArray].filter((prog: any) => prog.id !== workout.id);

        await updateDoc(challengesRef, {
          [targetArray]: updatedPrograms
        });

        // Also delete the workout document itself if it exists
        const workoutRef = doc(db, `users/${user.uid}/workouts`, workout.id);
        await deleteDoc(workoutRef);

        setActiveWorkouts(prev => prev.filter(w => w.id !== workout.id));
        toast.success('Workout deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-amber-500 text-2xl animate-pulse" />
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="w-[300px] h-[400px] bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (activeWorkouts.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl text-center">
        <FaDumbbell className="text-4xl text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Workouts</h3>
        <p className="text-gray-400 mb-6">Start a new workout program to begin your fitness journey!</p>
       
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
            <AnimatePresence>
              {activeWorkouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
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
                    <div className="absolute top-4 right-4 flex gap-2">
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
                    <button
                      onClick={() => handleDelete(workout)}
                      disabled={deletingId === workout.id}
                      className="absolute top-4 left-4 p-2 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 shadow-lg"
                    >
                      {deletingId === workout.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <FaCheck className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <FaTrash className="w-4 h-4" />
                      )}
                    </button>
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
                          <FaCheck className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-sm">
                            {workout.completedDays.length} / {workout.duration} days
                          </span>
                        </motion.div>
                      )}
                      {workout.focus && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <FaDumbbell className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-sm">{workout.focus}</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Link
                        href={`/workout/${workout.id}`}
                        className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Continue Workout
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
