import { db } from '@/app/firebase/config';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { DietPlan } from '../data/predefinedDiets';
import { auth } from '@/app/firebase/config';

const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to perform this action');
  }
  return user.uid;
};

export const saveDietPlan = async (dietPlan: DietPlan): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userDietsRef = collection(db, 'user-diets');
    const dietDoc = doc(userDietsRef, `${userId}_${dietPlan.id}`);
    
    await setDoc(dietDoc, {
      ...dietPlan,
      userId,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving diet plan:', error);
    throw new Error('Failed to save diet plan');
  }
};

export const getUserDietPlans = async (): Promise<DietPlan[]> => {
  try {
    const userId = getCurrentUserId();
    const userDietsRef = collection(db, 'user-diets');
    const q = query(userDietsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as DietPlan);
  } catch (error) {
    console.error('Error getting user diet plans:', error);
    throw new Error('Failed to get user diet plans');
  }
};

export const deleteDietPlan = async (dietId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const dietDocRef = doc(db, 'user-diets', `${userId}_${dietId}`);
    await deleteDoc(dietDocRef);
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    throw new Error('Failed to delete diet plan');
  }
};
