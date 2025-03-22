'use client';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaPlay, FaStop, FaTrash, FaChartLine, FaCalendarAlt, FaFire } from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';

interface ActiveWorkout {
  id: string;
  title: string;
  categoryName: string;
  imageUrl: string;
  level: string;
  startDate: string;
  totalDays: number;
  completedDays?: number;
  progress?: number;
  calories?: number;
  lastWorkout?: string;
}

const ActiveWorkouts = () => {
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveWorkouts = async () => {
      if (!user) return;

      try {
        const workoutsRef = collection(db, `users/${user.uid}/activeWorkouts`); 
        const querySnapshot = await getDocs(workoutsRef);
        
        const workouts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          progress: Math.floor(Math.random() * 100), // TODO: Replace with actual progress calculation
          completedDays: Math.floor(Math.random() * 30), // TODO: Replace with actual completed days
          calories: Math.floor(Math.random() * 5000), // TODO: Replace with actual calories burned
          lastWorkout: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() // TODO: Replace with actual last workout date
        })) as ActiveWorkout[];

        setActiveWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching active workouts:', error);
        toast.error('Failed to load active workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    if (!user || deletingId) return;

    try {
      setDeletingId(workoutId);
      const workoutRef = doc(db, `users/${user.uid}/activeWorkouts`, workoutId);
      await deleteDoc(workoutRef);
      
      setActiveWorkouts(prev => prev.filter(w => w.id !== workoutId));
      toast.success('Workout removed successfully');
    } catch (error) {
      console.error('Error removing workout:', error);
      toast.error('Failed to remove workout');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="flex space-x-4 overflow-x-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-80">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-[420px] animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeWorkouts.length === 0) {
    return (
      <div className="w-full py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <FaChartLine className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Active Workouts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a new workout program to begin tracking your fitness journey
            </p>
            <Link
              href="/workouts"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <FaPlay className="mr-2" />
              Browse Workouts
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            className="text-2xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Active Workouts
          </motion.h2>
          <motion.span
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {activeWorkouts.length} active
          </motion.span>
        </div>

        <div className="relative">
          <div className="absolute left-0 w-20 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute  right-0 w-20 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          
          <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <AnimatePresence>
              {activeWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  className="flex-none w-80"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48">
                      <Image
                        src={workout.imageUrl}
                        alt={workout.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-purple-500/90 text-white text-sm rounded-full shadow-lg">
                          {workout.level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        disabled={deletingId === workout.id}
                        className="absolute top-4 left-4 p-2 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-xl mb-1 line-clamp-1">
                          {workout.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {workout.categoryName}
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(workout.lastWorkout || ''), 'MMM d')}
                          </span>
                        </div>

                      </div>

                   

                      <Link
                        href={`/workout/tracker/${workout.id}`}
                        className="block w-full text-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
};

export default ActiveWorkouts;
