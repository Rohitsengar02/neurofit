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

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!user || !id) {
        console.log('No user or id:', { user, id });
        return;
      }

      try {
        console.log('Fetching workout with ID:', id);
        
        // Fetch the active workout data
        const activeWorkoutRef = doc(db, `users/${user.uid}/activeWorkouts/${id}`);
        const activeWorkoutDoc = await getDoc(activeWorkoutRef);

        console.log('Active workout exists:', activeWorkoutDoc.exists());

        if (activeWorkoutDoc.exists()) {
          const activeWorkoutData = activeWorkoutDoc.data();
          console.log('Active workout data:', activeWorkoutData);

          // Set active workout with the data structure matching your interface
          setActiveWorkout({
            workoutId: id as string,
            categoryId: activeWorkoutData.categoryId || '',
            categoryName: activeWorkoutData.categoryName || '',
            startDate: activeWorkoutData.startDate ? new Date(activeWorkoutData.startDate) : new Date(),
            endDate: activeWorkoutData.endDate ? new Date(activeWorkoutData.endDate) : new Date(),
            completedDays: Array.isArray(activeWorkoutData.completedDays) 
              ? activeWorkoutData.completedDays.map((d: any) => {
                  try {
                    return new Date(d);
                  } catch (e) {
                    console.error('Invalid date:', d);
                    return null;
                  }
                }).filter(Boolean)
              : [],
            title: activeWorkoutData.title || '',
            imageUrl: activeWorkoutData.imageUrl || '',
            level: activeWorkoutData.level || 'beginner',
            totalDays: activeWorkoutData.totalDays || 30,
            caloriesPerDay: activeWorkoutData.calories || 0,
            status: 'active'
          } as ActiveWorkout);

          // Set workout with the same data since it's already in the active workout
          setWorkout({
            id: id as string,
            title: activeWorkoutData.title || '',
            description: activeWorkoutData.description || '',
            imageUrl: activeWorkoutData.imageUrl || '',
            level: activeWorkoutData.level || 'beginner',
            days: activeWorkoutData.totalDays || 30,
            caloriesPerDay: activeWorkoutData.calories || 0,
            exercises: activeWorkoutData.exercises || [],
            categoryId: activeWorkoutData.categoryId || ''
          } as Workout);
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
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
        category={activeWorkout.categoryName}
        workout={workout}
        activeWorkout={activeWorkout}
      />
    </div>
  );
}
