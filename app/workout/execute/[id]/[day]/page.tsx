'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, addDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { Workout, ActiveWorkout } from '@/app/types/workout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaDumbbell, FaFire, FaArrowLeft, FaCheck, FaPlay, FaPause, FaForward, FaSun, FaMoon } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';

interface Exercise {
  name: string;
  description: string;
  gifUrl: string;
  categoryId: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restBetweenSets?: number;
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  exercises: Exercise[];
  completed: boolean;
}

export default function WorkoutExecutePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  
  // Workout execution state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(180); // 3 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Sets and reps tracking
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  
  // Rest timer state
  const [showRestModal, setShowRestModal] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(45); // 45 seconds rest between sets by default
  const [isExerciseCompleteRest, setIsExerciseCompleteRest] = useState(false); // Flag to track if rest is between exercises
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [nextExercise, setNextExercise] = useState<Exercise | null>(null);
  
  // Workout summary state
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    totalTime: 0,
    caloriesBurned: 0,
    exercisesCompleted: 0,
    setsCompleted: 0,
    totalReps: 0
  });

  // Extract the ID and day from params, ensuring they're strings
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const day = params?.day ? (Array.isArray(params.day) ? params.day[0] : params.day) : null;

  useEffect(() => {
    // Don't try to fetch data until authentication is complete
    if (authLoading) return;
    
    const fetchWorkoutData = async () => {
      console.log('Fetching workout day data with ID:', id, 'Day:', day);
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
      
      if (!day) {
        setError('Missing workout day parameter');
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

        // Fetch specific day data
        const dayNumber = parseInt(day as string);
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

        const dayDoc = daysSnapshot.docs.find(doc => {
          const data = doc.data();
          return data.dayNumber === dayNumber;
        });
        
        if (dayDoc) {
          const dayData = dayDoc.data();
          console.log('Day data from Firebase:', dayData);
          console.log('Exercises from Firebase:', dayData.exercises);
          
          // Process exercises to ensure all fields are accessible
          const processedExercises = Array.isArray(dayData.exercises) 
            ? dayData.exercises.map(exercise => {
                // Handle both direct properties and nested objects
                return {
                  name: exercise.name || (exercise.exercise && exercise.exercise.name) || 'Unnamed Exercise',
                  description: exercise.description || (exercise.exercise && exercise.exercise.description) || '',
                  gifUrl: exercise.gifUrl || (exercise.exercise && exercise.exercise.gifUrl) || '',
                  categoryId: exercise.categoryId || (exercise.exercise && exercise.exercise.categoryId) || '',
                  sets: exercise.sets || (exercise.exercise && exercise.exercise.sets),
                  reps: exercise.reps || (exercise.exercise && exercise.exercise.reps),
                  duration: exercise.duration || (exercise.exercise && exercise.exercise.duration),
                  restBetweenSets: exercise.restBetweenSets || (exercise.exercise && exercise.exercise.restBetweenSets)
                };
              })
            : [];
          
          console.log('Processed exercises:', processedExercises);
          
          setWorkoutDay({
            id: dayDoc.id,
            dayNumber: dayData.dayNumber,
            exercises: processedExercises,
            completed: completedDayNumbers.includes(dayNumber)
          });
        } else {
          // Create default day if it doesn't exist
          setWorkoutDay({
            id: `day-${dayNumber}`,
            dayNumber: dayNumber,
            exercises: [],
            completed: completedDayNumbers.includes(dayNumber)
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setError('Failed to load workout data');
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [user, id, day, authLoading]);

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          // Calculate progress percentage
          const newProgress = Math.min(Math.round((newTime / totalTime) * 100), 100);
          setProgress(newProgress);
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, totalTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const startRestTimer = (isExerciseComplete = false) => {
    if (!workoutDay || !workoutDay.exercises) return;
    
    // Do NOT pause the workout timer - keep it running
    // We want the timer to continue throughout the entire workout
    
    // Set the next exercise if available
    if (currentExerciseIndex < workoutDay.exercises.length - 1) {
      setNextExercise(workoutDay.exercises[currentExerciseIndex + 1]);
    } else {
      setNextExercise(null);
    }
    
    // Reset rest timer - 45s for set rest, 60s for exercise rest
    const restTime = isExerciseComplete ? 60 : 45;
    setRestTimeRemaining(restTime);
    setIsExerciseCompleteRest(isExerciseComplete);
    setShowRestModal(true);
    
    // Start rest timer countdown
    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          // Rest time completed
          if (restTimerRef.current) {
            clearInterval(restTimerRef.current);
          }
          setShowRestModal(false);
          
          // Move to next exercise if this was an exercise rest
          if (isExerciseComplete) {
            if (currentExerciseIndex < workoutDay.exercises.length - 1) {
              handleNextExercise();
            } else {
              showWorkoutSummaryModal();
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const adjustRestTime = (seconds: number) => {
    setRestTimeRemaining(prev => {
      // Don't allow less than 5 seconds
      const newTime = Math.max(5, prev + seconds);
      return newTime;
    });
  };
  
  const skipRest = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    setShowRestModal(false);
    
    // Move to next exercise if this was an exercise rest
    if (isExerciseCompleteRest) {
      if (currentExerciseIndex < (workoutDay?.exercises?.length || 0) - 1) {
        handleNextExercise();
      } else {
        showWorkoutSummaryModal();
      }
    }
  };
  
  const showWorkoutSummaryModal = () => {
    // Calculate workout stats
    const totalSets = completedSets.length;
    const totalReps = workoutDay?.exercises.reduce((total, exercise) => {
      return total + (exercise.sets || 0) * (exercise.reps || 0);
    }, 0) || 0;
    
    // Calculate calories based on workout duration and intensity
    const caloriesPerMinute = workout?.caloriesPerDay ? workout.caloriesPerDay / 60 : 5; // Default to 5 calories per minute
    const caloriesBurned = Math.round(caloriesPerMinute * (elapsedTime / 60));
    
    // Prepare workout stats for display (not saving to Firebase yet)
    setWorkoutStats({
      totalTime: elapsedTime,
      caloriesBurned,
      exercisesCompleted: currentExerciseIndex + 1,
      setsCompleted: totalSets,
      totalReps
    });
    
    setShowWorkoutSummary(true);
  };

  const handleNextExercise = () => {
    if (!workoutDay || !workoutDay.exercises) return;
    
    // Reset sets tracking for the next exercise
    setCompletedSets([]);
    setCurrentSet(1);
    
    // Resume the workout timer if it was paused
    if (!isPlaying) {
      setIsPlaying(true);
    }
    
    if (currentExerciseIndex < workoutDay.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Complete the workout if we're at the last exercise
      handleCompleteWorkout();
    }
  };
  
  const handleCompleteSet = () => {
    if (!workoutDay || !workoutDay.exercises) return;
    
    const currentExercise = workoutDay.exercises[currentExerciseIndex];
    const totalSets = currentExercise.sets || 1;
    const isLastExercise = currentExerciseIndex === workoutDay.exercises.length - 1;
    
    if (currentSet <= totalSets) {
      // Add current set to completed sets
      setCompletedSets(prev => [...prev, currentSet]);
      
      // Move to next set or exercise
      if (currentSet < totalSets) {
        setCurrentSet(prev => prev + 1);
        toast.success(`Set ${currentSet} completed!`);
        // Start set rest timer (45 seconds)
        startRestTimer(false);
      } else {
        // All sets completed for this exercise
        toast.success('All sets completed!');
        
        if (isLastExercise) {
          // This was the last exercise and all sets are completed
          // Show finish button in bottom controls (no rest timer)
          toast.success('Workout completed! Click Finish to save your progress.');
        } else {
          // Start exercise rest timer (60 seconds)
          startRestTimer(true);
        }
      }
    }
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleCompleteWorkout = () => {
    if (!user || !id || !workoutDay || !activeWorkout || !workout) return;
    
    setCompletingWorkout(true);
    
    // Calculate final workout stats
    const totalSets = completedSets.length;
    const totalReps = workoutDay.exercises.reduce((total, exercise) => {
      return total + (exercise.sets || 0) * (exercise.reps || 0);
    }, 0);
    
    // Calculate calories based on workout duration and intensity
    const caloriesPerMinute = workout.caloriesPerDay ? workout.caloriesPerDay / 60 : 5;
    const caloriesBurned = Math.round(caloriesPerMinute * (elapsedTime / 60));
    
    // Prepare workout stats for display (not saving to Firebase yet)
    setWorkoutStats({
      totalTime: elapsedTime,
      caloriesBurned,
      exercisesCompleted: workoutDay.exercises.length,
      setsCompleted: totalSets,
      totalReps
    });
    
    // Keep timer running - don't pause it
    // We'll save data when the user clicks Done in the summary modal
    setShowWorkoutSummary(true);
    setCompletingWorkout(false);
  };
  
  const saveWorkoutData = async () => {
    if (!user || !id || !workoutDay || !activeWorkout || !workout) return;
    
    setCompletingWorkout(true);
    try {
      // Calculate final workout stats
      const totalSets = completedSets.length;
      const totalReps = workoutDay.exercises.reduce((total, exercise) => {
        return total + (exercise.sets || 0) * (exercise.reps || 0);
      }, 0);
      
      // Calculate calories based on workout duration and intensity
      const caloriesPerMinute = workout.caloriesPerDay ? workout.caloriesPerDay / 60 : 5;
      const caloriesBurned = Math.round(caloriesPerMinute * (elapsedTime / 60));
      
      // Calculate intensity level (1-5)
      const intensityLevel = Math.min(5, Math.ceil(caloriesBurned / 50));
      
      // Prepare exercise details for saving
      const exerciseDetails = workoutDay.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets || 0,
        reps: exercise.reps || 0,
        duration: exercise.duration || 0,
        categoryId: exercise.categoryId,
        completed: true
      }));
      
      // Enhanced workout stats data with additional information
      const workoutStatsData = {
        date: new Date(),
        totalTime: elapsedTime,
        caloriesBurned,
        exercisesCompleted: workoutDay.exercises.length,
        setsCompleted: totalSets,
        totalReps,
        dayNumber: workoutDay.dayNumber,
        workoutId: id,
        intensityLevel,
        exerciseDetails,
        userMood: 'great', // Default mood after workout
        notes: ''
      };
      
      // Save workout stats to Firebase
      const activeWorkoutRef = doc(db, `users/${user.uid}/activeWorkouts/${id}`);
      const workoutStatsRef = collection(db, `users/${user.uid}/workoutStats`);
      
      // Add today's date to completedDays
      await updateDoc(activeWorkoutRef, {
        completedDays: arrayUnion(new Date()),
        lastCompletedDate: new Date()
      });
      
      // Save detailed workout stats
      await addDoc(workoutStatsRef, workoutStatsData);
      
      // Add to user's activity feed
      const activityFeedRef = collection(db, `users/${user.uid}/activityFeed`);
      await addDoc(activityFeedRef, {
        type: 'workout_completed',
        date: new Date(),
        workoutId: id,
        dayNumber: workoutDay.dayNumber,
        caloriesBurned,
        totalTime: elapsedTime
      });
      
      toast.success('Workout data saved! Great job!');
      
      // Stop the timer when navigating away
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Calculate the next day number
      const nextDayNumber = parseInt(day || '0') + 1;
      
      // Check if the workout has a next day
      if (workout && nextDayNumber <= workout.days) {
        // Navigate to the next day
        router.push(`/workout/day/${id}/${nextDayNumber}`);
      } else {
        // Navigate back to workout days overview if this was the last day
        router.push(`/workout/days/${id}`);
      }
    } catch (error) {
      console.error('Error saving workout data:', error);
      toast.error('Failed to save workout data');
      setCompletingWorkout(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-700 rounded mb-6 mx-auto" />
          <div className="h-64 w-64 bg-gray-700 rounded-xl mb-6 mx-auto" />
          <div className="h-4 w-48 bg-gray-700 rounded mb-4 mx-auto" />
          <div className="h-10 w-32 bg-gray-700 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Error
          </h1>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <Link 
            href={`/workout/days/${id}`}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full inline-block"
          >
            Back to Workout Plan
          </Link>
        </div>
      </div>
    );
  }

  if (!workout || !activeWorkout || !workoutDay || !workoutDay.exercises || workoutDay.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            No Exercises Found
          </h1>
          <p className="text-gray-400 mb-6">
            This workout day doesn't have any exercises.
          </p>
          <Link 
            href={`/workout/days/${id}`}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full inline-block"
          >
            Back to Workout Plan
          </Link>
        </div>
      </div>
    );
  }

  const currentExercise = workoutDay.exercises[currentExerciseIndex];

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Rest Timer Modal */}
      {showRestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl overflow-hidden max-w-md w-full shadow-xl ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
          >
            <div className="p-6 text-center">
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {isExerciseCompleteRest ? 'Exercise Complete' : 'Rest Time'}
              </h2>
              
              {/* Timer with adjustment buttons */}
              <div className="my-6">
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => adjustRestTime(-5)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    <span className="text-xl font-bold">-5</span>
                  </button>
                  
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="text-5xl font-bold">{restTimeRemaining}s</div>
                  </div>
                  
                  <button 
                    onClick={() => adjustRestTime(5)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    <span className="text-xl font-bold">+5</span>
                  </button>
                </div>
              </div>
              
              {nextExercise && (
                <div className="mb-6">
                  <h3 className={`text-sm uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Next Exercise</h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center`}>
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden mr-3">
                      {nextExercise.gifUrl ? (
                        <img src={nextExercise.gifUrl} alt={nextExercise.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <FaDumbbell className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{nextExercise.name}</h4>
                      <div className="flex text-xs mt-1">
                        {nextExercise.sets && <span className="mr-2">{nextExercise.sets} sets</span>}
                        {nextExercise.reps && <span>{nextExercise.reps} reps</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={skipRest}
                className={`w-full py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                Skip Rest
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Workout Summary Modal */}
      {showWorkoutSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`rounded-xl overflow-hidden max-w-md w-full shadow-xl ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
          >
            <div className="p-6">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <FaCheck className="text-green-500 text-4xl" />
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Workout Complete!
              </motion.h2>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {/* Workout Title and Day */}
                <div className="mb-6 text-center">
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {workout?.title}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Day {workoutDay?.dayNumber} of {workout?.days}
                  </p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}
                  >
                    <div className="text-sm text-gray-500 mb-1">Time</div>
                    <div className="text-xl font-bold">{formatTime(elapsedTime)}</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}
                  >
                    <div className="text-sm text-gray-500 mb-1">Calories</div>
                    <div className="text-xl font-bold">{workoutStats.caloriesBurned}</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}
                  >
                    <div className="text-sm text-gray-500 mb-1">Exercises</div>
                    <div className="text-xl font-bold">{workoutStats.exercisesCompleted}</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}
                  >
                    <div className="text-sm text-gray-500 mb-1">Sets</div>
                    <div className="text-xl font-bold">{workoutStats.setsCompleted}</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center col-span-2`}
                  >
                    <div className="text-sm text-gray-500 mb-1">Intensity</div>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaFire 
                          key={i} 
                          className={i < Math.ceil(workoutStats.caloriesBurned / 50) ? 'text-orange-500' : 'text-gray-400'} 
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                {/* Exercise List */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mb-6"
                >
                  <h3 className={`text-sm uppercase mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed Exercises
                  </h3>
                  
                  <div className="space-y-3">
                    {workoutDay?.exercises.map((exercise, index) => (
                      <motion.div 
                        key={`summary-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + (index * 0.1) }}
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center`}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                          <FaCheck className="text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.name}</h4>
                          <div className="flex text-xs text-gray-500 mt-1">
                            {exercise.sets && <span className="mr-2">{exercise.sets} sets</span>}
                            {exercise.reps && <span className="mr-2">{exercise.reps} reps</span>}
                            {exercise.duration && <span>{exercise.duration}s</span>}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <FaDumbbell className="text-blue-500" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={saveWorkoutData}
                  disabled={completingWorkout}
                  className={`w-full py-4 rounded-lg font-medium text-lg ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white flex items-center justify-center`}
                >
                  {completingWorkout ? (
                    <>
                      <div className="mr-2 h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Done <FaCheck className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
     

      {/* Exercise Display */}
      <div className="flex-1 flex flex-col">
        {/* Exercise GIF */}
        <div className={`relative w-full h-64 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg mx-auto max-w-md overflow-hidden`}>
          {currentExercise.gifUrl ? (
            <img
              src={currentExercise.gifUrl}
              alt={currentExercise.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaDumbbell className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} text-6xl`} />
            </div>
          )}
        </div>

        {/* Exercise Title and Description */}
        <div className="px-4 py-6 max-w-md mx-auto w-full">
          <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {currentExercise.name}
          </h1>
          
          {/* Sets and Reps Tracking */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Sets & Reps
              </h2>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Set {currentSet} of {currentExercise.sets || 1}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: currentExercise.sets || 1 }).map((_, index) => {
                const setNumber = index + 1;
                const isCompleted = completedSets.includes(setNumber);
                const isActive = setNumber === currentSet;
                
                return (
                  <button
                    key={`set-${setNumber}`}
                    onClick={() => isActive && handleCompleteSet()}
                    disabled={!isActive && !isCompleted}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${isCompleted ? 
                        (theme === 'dark' ? 'bg-green-800/50 text-green-400' : 'bg-green-100 text-green-700') : 
                        isActive ? 
                          (theme === 'dark' ? 'bg-gray-800 text-white border border-green-500' : 'bg-gray-200 text-gray-900 border border-green-500') :
                          (theme === 'dark' ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-200/50 text-gray-500')
                      }
                    `}
                  >
                    {isCompleted ? (
                      <>
                        <FaCheck className="inline mr-1" />
                        Set {setNumber}
                      </>
                    ) : (
                      <>Set {setNumber}{isActive ? ' (Current)' : ''}</>
                    )}
                    {currentExercise.reps && <span className="ml-1">- {currentExercise.reps} reps</span>}
                  </button>
                );
              })}
            </div>
            
            {isPlaying ? (
              <button
                onClick={handleCompleteSet}
                className={`w-full py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                Complete Set {currentSet}
              </button>
            ) : (
              <div className={`text-center py-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Timer paused - Resume to continue workout
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <h3 className={`text-sm uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Description</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {currentExercise.description || 'No description available for this exercise.'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className={`fixed bottom-16 left-0 right-0 p-4 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          {/* Workout Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 max-w-md mx-auto">
            <div className={`rounded-lg p-2 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xs text-gray-500 mb-1">Time</div>
              <div className="font-bold">{formatTime(elapsedTime)}</div>
            </div>
            <div className={`rounded-lg p-2 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xs text-gray-500 mb-1">Completed</div>
              <div className="font-bold">{currentExerciseIndex}/{workoutDay?.exercises?.length || 0}</div>
            </div>
            <div className={`rounded-lg p-2 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-xs text-gray-500 mb-1">Next</div>
              <div className="font-bold truncate">
                {currentExerciseIndex < (workoutDay?.exercises?.length || 0) - 1 ? 
                  workoutDay?.exercises[currentExerciseIndex + 1]?.name?.split(' ')[0] || 'N/A' : 
                  'Last'}
              </div>
            </div>
          </div>
          
          {/* Bottom Controls */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Timer */}
            <div className="flex items-center">
              <IoMdTime className={`mr-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <span className="font-medium">{formatTime(elapsedTime)}</span>
            </div>
            
            {/* Next Exercise Preview or Finish Button */}
            {workoutDay && currentExerciseIndex < workoutDay.exercises.length - 1 ? (
              <div className="flex items-center">
                <div className="mr-2">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Next</div>
                  <div className="font-medium truncate max-w-[100px]">{workoutDay.exercises[currentExerciseIndex + 1].name}</div>
                </div>
                <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                  {workoutDay.exercises[currentExerciseIndex + 1].gifUrl ? (
                    <img 
                      src={workoutDay.exercises[currentExerciseIndex + 1].gifUrl} 
                      alt={workoutDay.exercises[currentExerciseIndex + 1].name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      <FaDumbbell className="text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleCompleteWorkout}
                disabled={completingWorkout}
                className={`px-4 py-2 rounded-lg font-medium flex items-center ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {completingWorkout ? 'Saving...' : 'Finish Workout'}
                {!completingWorkout && <FaCheck className="ml-2" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
