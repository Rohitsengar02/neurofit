'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserStats } from '../services/userStatsService';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import MainPageRecipeCard from '../components/Diet/MainPageRecipeCard';
import { Meal } from '../services/dietService';
import { FaHeart, FaBookmark, FaComment, FaShare } from 'react-icons/fa';

interface UserStats {
  savedMeals: string[];
  likedMeals: string[];
  comments: Array<{
    mealId: string;
    content: string;
    createdAt: Date;
  }>;
  sharedMeals: Array<{
    mealId: string;
    sharedAt: Date;
    platform: string;
  }>;
}

export default function SavedPage() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<{ meal: Meal; isLiked: boolean; isSaved: boolean }[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedItems([]);
        setLoading(false);
        return;
      }

      try {
        // Get user stats
        const stats = await getUserStats(user.uid);
        setUserStats(stats as UserStats);

        if (!stats?.savedMeals?.length) {
          setSavedItems([]);
          setLoading(false);
          return;
        }

        // Fetch all saved meals
        const savedMealsPromises = stats.savedMeals.map(async (mealId) => {
          // Try recipes collection first
          let mealDoc = await getDoc(doc(db, 'recipes', mealId));
          let type: 'recipe' | 'diet' = 'recipe';

          // If not found in recipes, try diets collection
          if (!mealDoc.exists()) {
            mealDoc = await getDoc(doc(db, 'diets', mealId));
            type = 'diet';
          }

          if (mealDoc.exists()) {
            const data = mealDoc.data();
            
            // Get user data for this meal
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            const userData = userDoc.data();

            // Get the correct image field based on what's available
            const mealImage = data.imageUrl || data.image || '';

            const meal: Meal = {
              id: mealDoc.id,
              type,
              name: data.name || '',
              description: data.description || '',
              nutrition: data.nutrition || {},
              totalCalories: data.totalCalories || 0,
              prepTime: data.prepTime || '',
              servings: data.servings || '',
              ingredients: data.ingredients || [],
              instructions: data.instructions || [],
              image: mealImage,  // Use the correct image field
              userId: data.userId || '',
              userName: userData?.displayName || 'Anonymous',
              userImage: userData?.photoURL || '',  // User profile image
              comments: data.comments || [],
              likes: (data.likes || []).length,
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
              updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
              goals: data.goals || [],
              restrictions: data.restrictions || [],
              mealPlan: data.mealPlan || null
            };

            // Pass the liked and saved status via props instead
            return {
              meal,
              isLiked: stats.likedMeals.includes(mealId),
              isSaved: true
            };
          }
          return null;
        });

        const meals = (await Promise.all(savedMealsPromises)).filter((meal): meal is { meal: Meal; isLiked: boolean; isSaved: boolean } => meal !== null);
        setSavedItems(meals);
      } catch (error) {
        console.error('Error fetching saved items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Please sign in to view your saved items
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Items</h1>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            You haven't saved any items yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map(item => (
            <MainPageRecipeCard 
              key={item.meal.id} 
              recipe={item.meal}
              isLiked={item.isLiked}
              isSaved={item.isSaved}
              onComment={(recipe) => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
