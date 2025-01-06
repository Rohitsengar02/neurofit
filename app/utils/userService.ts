import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
}

export async function saveUserData(userData: UserData) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Create a reference to the user's document in the users collection
    const userRef = doc(db, 'users', user.uid);
    
    // Create a new document in the userData subcollection
    const userDataRef = doc(db, `users/${user.uid}/userData`, 'profile');
    
    // Save basic user info in users collection
    await setDoc(userRef, {
      email: user.email,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    // Save detailed user data in userData subcollection
    await setDoc(userDataRef, {
      ...userData,
      lastUpdated: new Date().toISOString(),
    });

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
