'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import ChallengeTracker from '@/app/components/Workout/ChallengeTracker';
import type { Workout, ActiveWorkout } from '@/app/types/workout';

export default function WorkoutTrackerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!user || !id) {
        console.log('No user or id:', { user, id });
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching workout with ID:', id);
        
        // Fetch the active workout data
        const activeWorkoutRef = doc(db, `users/${user.uid}/activeWorkouts/${id}`);
        const activeWorkoutDoc = await getDoc(activeWorkoutRef);

        console.log('Active workout exists:', activeWorkoutDoc.exists());

        if (!activeWorkoutDoc.exists()) {
          console.error('Active workout not found');
          setError('Active workout not found');
          setLoading(false);
          return;
        }

        const activeWorkoutData = activeWorkoutDoc.data();
        console.log('Active workout data:', activeWorkoutData);

        // Ensure we have a valid categoryId and workoutId
        const categoryId = activeWorkoutData.categoryId;
        const originalWorkoutId = activeWorkoutData.originalWorkoutId || id;

        if (!categoryId) {
          console.error('No categoryId found in workout data');
          setError('Invalid workout data: missing category');
          setLoading(false);
          return;
        }

        console.log('Using categoryId:', categoryId);
        console.log('Using originalWorkoutId:', originalWorkoutId);

        // Set active workout
        const activeWorkout: ActiveWorkout = {
          workoutId: id as string,
          categoryId: categoryId,
          categoryName: activeWorkoutData.categoryName || '',
          startDate: activeWorkoutData.startDate ? new Date(activeWorkoutData.startDate) : new Date(),
          endDate: activeWorkoutData.endDate ? new Date(activeWorkoutData.endDate) : new Date(),
          completedDays: (activeWorkoutData.completedDays || [])
            .map((d: any) => {
              if (!d) return null;
              try {
                return new Date(d);
              } catch (e) {
                console.error('Invalid date:', d);
                return null;
              }
            })
            .filter((d: Date | null): d is Date => d !== null),
          title: activeWorkoutData.title || '',
          imageUrl: activeWorkoutData.imageUrl || '',
          level: activeWorkoutData.level || 'beginner',
          totalDays: activeWorkoutData.totalDays || 30,
          caloriesPerDay: activeWorkoutData.calories || 0,
          status: activeWorkoutData.status || 'active',
          originalWorkoutId: originalWorkoutId
        };
        setActiveWorkout(activeWorkout);

        // Fetch the workout details from exercises collection using originalWorkoutId
        const workoutPath = `exercises/${categoryId}/workouts/${originalWorkoutId}`;
        console.log('Fetching workout from:', workoutPath);
        
        const workoutRef = doc(db, workoutPath);
        const workoutDoc = await getDoc(workoutRef);

        console.log('Workout exists:', workoutDoc.exists());

        if (!workoutDoc.exists()) {
          console.error('Workout not found at path:', workoutPath);
          setError('Workout not found');
          setLoading(false);
          return;
        }

        const workoutData = workoutDoc.data();
        console.log('Workout data:', workoutData);

        // Set workout with proper structure
        const workout: Workout = {
          id: originalWorkoutId,
          title: workoutData.title || activeWorkout.title,
          description: workoutData.description || '',
          imageUrl: workoutData.imageUrl || activeWorkout.imageUrl,
          level: workoutData.level || activeWorkout.level,
          days: workoutData.totalDays || activeWorkout.totalDays,
          caloriesPerDay: workoutData.calories || activeWorkout.caloriesPerDay,
          exercises: workoutData.exercises || [],
          categoryId: categoryId
        };
        setWorkout(workout);
        
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setError('Failed to load workout data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
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

  // Convert dates to timestamps for the challenge tracker
  const validCompletedDays = activeWorkout.completedDays
    .filter(date => date instanceof Date && !isNaN(date.getTime()))
    .map(date => date.getTime());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ChallengeTracker
        challengeName={workout.title}
        challengeDuration={workout.days}
        startDate={activeWorkout.startDate}
        backgroundImage={workout.imageUrl}
        onDayClick={() => {}}
        completedDays={validCompletedDays}
        userId={user?.uid}
        category={activeWorkout.categoryId}
        workout={workout}
        activeWorkout={activeWorkout}
        workoutId={id as string}
      />
    </div>
  );
}
