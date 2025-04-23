'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { Workout, ActiveWorkout } from '@/app/types/workout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaDumbbell, FaFire, FaChevronRight, FaCheck, FaLock, FaBed, FaMedal, FaTrophy, FaHeartbeat, FaChartLine, FaClock } from 'react-icons/fa';
import { MdDirectionsRun, MdFitnessCenter } from 'react-icons/md';
import { BsLightningChargeFill } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';

interface Exercise {
  name: string;
  description: string;
  gifUrl: string;
  categoryId: string;
  sets?: number;
  reps?: number;
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  exercises: Exercise[];
  completed: boolean;
}

export default function WorkoutDaysPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extract the ID from params, ensuring it's a string
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  useEffect(() => {
    // Don't try to fetch data until authentication is complete
    if (authLoading) return;
    
    const fetchWorkoutData = async () => {
      console.log('Fetching workout data with ID:', id);
      console.log('User authenticated:', !!user);
      
      if (!user) {
        setError('You must be logged in to view this workout');
        setLoading(false);
        return;
      }
      
      if (!id) {
        setError('Missing workout ID parameter');
        setLoading(false);
        return;
      }

      try {
        // Fetch active workout data
        const activeWorkoutRef = doc(db, `users/${user.uid}/activeWorkouts/${id}`);
        const activeWorkoutDoc = await getDoc(activeWorkoutRef);

        if (!activeWorkoutDoc.exists()) {
          setError('Workout not found');
          setLoading(false);
          return;
        }

        const activeWorkoutData = activeWorkoutDoc.data() as ActiveWorkout;
        setActiveWorkout({
          ...activeWorkoutData,
          startDate: activeWorkoutData.startDate instanceof Date 
            ? activeWorkoutData.startDate 
            : new Date(activeWorkoutData.startDate),
          endDate: activeWorkoutData.endDate instanceof Date 
            ? activeWorkoutData.endDate 
            : new Date(activeWorkoutData.endDate),
          completedDays: Array.isArray(activeWorkoutData.completedDays) 
            ? activeWorkoutData.completedDays.map(d => d instanceof Date ? d : new Date(d))
            : []
        });

        // Fetch workout details
        const categoryId = activeWorkoutData.categoryId;
        const workoutId = activeWorkoutData.originalWorkoutId || id;
        
        const workoutRef = doc(db, `categories/${categoryId}/workouts/${workoutId}`);
        const workoutDoc = await getDoc(workoutRef);

        if (!workoutDoc.exists()) {
          // Create fallback workout
          setWorkout({
            id: workoutId as string,
            title: activeWorkoutData.title,
            description: 'Workout details',
            imageUrl: activeWorkoutData.imageUrl,
            level: activeWorkoutData.level as 'beginner' | 'intermediate' | 'advanced',
            days: activeWorkoutData.totalDays,
            caloriesPerDay: activeWorkoutData.caloriesPerDay,
            exercises: [],
            categoryId: categoryId
          });
        } else {
          setWorkout({
            ...workoutDoc.data() as Workout,
            id: workoutId as string
          });
        }

        // Fetch workout days and exercises
        const daysRef = collection(db, `categories/${categoryId}/workouts/${workoutId}/days`);
        const daysSnapshot = await getDocs(daysRef);
        
        const completedDayNumbers = activeWorkoutData.completedDays
          ? activeWorkoutData.completedDays.map(d => {
              const date = d instanceof Date ? d : new Date(d);
              const startDate = activeWorkoutData.startDate instanceof Date 
                ? activeWorkoutData.startDate 
                : new Date(activeWorkoutData.startDate);
              const diffTime = Math.abs(date.getTime() - startDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays;
            })
          : [];

        if (daysSnapshot.empty) {
          // Create default days if none exist
          const defaultDays: WorkoutDay[] = Array.from({ length: activeWorkoutData.totalDays }, (_, i) => ({
            id: `day-${i+1}`,
            dayNumber: i + 1,
            exercises: [],
            completed: completedDayNumbers.includes(i + 1)
          }));
          setWorkoutDays(defaultDays);
        } else {
          const days: WorkoutDay[] = [];
          
          for (let i = 1; i <= activeWorkoutData.totalDays; i++) {
            const dayDoc = daysSnapshot.docs.find(doc => {
              const data = doc.data();
              return data.dayNumber === i;
            });
            
            if (dayDoc) {
              const dayData = dayDoc.data();
              days.push({
                id: dayDoc.id,
                dayNumber: dayData.dayNumber,
                exercises: dayData.exercises || [],
                completed: completedDayNumbers.includes(i)
              });
            } else {
              days.push({
                id: `day-${i}`,
                dayNumber: i,
                exercises: [],
                completed: completedDayNumbers.includes(i)
              });
            }
          }
          
          setWorkoutDays(days.sort((a, b) => a.dayNumber - b.dayNumber));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setError('Failed to load workout data');
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [user, id, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6" />
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!workout || !activeWorkout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Workout Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The workout you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = Math.round((activeWorkout.completedDays.length / activeWorkout.totalDays) * 100);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const progressBarVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${progress}%`,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  // Function to check if a day is a rest day (every 7th day)
  const checkIsRestDay = (dayNumber: number): boolean => {
    // Every 7th day is a rest day
    return dayNumber % 7 === 0;
  };
  
  // Function to check if a day is Sunday (for reference)
  const isSunday = (dayNumber: number): boolean => {
    const startDate = activeWorkout.startDate;
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (dayNumber - 1));
    return dayDate.getDay() === 0; // 0 is Sunday
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-64 sm:h-96 overflow-hidden rounded-b-3xl shadow-2xl"
      >
        {/* Full background image */}
        {workout.imageUrl ? (
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={workout.imageUrl}
              alt={workout.title}
              fill
              className="object-cover"
              priority
              quality={90}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600" />
        )}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />
        
        {/* Additional texture overlay */}
        <div className="absolute inset-0 bg-black/20 z-10 mix-blend-overlay" 
          style={{ backgroundImage: 'url("/images/texture-overlay.png")', backgroundSize: 'cover', opacity: 0.15 }} 
        />
        
        {/* Animated overlay elements with higher z-index */}
        <motion.div 
          className="absolute top-10 right-10 text-white/20 text-8xl z-20"
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        >
          <FaDumbbell />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10 left-10 text-white/20 text-6xl z-20"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 6,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <MdFitnessCenter />
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-20">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-4xl mx-auto w-full backdrop-blur-sm p-4 sm:p-6 rounded-xl bg-black/30 border border-white/10 shadow-lg"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <motion.span
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mr-3 text-yellow-400"
              >
                <FaTrophy className="inline-block" />
              </motion.span>
              {workout.title}
              <motion.div 
                className="ml-3 text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                {workout.level.toUpperCase()}
              </motion.div>
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 mb-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-black/20 px-2 py-1 rounded-full"
              >
                <FaDumbbell className="mr-1" />
                <span className="text-sm">{workout.level}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-black/20 px-2 py-1 rounded-full"
              >
                <FaCalendarAlt className="mr-1" />
                <span className="text-sm">{workout.days} days</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-black/20 px-2 py-1 rounded-full"
              >
                <FaFire className="mr-1" />
                <span className="text-sm">{workout.caloriesPerDay} cal/day</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-black/20 px-2 py-1 rounded-full"
              >
                <FaHeartbeat className="mr-1" />
                <span className="text-sm">Intensity: {workout.level === 'beginner' ? 'Low' : workout.level === 'intermediate' ? 'Medium' : 'High'}</span>
              </motion.div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-3 mb-2 overflow-hidden">
              <motion.div 
                variants={progressBarVariants}
                initial="initial"
                animate="animate"
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full" 
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-white/90 text-xs sm:text-sm">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex items-center"
              >
                <FaMedal className="mr-1" /> Progress: {progress}%
              </motion.span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="flex items-center mt-1 sm:mt-0"
              >
                <FaTrophy className="mr-1" /> {activeWorkout.completedDays.length} of {activeWorkout.totalDays} days completed
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Days list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-16">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="shadow-xl p-4 sm:p-6 mb-6  dark:bg-opacity-90 border border-gray-100 dark:border-gray-700"
        >
         
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 sm:space-y-4 mb-10"
        >
          <AnimatePresence>
            {workoutDays.map((day, index) => {
              const isLocked = index > 0 && !workoutDays[index - 1].completed;
              const today = new Date();
              const startDate = activeWorkout.startDate;
              const dayDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const isCurrent = day.dayNumber === dayDiff + 1;
              const isRestDay = checkIsRestDay(day.dayNumber);
              
              return (
                <motion.div
                  key={day.id}
                  variants={itemVariants}
                  whileHover={!isLocked ? { scale: 1.02, x: 5 } : {}}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden
                    ${day.completed ? 'border-l-4 border-green-500' : 
                      isCurrent ? 'border-l-4 border-blue-500' : 
                      isRestDay ? 'border-l-4 border-purple-500' : ''}
                    transition-all duration-300
                  `}
                >
                  <Link href={isLocked || isRestDay ? '#' : `/workout/day/${id}/${day.dayNumber}`}>
                    <div className={`p-4 flex items-center justify-between ${isLocked ? 'opacity-60' : ''}`}>
                      <div className="flex items-center">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mr-4 shadow-md
                          ${day.completed ? 'bg-gradient-to-br from-green-400 to-green-500 dark:from-green-500 dark:to-green-600' : 
                            isLocked ? 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800' : 
                            isRestDay ? 'bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600' :
                            'bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600'}
                        `}>
                          {day.completed ? (
                            <FaCheck className="text-white text-lg" />
                          ) : isLocked ? (
                            <FaLock className="text-white text-lg" />
                          ) : isRestDay ? (
                            <FaBed className="text-white text-lg" />
                          ) : (
                            <span className="font-bold text-white text-lg">{day.dayNumber}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            Day {day.dayNumber}
                            {isCurrent && (
                              <motion.span 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full"
                              >
                                TODAY
                              </motion.span>
                            )}
                            {isRestDay && (
                              <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                                REST DAY
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isRestDay ? (
                              <span className="flex items-center">
                                <FaBed className="mr-1 text-purple-500" />
                                Rest and recovery day
                              </span>
                            ) : day.exercises.length > 0 ? (
                              <span className="flex items-center">
                                <MdFitnessCenter className="mr-1 text-blue-500" />
                                {day.exercises.length} exercises
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <BsLightningChargeFill className="mr-1 text-yellow-500" />
                                Exercises not specified
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        {!isLocked && !isRestDay && (
                          <motion.div
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
                          >
                            <FaChevronRight className="text-gray-500 dark:text-gray-300" />
                          </motion.div>
                        )}
                        {isRestDay && (
                          <div className="text-purple-500 dark:text-purple-400 text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                            Recovery
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
