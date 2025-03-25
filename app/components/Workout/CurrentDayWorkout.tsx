'use client';

import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { WorkoutDay, WorkoutExercise } from '@/app/components/Workout/workoutdaysAPI/workoutDay';
import { Exercise } from '@/app/components/Workout/workoutdaysAPI/exercise';
import { motion } from 'framer-motion';
import { FaDumbbell, FaFire, FaClock } from 'react-icons/fa';
import Image from 'next/image';

interface CurrentDayWorkoutProps {
  dayNumber: number;
  userId: string;
  category: string;
  workoutId: string;
}

export default function CurrentDayWorkout({ dayNumber, userId, category, workoutId }: CurrentDayWorkoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);

  const fetchWorkoutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('CurrentDayWorkout received props:', {
        category,
        workoutId,
        dayNumber,
        userId
      });

      // Validate required parameters
      if (!category) {
        console.error('Missing category parameter');
        setError('Missing category parameter');
        return;
      }

      if (!workoutId) {
        console.error('Missing workout ID parameter');
        setError('Missing workout ID parameter');
        return;
      }

      if (typeof dayNumber !== 'number' || dayNumber < 1) {
        console.error('Invalid day number:', dayNumber);
        setError('Invalid day number');
        return;
      }

      console.log('Fetching workout data with:', {
        category,
        workoutId,
        dayNumber
      });

      // Get the day document with exercises from the categories collection
      const dayPath = `categories/${category}/workouts/${workoutId}/days/${dayNumber}`;
      console.log('Accessing day at path:', dayPath);
      
      const dayRef = doc(db, dayPath);
      const dayDoc = await getDoc(dayRef);
      
      console.log('Day document exists:', dayDoc.exists());

      if (!dayDoc.exists()) {
        console.log('Day not found at path:', dayPath);
        setError(`Workout day ${dayNumber} not found`);
        return;
      }

      const dayData = dayDoc.data();
      console.log('Day document data:', dayData);

      if (!dayData || !Array.isArray(dayData.exercises)) {
        console.error('Invalid day data structure:', dayData);
        setError('Invalid workout day data');
        return;
      }

      console.log('Day exercises:', dayData.exercises);

      // Map the exercises array with proper structure
      const exercises: WorkoutExercise[] = dayData.exercises.map((exerciseData: any) => {
        if (!exerciseData.exercise) {
          console.error('Invalid exercise data:', exerciseData);
          return {
            exercise: {
              name: 'Unknown Exercise',
              description: 'Exercise data is missing',
              gifUrl: '',
              categoryId: category
            },
            sets: 3,
            reps: 10
          };
        }

        return {
          exercise: {
            name: exerciseData.exercise.name || 'Unnamed Exercise',
            description: exerciseData.exercise.description || '',
            gifUrl: exerciseData.exercise.gifUrl || '',
            categoryId: exerciseData.exercise.categoryId || category
          },
          sets: exerciseData.sets || 3,
          reps: exerciseData.reps || 10,
          duration: exerciseData.duration
        };
      });

      setWorkoutDay({
        id: dayDoc.id,
        dayNumber,
        exercises,
        categoryId: category,
        workoutId: workoutId
      });

    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Failed to load workout. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, dayNumber, workoutId, userId]);

  useEffect(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  // Return loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Return error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Workout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Return empty state if no workout day data
  if (!workoutDay || !workoutDay.exercises || workoutDay.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Exercises Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            There are no exercises scheduled for Day {dayNumber}.
          </p>
        </div>
      </div>
    );
  }

  // Main content with exercises
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Day Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Day {dayNumber}
              </h1>
              <p className="text-lg text-white/90">
                {workoutDay.exercises.length} Exercises
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <FaClock className="w-5 h-5" />
                <span>45 mins</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FaFire className="w-5 h-5" />
                <span>300 cal</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FaDumbbell className="w-5 h-5" />
                <span>Medium</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exercises Stack */}
        <div className="space-y-4">
          {workoutDay.exercises.map((exercise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {exercise.exercise.gifUrl && (
                      <Image
                        src={exercise.exercise.gifUrl}
                        alt={exercise.exercise.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {exercise.exercise.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {exercise.exercise.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                        <span className="block text-gray-500 dark:text-gray-400">Sets</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{exercise.sets}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                        <span className="block text-gray-500 dark:text-gray-400">Reps</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{exercise.reps}</span>
                      </div>
                      {exercise.duration && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                          <span className="block text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{exercise.duration}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
