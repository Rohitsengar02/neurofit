import { db } from '../firebase/config';
import { collection, doc, getDocs, getDoc, query, where, orderBy, addDoc, deleteDoc, updateDoc, Timestamp, serverTimestamp, CollectionReference } from 'firebase/firestore';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}

interface MealRecommendation {
  breakfast: {
    meals: string[];
    calories: number;
  };
  lunch: {
    meals: string[];
    calories: number;
  };
  dinner: {
    meals: string[];
    calories: number;
  };
  snacks?: {
    meals: string[];
    calories: number;
  };
}

export interface MealData {
  name: string;
  description: string;
  image?: string; // Cloudinary URL
  userId: string;
  userName: string;
  userImage: string;
  type: 'recipe' | 'diet';
  mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prepTime?: string;
  servings?: string;
  ingredients?: string[];
  instructions?: string[];
  nutrition: NutritionInfo;
  duration?: string;
  totalCalories?: number;
  goals?: string[];
  restrictions?: string[];
  mealPlan?: MealRecommendation | null; // Allow null for recipes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  createdAt: Date;
  likes: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  image?: string;
  type: 'recipe' | 'diet';
  nutrition: NutritionInfo;
  totalCalories: number;
  userId: string;
  userName: string;
  userImage: string;
  prepTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  goals: string[];
  restrictions: string[];
  mealPlan: MealRecommendation | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  likes?: number;
  comments?: Comment[];
}

// Add a new meal (recipe or diet)
export const addMeal = async (type: 'recipe' | 'diet', data: MealData) => {
  try {
    const collectionName = type === 'recipe' ? 'recipes' : 'diets';
    const docRef = await addDoc(collection(db, collectionName), {
      type: type,
      name: data.name,
      description: data.description,
      imageUrl: data.image,
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage,
      nutrition: data.nutrition,
      duration: data.duration,
      totalCalories: data.totalCalories,
      goals: data.goals,
      restrictions: data.restrictions,
      mealPlan: data.mealPlan,
      prepTime: data.prepTime,
      servings: data.servings,
      ingredients: data.ingredients,
      instructions: data.instructions,
      mealTime: data.mealTime,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

// Update a meal
export const updateMeal = async (type: 'recipe' | 'diet', mealId: string, data: Partial<MealData>) => {
  try {
    const collectionName = type === 'recipe' ? 'recipes' : 'diets';
    const mealRef = doc(db, collectionName, mealId);
    await updateDoc(mealRef, {
      name: data.name,
      description: data.description,
      imageUrl: data.image,
      nutrition: data.nutrition,
      mealTime: data.mealTime,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

// Delete a meal (recipe or diet)
export const deleteMeal = async (id: string, type: 'recipe' | 'diet') => {
  try {
    const collection = type === 'recipe' ? 'recipes' : 'diets';
    const mealRef = doc(db, collection, id);
    await deleteDoc(mealRef);
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

// Get all meals
export const getMeals = async (type?: 'recipe' | 'diet') => {
  try {
    const mealsCollection = collection(db, 'meals');
    
    if (type) {
      const q = query(mealsCollection, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    const querySnapshot = await getDocs(mealsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

// Get meal details
export const getMealDetails = async (mealId: string, type: 'recipe' | 'diet'): Promise<Meal | null> => {
  try {
    const collection = type === 'recipe' ? 'recipes' : 'diets';
    const mealRef = doc(db, collection, mealId);
    const mealDoc = await getDoc(mealRef);

    if (!mealDoc.exists()) {
      return null;
    }

    const data = mealDoc.data();
    
    // Get user info
    const userRef = doc(db, 'users', data.userId || '');
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};

    const meal: Meal = {
      id: mealDoc.id,
      name: data.name || '',
      description: data.description || '',
      type: type,
      nutrition: data.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0
      },
      totalCalories: data.totalCalories || 0,
      userId: data.userId || '',
      image: data.imageUrl || null,
      userImage: userData.photoURL || null,
      userName: userData.displayName || "Anonymous User",
      prepTime: data.prepTime || '',
      servings: data.servings || '',
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      goals: data.goals || [],
      restrictions: data.restrictions || [],
      mealPlan: data.mealPlan || null,
      createdAt: data.createdAt?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
      likes: data.likes || 0
    };

    return meal;
  } catch (error) {
    console.error('Error getting meal details:', error);
    throw error;
  }
};

// Get user meals
export const getUserMeals = async (userId: string): Promise<Meal[]> => {
  try {
    // Get recipes
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const recipesSnapshot = await getDocs(recipesQuery);
    const recipes = recipesSnapshot.docs.map(async (docSnapshot): Promise<Meal> => {
      const data = docSnapshot.data();
      
      // Get user info
      const userRef = doc(db, 'users', data.userId || '');
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      const meal: Meal = {
        id: docSnapshot.id,
        name: data.name || '',
        description: data.description || '',
        type: 'recipe',
        nutrition: data.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          cholesterol: 0
        },
        totalCalories: data.totalCalories || 0,
        userId: data.userId || '',
        image: data.imageUrl || null,
        userImage: userData.photoURL || null,
        userName: userData.displayName || "Anonymous User",
        prepTime: data.prepTime || '',
        servings: data.servings || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        goals: data.goals || [],
        restrictions: data.restrictions || [],
        mealPlan: null,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
        likes: data.likes || 0
      };

      return meal;
    });

    // Get diets
    const dietsQuery = query(
      collection(db, 'diets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const dietsSnapshot = await getDocs(dietsQuery);
    const diets = dietsSnapshot.docs.map(async (docSnapshot): Promise<Meal> => {
      const data = docSnapshot.data();
      
      // Get user info
      const userRef = doc(db, 'users', data.userId || '');
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      const meal: Meal = {
        id: docSnapshot.id,
        name: data.name || '',
        description: data.description || '',
        type: 'diet',
        nutrition: data.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          cholesterol: 0
        },
        totalCalories: data.totalCalories || 0,
        userId: data.userId || '',
        image: data.imageUrl || null,
        userImage: userData.photoURL || null,
        userName: userData.displayName || "Anonymous User",
        prepTime: '',
        servings: '',
        ingredients: [],
        instructions: [],
        goals: data.goals || [],
        restrictions: data.restrictions || [],
        mealPlan: data.mealPlan || null,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
        likes: data.likes || 0
      };

      return meal;
    });

    // Wait for all promises to resolve
    const resolvedRecipes = await Promise.all(recipes);
    const resolvedDiets = await Promise.all(diets);

    // Combine and sort by createdAt
    return [...resolvedRecipes, ...resolvedDiets].sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0;
      const dateB = b.createdAt?.getTime() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting user meals:', error);
    throw error;
  }
};
