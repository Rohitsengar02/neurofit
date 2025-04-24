'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaDumbbell, FaFire, FaCheck, FaArrowRight, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  categoryId: string;
  completed: boolean;
}

interface WorkoutStat {
  id: string;
  date: any;
  totalTime: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  setsCompleted: number;
  totalReps: number;
  dayNumber: number;
  workoutId: string;
  intensityLevel: number;
  exerciseDetails: Exercise[];
  userMood: string;
  notes: string;
}

interface ActiveWorkout {
  id: string;
  workoutId: string;
  categoryId: string;
  title: string;
  imageUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalDays: number;
  completedDays: Date[];
  currentDay: number;
  exercises: Exercise[];
}

const TodayWorkout = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<WorkoutStat | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [currentDayExercises, setCurrentDayExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if user has completed a workout today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const statsRef = collection(db, `users/${user.uid}/workoutStats`);
        const todayStatsQuery = query(
          statsRef,
          where('date', '>=', today),
          where('date', '<', tomorrow),
          orderBy('date', 'desc'),
          limit(1)
        );

        const statsSnapshot = await getDocs(todayStatsQuery);
        
        if (!statsSnapshot.empty) {
          // User has completed a workout today
          const statDoc = statsSnapshot.docs[0];
          const statData = statDoc.data() as WorkoutStat;
          statData.id = statDoc.id;
          // Handle Firestore timestamp conversion
          if (statData.date && typeof statData.date.toDate === 'function') {
            statData.date = statData.date.toDate();
          }
          setTodayStats(statData);
        } else {
          // User hasn't completed a workout today, fetch active workout
          const activeWorkoutsRef = collection(db, `users/${user.uid}/activeWorkouts`);
          const activeWorkoutsSnapshot = await getDocs(activeWorkoutsRef);
          
          if (!activeWorkoutsSnapshot.empty) {
            // Get the most recent active workout
            const workoutDoc = activeWorkoutsSnapshot.docs[0];
            const workoutData = workoutDoc.data();
            
            // Determine current day based on completed days
            const completedDays = workoutData.completedDays || [];
            // Convert Firestore timestamps to JS Date objects if needed
            const completedDatesArray = completedDays.map((date: any) => 
              date && typeof date.toDate === 'function' ? date.toDate() : date
            );
            const currentDay = completedDatesArray.length + 1;
            
            // Fetch the workout details to get exercises
            const workoutRef = collection(db, 'workouts');
            const workoutQuery = query(workoutRef, where('id', '==', workoutData.workoutId));
            const workoutSnapshot = await getDocs(workoutQuery);
            
            if (!workoutSnapshot.empty) {
              const workoutDetails = workoutSnapshot.docs[0].data();
              
              // Get exercises for the current day
              let exercises: Exercise[] = [];
              if (workoutDetails.days && workoutDetails.days[currentDay - 1]) {
                exercises = workoutDetails.days[currentDay - 1].exercises || [];
              }
              
              setActiveWorkout({
                id: workoutDoc.id,
                workoutId: workoutData.workoutId,
                categoryId: workoutData.categoryId,
                title: workoutData.title,
                imageUrl: workoutData.imageUrl,
                level: workoutData.level,
                totalDays: workoutData.totalDays,
                completedDays: completedDatesArray,
                currentDay,
                exercises
              });
              
              setCurrentDayExercises(exercises);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching today workout:', error);
        setError('Failed to load workout data');
        setLoading(false);
      }
    };

    fetchTodayWorkout();
  }, [user]);

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md h-full flex items-center justify-center`}>
        <div className="w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Today's Workout</h3>
        <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      </div>
    );
  }

  // Workout completed today
  if (todayStats) {
    return (
      <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
        <div className={`p-4 ${theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
              <FaCheck className="text-green-500" />
            </div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Today's Workout Complete
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'}`}>
            Day {todayStats.dayNumber}
          </div>
        </div>
        
        <div className="p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className="flex items-center justify-center mb-1">
                <IoMdTime className={`mr-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="text-xs text-gray-500">Time</div>
              </div>
              <div className="font-bold">{formatTime(todayStats.totalTime)}</div>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className="flex items-center justify-center mb-1">
                <FaFire className={`mr-1 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                <div className="text-xs text-gray-500">Calories</div>
              </div>
              <div className="font-bold">{todayStats.caloriesBurned}</div>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className="flex items-center justify-center mb-1">
                <FaDumbbell className={`mr-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className="text-xs text-gray-500">Exercises</div>
              </div>
              <div className="font-bold">{todayStats.exercisesCompleted}</div>
            </div>
          </div>
          
          {/* Intensity */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Intensity</div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaFire 
                  key={i} 
                  className={`mr-1 ${i < todayStats.intensityLevel ? 
                    (theme === 'dark' ? 'text-orange-500' : 'text-orange-500') : 
                    (theme === 'dark' ? 'text-gray-600' : 'text-gray-300')}`} 
                />
              ))}
            </div>
          </div>
          
          {/* Exercise Preview */}
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">Completed Exercises</div>
            <div className="max-h-32 overflow-y-auto pr-2">
              {todayStats.exerciseDetails?.slice(0, 3).map((exercise, index) => (
                <div 
                  key={`exercise-${index}`}
                  className={`p-2 rounded-lg mb-2 flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                    <FaCheck className="text-green-500 text-xs" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{exercise.name}</div>
                    <div className="text-xs text-gray-500">
                      {exercise.sets} sets • {exercise.reps} reps
                    </div>
                  </div>
                </div>
              ))}
              {todayStats.exerciseDetails?.length > 3 && (
                <div className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{todayStats.exerciseDetails.length - 3} more exercises
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Link 
              href={`/workout/days/${todayStats.workoutId}`}
              className={`py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              <FaDumbbell className="mr-2" /> Workout Plan
            </Link>
            <Link 
              href="/pages/workout-history"
              className={`py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <FaHistory className="mr-2" /> History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No workout completed today, show today's plan
  return (
    <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md h-full`}>
      <div className={`p-4 ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'} flex items-center justify-between`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
            <FaCalendarAlt className="text-blue-500" />
          </div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Today's Workout
          </h3>
        </div>
        {activeWorkout && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'}`}>
            Day {activeWorkout.currentDay}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {activeWorkout ? (
          <>
            <div className="mb-4">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {activeWorkout.title}
              </h4>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeWorkout.level.charAt(0).toUpperCase() + activeWorkout.level.slice(1)} • {activeWorkout.currentDay} of {activeWorkout.totalDays} days
              </div>
            </div>
            
            {/* Exercise List */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Today's Exercises</div>
              <div className="max-h-48 overflow-y-auto pr-2">
                {currentDayExercises.map((exercise, index) => (
                  <div 
                    key={`exercise-${index}`}
                    className={`p-3 rounded-lg mb-2 flex items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <FaDumbbell className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {exercise.sets} sets • {exercise.reps} reps
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentDayExercises.length === 0 && (
                  <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No exercises found for today
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {currentDayExercises.length > 0 && (
                <Link 
                  href={`/workout/execute/${activeWorkout.workoutId}/${activeWorkout.currentDay}`}
                  className={`py-3 rounded-lg text-center font-medium flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Start Today's Workout <FaArrowRight className="ml-2" />
                </Link>
              )}
              <Link 
                href="/pages/workout-history"
                className={`py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                <FaHistory className="mr-2" /> View Workout History
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FaDumbbell className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              No Active Workout
            </h4>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Start a new workout plan to see your daily exercises
            </p>
            <Link 
              href="/workout"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FaDumbbell className="mr-2" /> Browse Workouts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayWorkout;
