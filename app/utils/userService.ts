import { db, auth } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ChallengeWorkout } from '../types/workout';

export interface UserData {
  personalInfo: {
    name: string;
    age: number;
    gender: string;
    bodyType: string;
    bodyFat: number;
  };
  fitnessGoals: string[];
  weightGoals: {
    currentWeight: number;
    targetWeight: number;
  };
  experienceLevel: string;
  weightliftingExperience: string;
  workoutPreferences: {
    daysPerWeek: number;
    timePerWorkout: number;
    preferredTime: string;
    location: string;
    frequency: string;
    duration: string;
  };
  weeklySchedule: string[];
  dailyRoutine: {
    wakeUpTime: string;
    sleepTime: string;
    mealtimes: string[];
    workHours: number;
  };
  exercisePreferences: {
    preferredExercises: string[];
    avoidExercises: string[];
  };
  healthConditions: {
    conditions: string[];
    medications: string[];
    injuries: string[];
  };
  measurements: {
    height: number;
    weight: number;
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    legs: number;
  };
  stressLevel: {
    level: string;
    stressors: string[];
  };
  trainingHistory: {
    previousExperience: string[];
    trainingDuration: string;
    consistency: string;
  };
  currentStep: number; // Track onboarding progress
  workouts?: Array<{
    date: string;
    type: string;
    duration: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight?: number;
    }>;
  }>;
}

export const createInitialWorkoutData = async (userId: string) => {
  // Create challenges collection
  const challengesRef = doc(db, `users/${userId}/challenges`, 'active');
  await setDoc(challengesRef, {
    challenges: [],
    cardioPrograms: [],
    strengthPrograms: []
  });
};

export async function saveUserData(userData: UserData) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      uid: user.uid,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    const userDataRef = doc(db, `users/${user.uid}/userData`, 'profile');
    await setDoc(userDataRef, {
      ...userData,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    // Initialize challenges if they don't exist
    const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
    const challengesDoc = await getDoc(challengesRef);
    if (!challengesDoc.exists()) {
      await createInitialWorkoutData(user.uid);
    }

    console.log('User data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const userDataRef = doc(db, `users/${user.uid}/userData`, 'profile');
    const docSnap = await getDoc(userDataRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }

    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

export const commitToChallenge = async (challenge: ChallengeWorkout) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
    const currentDate = new Date();

    const challengesDoc = await getDoc(challengesRef);
    
    if (!challengesDoc.exists()) {
      await setDoc(challengesRef, {
        challenges: [],
        cardioPrograms: [],
        strengthPrograms: []
      });
    }

    const newChallengeData = {
      id: challenge.id,
      title: challenge.title,
      type: 'challenge' as const,
      startDate: currentDate,
      isActive: true,
      completedDays: [],
      lastUpdated: currentDate,
      duration: challenge.duration,
      image: challenge.image,
      intensity: challenge.intensity,
      focus: challenge.focus,
      calories: challenge.calories
    };

    // Get fresh data after potential initialization
    const freshDataDoc = await getDoc(challengesRef);
    const existingData = freshDataDoc.data() || {};

    // Determine which array to update based on the challenge ID
    let targetArray = 'challenges';
    if (challenge.id.startsWith('cardio-challenge')) {
      targetArray = 'cardioPrograms';
    } else if (challenge.id.startsWith('strength-challenge')) {
      targetArray = 'strengthPrograms';
    }

    // Check if challenge already exists in the target array
    const challengeExists = existingData[targetArray]?.find((c: { id: string }) => c.id === challenge.id);
    
    if (!challengeExists) {
      // Update with new data
      await updateDoc(challengesRef, {
        [targetArray]: [...(existingData[targetArray] || []), newChallengeData]
      });
    }

    return true;
  } catch (error) {
    console.error('Error committing to challenge:', error);
    return false;
  }
};

export const toggleChallengeActive = async (challengeId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const challengesRef = doc(db, `users/${user.uid}/challenges`, 'active');
    const currentDate = new Date();
    const challengesDoc = await getDoc(challengesRef);

    if (challengesDoc.exists()) {
      const existingData = challengesDoc.data();

      // Determine which array to update based on the challenge ID
      let targetArray = 'challenges';
      if (challengeId.startsWith('cardio-challenge')) {
        targetArray = 'cardioPrograms';
      } else if (challengeId.startsWith('strength-challenge')) {
        targetArray = 'strengthPrograms';
      }

      // Update the specific array
      const updatedChallenges = existingData[targetArray]?.map((c: any) => {
        if (c.id === challengeId) {
          return { 
            ...c, 
            isActive: !c.isActive,
            lastUpdated: currentDate,
            deactivatedAt: !c.isActive ? null : currentDate
          };
        }
        return c;
      }) || [];

      // Update the document
      await updateDoc(challengesRef, {
        [targetArray]: updatedChallenges
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error toggling challenge status:', error);
    return false;
  }
};

// Get user profile by ID
export const getUserProfileById = async (userId: string): Promise<{displayName: string, photoURL: string} | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || 'Anonymous User',
        photoURL: userData.photoURL || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
