'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { ChallengeWorkout } from '@/app/types/workout';
import ChallengeTracker from '@/app/components/Workout/ChallengeTracker';

export default function ChallengePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isCommitted, setIsCommitted] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<ChallengeWorkout | null>(null);

  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!user) return;

      try {
        const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
        const challengesDoc = await getDoc(challengesRef);

        if (challengesDoc.exists()) {
          const data = challengesDoc.data();
          
          // Search in all program arrays
          const foundWorkout = [
            ...(data.challenges || []),
            ...(data.cardioPrograms || []),
            ...(data.strengthPrograms || [])
          ].find((w: any) => w.id === id);

          if (foundWorkout) {
            // Convert Firestore Timestamp to Date
            const workoutStartDate = foundWorkout.startDate?.toDate() || new Date();
            const workoutDuration = Number(foundWorkout.duration) || 30; // Default to 30 days if not set

            console.log('Found workout:', {
              ...foundWorkout,
              startDate: workoutStartDate,
              duration: workoutDuration
            });

            setWorkout({
              ...foundWorkout,
              startDate: workoutStartDate,
              duration: workoutDuration
            });
            setIsCommitted(true);
            setStartDate(workoutStartDate);
            setCompletedDays(foundWorkout.completedDays || []);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching challenge data:', error);
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [user, id]);

  const handleDayClick = async (day: number) => {
    if (!user || !workout) return;

    try {
      const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
      const challengesDoc = await getDoc(challengesRef);

      if (challengesDoc.exists()) {
        const data = challengesDoc.data();
        
        // Determine which array to update
        let targetArray = 'challenges';
        if (workout.id.startsWith('cardio-challenge')) {
          targetArray = 'cardioPrograms';
        } else if (workout.id.startsWith('strength-challenge')) {
          targetArray = 'strengthPrograms';
        }

        // Update the specific workout in the array
        const updatedPrograms = data[targetArray].map((w: any) => {
          if (w.id === workout.id) {
            const newCompletedDays = completedDays.includes(day)
              ? completedDays.filter(d => d !== day)
              : [...completedDays, day].sort((a, b) => a - b);

            return {
              ...w,
              completedDays: newCompletedDays,
              lastUpdated: new Date()
            };
          }
          return w;
        });

        // Update Firestore
        await updateDoc(challengesRef, {
          [targetArray]: updatedPrograms
        });

        // Update local state
        setCompletedDays(
          completedDays.includes(day)
            ? completedDays.filter(d => d !== day)
            : [...completedDays, day].sort((a, b) => a - b)
        );
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : workout ? (
        <ChallengeTracker
          challengeName={workout?.title || ''}
          challengeDuration={workout?.duration || 30}
          startDate={startDate}
          backgroundImage={workout?.image || ''}
          onDayClick={handleDayClick}
          completedDays={completedDays}
          userId={user?.uid || ''}
          category="challenge"
          workout={{
            id: workout?.id || '',
            title: workout?.title || '',
            description: workout?.description || '',
            imageUrl: workout?.image || '',
            level: workout?.level || 'beginner',
            days: workout?.duration || 30,
            exercises: workout?.levels?.[0]?.exercises.map(e => ({
              name: e.name,
              sets: e.sets,
              reps: e.reps,
              restBetweenSets: e.rest
            })) || [],
            categoryId: workout?.id || ''
          }}
          workoutId={id as string}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
            <p className="text-gray-600">The challenge you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      )}
    </div>
  );
}
