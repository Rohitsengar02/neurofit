'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { ActiveWorkout } from '@/app/types/workout';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaDumbbell, FaFire, FaChevronRight, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';

const ActiveWorkouts: React.FC = () => {
  const { user } = useAuth();
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

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

  // Manual scroll instead of animation to prevent cards from disappearing
  useEffect(() => {
    if (activeWorkouts.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        // If we're at the end, go back to the start
        if (scrollLeft >= maxScroll - 10) {
          scrollContainerRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Otherwise scroll a bit more
          scrollContainerRef.current.scrollTo({
            left: scrollLeft + 350,
            behavior: 'smooth'
          });
        }
      }
    }, 5000); // Scroll every 5 seconds
    
    return () => clearInterval(interval);
  }, [activeWorkouts.length]);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      // Delete the active workout from Firestore
      await deleteDoc(doc(db, `users/${user.uid}/activeWorkouts/${workoutId}`));
      
      // Update the local state to remove the deleted workout
      setActiveWorkouts(prev => prev.filter(w => w.workoutId !== workoutId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting workout:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {activeWorkouts.map((workout) => {
            // Calculate progress
            const progress = Math.round((workout.completedDays.length / workout.totalDays) * 100);
            
            return (
              <motion.div
                key={workout.workoutId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="flex-shrink-0 w-[350px] bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative">
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
                          {/* Removed the inset shadow */}
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
                  
                  {/* Delete button */}
                  {deleteConfirmId === workout.workoutId ? (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={() => handleDeleteWorkout(workout.workoutId)}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                        title="Confirm Delete"
                      >
                        <FaCheck className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded-full transition-colors"
                        title="Cancel"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(workout.workoutId)}
                      className="absolute top-2 right-2 bg-black/40 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-10"
                      title="Delete Workout"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Scroll indicators without shadows */}
        <div className="absolute left-0 top-0 bottom-4 w-8 pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-4 w-8 pointer-events-none z-10" />
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default ActiveWorkouts;
