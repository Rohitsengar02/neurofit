'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/app/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import CurrentExercise from './CurrentExercise';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  description: string;
  videoId?: string;
}

interface WorkoutData {
  duration: string;
  calories: number;
  intensity: string;
  type: string;
  exercises: Exercise[];
  createdAt?: string;
  lastUpdated?: string;
  status?: 'in_progress' | 'completed';
  completedExercises?: number[];
}

interface CurrentDayWorkoutProps {
  dayNumber: number;
  userId: string;
  category: string;
}

export default function CurrentDayWorkout({ dayNumber, userId = '', category = '' }: CurrentDayWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if workout exists in Firebase
      const workoutRef = doc(db, 'users', userId, 'workoutData', category, 'days', dayNumber.toString());
      const workoutDoc = await getDoc(workoutRef);

      let workoutData: WorkoutData;
      if (workoutDoc.exists()) {
        workoutData = workoutDoc.data() as WorkoutData;
      } else {
        // Generate new workout if not found
        workoutData = await generateWorkoutWithGemini();
        await saveWorkoutToFirebase(workoutData);
      }

      setWorkout(workoutData);
    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Failed to load workout. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, dayNumber, userId]);

  useEffect(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  const generateWorkoutWithGemini = async () => {
    try {
      const response = await fetch('/api/gemini/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          dayNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate workout');
      }

      const data = await response.json();
      return data.workout;
    } catch (error) {
      console.error('Error generating workout:', error);
      throw error;
    }
  };

  const saveWorkoutToFirebase = async (workoutData: WorkoutData) => {
    try {
      // Save workout data to users/{userId}/workoutData/{category}/days/{dayNumber}
      const workoutRef = doc(db, 'users', userId, 'workoutData', category, 'days', dayNumber.toString());
      await setDoc(workoutRef, {
        ...workoutData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'in_progress',
        completedExercises: []
      });
    } catch (error) {
      console.error('Error saving workout to Firebase:', error);
      throw error;
    }
  };

  const handleNextExercise = async () => {
    if (!workout) return;

    try {
      // Update completed exercises in Firebase
      const workoutRef = doc(db, 'users', userId, 'workoutData', category, 'days', dayNumber.toString());
      await setDoc(workoutRef, {
        lastUpdated: new Date().toISOString(),
        completedExercises: [...(workout.completedExercises || []), currentExerciseIndex]
      }, { merge: true });

      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Workout completed
        await setDoc(workoutRef, {
          status: 'completed',
          completedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating workout progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchWorkoutData}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!workout || !workout.exercises) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-700 mb-4">No workout available</p>
        </div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <CurrentExercise
        exercise={currentExercise}
        dayNumber={dayNumber}
        exerciseIndex={currentExerciseIndex}
        onNext={handleNextExercise}
        userId={userId}
      />
    </div>
  );
}
