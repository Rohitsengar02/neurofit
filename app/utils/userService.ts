import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserData {
  personalInfo: {
    name: string;
    age: number;
    gender: string;
  };
  fitnessGoals: string[];
  weightGoals: {
    currentWeight: number;
    targetWeight: number;
  };
  experienceLevel: string;
  workoutPreferences: {
    daysPerWeek: number;
    timePerWorkout: number;
    preferredTime: string;
  };
  trainingHistory: {
    previousExperience: string[];
    trainingDuration: string;
    consistency: string;
  };
}

export const saveUserData = async (userData: UserData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await setDoc(doc(db, 'users', user.uid), {
      userData,
      updatedAt: new Date().toISOString(),
      userId: user.uid,
      email: user.email
    });

    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().userData as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};
