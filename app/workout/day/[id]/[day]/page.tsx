'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { Workout, ActiveWorkout } from '@/app/types/workout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaDumbbell, FaFire, FaArrowLeft, FaCheck, FaPlay, FaClock, FaHeart, FaEllipsisV } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { BiBody } from 'react-icons/bi';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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

export default function WorkoutDayPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

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

  const handleCompleteWorkout = async () => {
    if (!user || !id || !workoutDay || !activeWorkout) return;
    
    setCompletingWorkout(true);
    try {
      const activeWorkoutRef = doc(db, `users/${user.uid}/activeWorkouts/${id}`);
      
      // Add today's date to completedDays
      await updateDoc(activeWorkoutRef, {
        completedDays: arrayUnion(new Date())
      });
      
      toast.success('Workout completed! Great job!');
      
      // Redirect back to days overview
      setTimeout(() => {
        router.push(`/workout/days/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Failed to mark workout as complete');
      setCompletingWorkout(false);
    }
  };
  
  const handleStartWorkout = () => {
    if (!workoutDay || !workout) return;
    
    // Navigate to the workout execution page
    router.push(`/workout/execute/${id}/${day}`);
  };
  
  const openExerciseModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };
  
  const closeExerciseModal = () => {
    setShowExerciseModal(false);
    setTimeout(() => setSelectedExercise(null), 300); // Clear after animation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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

  if (!workout || !activeWorkout || !workoutDay) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Workout Day Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The workout day you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Exercise Modal */}
      {showExerciseModal && selectedExercise && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-xl overflow-hidden max-w-md w-full border border-gray-800 shadow-xl"
          >
            <div className="relative">
              <div className="h-64 w-full relative bg-gray-800">
                {selectedExercise.gifUrl ? (
                  <img
                    src={selectedExercise.gifUrl}
                    alt={selectedExercise.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaDumbbell className="text-gray-600 text-5xl" />
                  </div>
                )}
              </div>
              <button 
                onClick={closeExerciseModal}
                className="absolute top-4 right-4 bg-gray-800/80 rounded-full p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-2">{selectedExercise.name}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedExercise.sets && (
                  <div className="bg-gray-800/70 rounded-lg px-3 py-1 text-sm">
                    <span className="text-green-400 font-medium">{selectedExercise.sets}</span>
                    <span className="text-gray-400 ml-1">sets</span>
                  </div>
                )}
                {selectedExercise.reps && (
                  <div className="bg-gray-800/70 rounded-lg px-3 py-1 text-sm">
                    <span className="text-green-400 font-medium">{selectedExercise.reps}</span>
                    <span className="text-gray-400 ml-1">reps</span>
                  </div>
                )}
                {selectedExercise.duration && (
                  <div className="bg-gray-800/70 rounded-lg px-3 py-1 text-sm">
                    <span className="text-green-400 font-medium">{selectedExercise.duration}s</span>
                    <span className="text-gray-400 ml-1">duration</span>
                  </div>
                )}
                {selectedExercise.restBetweenSets && (
                  <div className="bg-gray-800/70 rounded-lg px-3 py-1 text-sm">
                    <span className="text-green-400 font-medium">{selectedExercise.restBetweenSets}s</span>
                    <span className="text-gray-400 ml-1">rest</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <h4 className="text-sm uppercase text-gray-400 mb-2">Description</h4>
                <p className="text-gray-300">
                  {selectedExercise.description || 'No description available for this exercise.'}
                </p>
              </div>
              
              <button 
                onClick={closeExerciseModal}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Header */}
      <div className="relative">
        {/* Top navigation */}
        <div className="flex justify-between items-center p-4">
          <Link 
            href={`/workout/days/${id}`}
            className="rounded-full bg-gray-800/80 p-2"
          >
            <FaArrowLeft className="text-white" />
          </Link>
          <button className="rounded-full bg-gray-800/80 p-2">
            <FaEllipsisV className="text-white" />
          </button>
        </div>

       

        {/* Calories card */}
        <div className="mx-5 bg-gray-900 rounded-xl overflow-hidden">
          <div className="relative">
            {workout.imageUrl && (
              <div className="h-40 w-full relative">
                <Image
                  src={workout.imageUrl}
                  alt={workout.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-white">Full Body Workout</h2>
                  <div className="flex items-center mt-1">
                    <BiBody className="text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">{workout.level}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-white">{workout.caloriesPerDay}</div>
                  <div className="text-green-400 text-xs">calories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Exercises list */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Workout Plan
          </h2>
          <div className="text-gray-400 text-sm">
            {workoutDay.completed ? 'Completed' : 'In progress'}
          </div>
        </div>
          
        {workoutDay.exercises.length === 0 ? (
          <div className="text-center py-8 bg-gray-900 rounded-xl p-6">
            <FaDumbbell className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No exercises specified for today
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              This might be a rest day or the exercises haven't been added yet. Take this opportunity to recover and prepare for your next workout.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Day info section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-white">Day {workoutDay.dayNumber} Overview</h3>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  {workout.level}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <FaDumbbell className="text-green-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{workoutDay.exercises.length}</div>
                  <div className="text-xs text-gray-400">Exercises</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <FaFire className="text-orange-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{workout.caloriesPerDay}</div>
                  <div className="text-xs text-gray-400">Calories</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <FaClock className="text-blue-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">45</div>
                  <div className="text-xs text-gray-400">Minutes</div>
                </div>
              </div>
            </div>
            
            {/* Exercise stack */}
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <FaDumbbell className="mr-2 text-green-400" />
              Exercise List ({workoutDay.exercises.length})
            </h3>
            
            {/* Debug info */}
            <div className="bg-gray-800 p-3 rounded-lg mb-4 text-xs">
              <p className="text-gray-400">Debug: {JSON.stringify(workoutDay.exercises?.length || 0)} exercises found</p>
            </div>
            
            <AnimatePresence>
              {workoutDay.exercises && workoutDay.exercises.map((exercise, index) => {
                console.log('Rendering exercise:', exercise);
                return (
                <motion.div
                  key={`exercise-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl overflow-hidden mb-3 border border-gray-800"
                >
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="w-20 h-20 mr-4 relative rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                        {exercise.gifUrl ? (
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name || 'Exercise'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FaDumbbell className="text-gray-600 text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-white text-lg">
                            {exercise.name || `Exercise ${index + 1}`}
                          </h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openExerciseModal(exercise);
                            }}
                            className="bg-gray-800 rounded-full p-2 ml-2 hover:bg-gray-700 transition-colors"
                          >
                            <FaPlay className="text-green-400" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {exercise.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 space-x-3">
                      {exercise.sets && (
                        <div className="bg-gray-800/70 rounded-lg px-3 py-2 flex items-center">
                          <span className="text-gray-400 text-xs mr-2">Sets</span>
                          <span className="text-white font-medium">{exercise.sets}</span>
                        </div>
                      )}
                      {exercise.reps && (
                        <div className="bg-gray-800/70 rounded-lg px-3 py-2 flex items-center">
                          <span className="text-gray-400 text-xs mr-2">Reps</span>
                          <span className="text-white font-medium">{exercise.reps}</span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="bg-gray-800/70 rounded-lg px-3 py-2 flex items-center">
                          <span className="text-gray-400 text-xs mr-2">Duration</span>
                          <span className="text-white font-medium">{exercise.duration}s</span>
                        </div>
                      )}
                      {exercise.restBetweenSets && (
                        <div className="bg-gray-800/70 rounded-lg px-3 py-2 flex items-center">
                          <span className="text-gray-400 text-xs mr-2">Rest</span>
                          <span className="text-white font-medium">{exercise.restBetweenSets}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

        {/* Start workout button */}
        <div className="fixed bottom-16 left-0 right-0 p-5">
          <div className="max-w-md mx-auto">
            {!workoutDay.completed ? (
              <button
                onClick={handleStartWorkout}
                disabled={completingWorkout}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full flex items-center justify-center disabled:opacity-70 shadow-lg"
              >
                {completingWorkout ? (
                  <>
                    <span className="mr-2 animate-spin">⟳</span>
                    Loading...
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Start Workout
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center text-green-500">
                  <FaHeart className="mr-2" />
                  <span className="font-medium">Great job! You've completed this workout.</span>
                </div>
                <Link
                  href={`/workout/days/${id}`}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full"
                >
                  Back to Plan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    
    );
  }
