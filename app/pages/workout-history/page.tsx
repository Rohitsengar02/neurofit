'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks, isToday } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaDumbbell, FaFire, FaClock, FaTrophy } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

interface WorkoutStat {
  id: string;
  date: any; // Using any to handle both Date and Firestore Timestamp
  totalTime: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  setsCompleted: number;
  totalReps: number;
  dayNumber: number;
  workoutId: string;
  intensityLevel: number;
  exerciseDetails: {
    name: string;
    sets: number;
    reps: number;
    completed: boolean;
  }[];
  userMood: string;
  notes: string;
}

const WorkoutHistoryPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutStats, setWorkoutStats] = useState<WorkoutStat[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate array of dates for the current week
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Find workout for the selected date
    const workout = workoutStats.find(stat => {
      const statDate = stat.date instanceof Date ? stat.date : stat.date.toDate();
      return isSameDay(statDate, date);
    });
    
    setSelectedWorkout(workout || null);
  };

  // Fetch workout stats from Firebase
  useEffect(() => {
    const fetchWorkoutStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const statsRef = collection(db, `users/${user.uid}/workoutStats`);
        const statsSnapshot = await getDocs(query(statsRef, orderBy('date', 'desc')));
        
        const stats = statsSnapshot.docs.map(doc => {
          const data = doc.data() as WorkoutStat;
          data.id = doc.id;
          
          // Convert Firestore timestamp to Date
          if (data.date && typeof data.date.toDate === 'function') {
            data.date = data.date.toDate();
          }
          
          return data;
        });
        
        setWorkoutStats(stats);
        
        // Set the selected workout if there's a workout for the selected date
        const workout = stats.find(stat => {
          const statDate = stat.date instanceof Date ? stat.date : stat.date;
          return isSameDay(statDate, selectedDate);
        });
        
        setSelectedWorkout(workout || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout stats:', error);
        setError('Failed to load workout history');
        setLoading(false);
      }
    };

    fetchWorkoutStats();
  }, [user, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Workout History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and view your workout history
          </p>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="font-medium text-gray-700 dark:text-gray-300">
            {format(currentWeekStart, 'MMMM yyyy')}
          </div>
          
          <button 
            onClick={goToNextWeek}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Horizontal Calendar */}
        <div className="overflow-x-auto pb-4 mb-8">
          <div className="flex space-x-2 min-w-max">
            {weekDays.map((date) => {
              // Check if there's a workout for this date
              const hasWorkout = workoutStats.some(stat => {
                const statDate = stat.date instanceof Date ? stat.date : stat.date;
                return isSameDay(statDate, date);
              });
              
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              
              return (
                <motion.div
                  key={date.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    relative flex flex-col items-center p-3 rounded-xl cursor-pointer
                    ${isSelected 
                      ? 'bg-blue-500 text-white' 
                      : hasWorkout 
                        ? 'bg-green-100 dark:bg-green-900/30 text-gray-800 dark:text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'}
                    ${isCurrentDay && !isSelected ? 'border-2 border-blue-500' : ''}
                  `}
                >
                  <div className="text-xs font-medium mb-1">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-xl font-bold">
                    {format(date, 'd')}
                  </div>
                  {hasWorkout && !isSelected && (
                    <div className="absolute -bottom-1 w-4 h-1 rounded-full bg-green-500"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Workout Stats for Selected Date */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="w-10 h-10 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-red-500"
            >
              {error}
            </motion.div>
          ) : selectedWorkout ? (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              {/* Workout Header */}
              <div className="bg-blue-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <div className="flex items-center text-blue-100">
                      <FaDumbbell className="mr-2" />
                      <span>Day {selectedWorkout.dayNumber}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/workout/days/${selectedWorkout.workoutId}`}
                    className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                  >
                    View Workout
                  </Link>
                </div>
              </div>
              
              {/* Workout Stats */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex items-center text-blue-500 mb-2">
                      <FaClock className="mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {formatTime(selectedWorkout.totalTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex items-center text-orange-500 mb-2">
                      <FaFire className="mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {selectedWorkout.caloriesBurned}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex items-center text-purple-500 mb-2">
                      <FaDumbbell className="mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Exercises</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {selectedWorkout.exercisesCompleted}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex items-center text-green-500 mb-2">
                      <FaTrophy className="mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Reps</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {selectedWorkout.totalReps}
                    </div>
                  </div>
                </div>
                
                {/* Intensity */}
                <div className="mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Intensity</div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaFire 
                        key={i} 
                        className={`mr-1 ${i < selectedWorkout.intensityLevel ? 
                          'text-orange-500' : 
                          'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                {/* Exercise List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    Completed Exercises
                  </h3>
                  <div className="space-y-3">
                    {selectedWorkout.exerciseDetails.map((exercise, index) => (
                      <div 
                        key={`${exercise.name}-${index}`}
                        className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex items-center"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                          <FaDumbbell className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {exercise.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.sets} sets • {exercise.reps} reps
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                {selectedWorkout.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedWorkout.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-3xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                No Workout Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't completed any workout on {format(selectedDate, 'MMMM d, yyyy')}
              </p>
              <Link 
                href="/workout"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Browse Workouts
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutHistoryPage;
