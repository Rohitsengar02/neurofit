import { db } from '../config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { ActiveWorkout } from '@/app/types/workout';

// Add a new active workout
export const addActiveWorkout = async (userId: string, workout: ActiveWorkout) => {
  try {
    // Convert dates to timestamps
    const workoutData = {
      ...workout,
      startDate: Timestamp.fromDate(workout.startDate),
      endDate: Timestamp.fromDate(workout.endDate),
      completedDays: workout.completedDays.map(date => Timestamp.fromDate(date)),
      createdAt: Timestamp.now()
    };

    // Validate required fields
    const requiredFields = ['workoutId', 'categoryId', 'categoryName', 'title', 'imageUrl', 'level', 'totalDays', 'caloriesPerDay'];
    const missingFields = requiredFields.filter(field => !workoutData[field as keyof typeof workoutData]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const activeWorkoutsRef = collection(db, 'users', userId, 'activeWorkouts');
    const docRef = await addDoc(activeWorkoutsRef, workoutData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding active workout:', error);
    return { success: false, error };
  }
};

// Get all active workouts for a user
export const getUserActiveWorkouts = async (userId: string) => {
  try {
    const activeWorkoutsRef = collection(db, 'users', userId, 'activeWorkouts');
    const querySnapshot = await getDocs(activeWorkoutsRef);
    
    const activeWorkouts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
      } as ActiveWorkout;
    });

    return { success: true, data: activeWorkouts };
  } catch (error) {
    console.error('Error getting active workouts:', error);
    return { success: false, error };
  }
};

// Get active workouts by category
export const getActiveWorkoutsByCategory = async (userId: string, categoryId: string) => {
  try {
    const activeWorkoutsRef = collection(db, 'users', userId, 'activeWorkouts');
    const q = query(activeWorkoutsRef, where('categoryId', '==', categoryId));
    const querySnapshot = await getDocs(q);
    
    const activeWorkouts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
      } as ActiveWorkout;
    });

    return { success: true, data: activeWorkouts };
  } catch (error) {
    console.error('Error getting active workouts by category:', error);
    return { success: false, error };
  }
};

// Update workout progress (completed days)
export const updateWorkoutProgress = async (userId: string, workoutId: string, completedDays: number[]) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'activeWorkouts', workoutId);
    await updateDoc(workoutRef, { completedDays: completedDays.map(date => Timestamp.fromDate(new Date(date))) });
    return { success: true };
  } catch (error) {
    console.error('Error updating workout progress:', error);
    return { success: false, error };
  }
};

// Update workout status
export const updateWorkoutStatus = async (userId: string, workoutId: string, status: ActiveWorkout['status']) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'activeWorkouts', workoutId);
    await updateDoc(workoutRef, { status });
    return { success: true };
  } catch (error) {
    console.error('Error updating workout status:', error);
    return { success: false, error };
  }
};
