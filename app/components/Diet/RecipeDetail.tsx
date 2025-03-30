'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { FaUser, FaClock, FaUtensils, FaCheckCircle, FaBan, FaCalendar } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';
import { Meal } from '@/app/services/dietService';

const DEFAULT_AVATAR = '/images/default-avatar.jpg';
const DEFAULT_RECIPE_IMAGE = '/images/default-recipe.jpg';

export default function RecipeDetail({ id }: { id: string }) {
  const [item, setItem] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Try to fetch from recipes first
        let docRef = doc(db, 'recipes', id);
        let docSnap = await getDoc(docRef);
        let type: 'recipe' | 'diet' = 'recipe';

        if (!docSnap.exists()) {
          // If not found in recipes, try diets
          docRef = doc(db, 'diets', id);
          docSnap = await getDoc(docRef);
          type = 'diet';
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          const meal: Meal = {
            id: docSnap.id,
            name: data.name || 'Untitled',
            description: data.description || '',
            image: data.imageUrl || DEFAULT_RECIPE_IMAGE,
            userImage: data.userImage || DEFAULT_AVATAR,
            type: type,
            nutrition: data.nutrition || {},
            totalCalories: data.totalCalories || 0,
            userId: data.userId || '',
            userName: data.userName || 'Anonymous',
            prepTime: data.prepTime || '30',
            servings: data.servings || '4',
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            goals: data.goals || [],
            restrictions: data.restrictions || [],
            mealPlan: data.mealPlan || null,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
            updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null,
            likes: data.likes || 0,
            comments: data.comments || []
          };
          setItem(meal);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">Item not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.name}</h1>
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <span>{item.prepTime} min</span>
          </div>
          <div className="flex items-center">
            <FaUtensils className="mr-2" />
            <span>{item.servings} servings</span>
          </div>
          {item.totalCalories > 0 && (
            <div className="flex items-center">
              <span className="font-semibold">{item.totalCalories} calories</span>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Image */}
      <div className="mb-8 relative h-[400px] w-full rounded-lg overflow-hidden">
        <Image
          src={item.image || DEFAULT_RECIPE_IMAGE}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Description */}
      {item.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
        </div>
      )}

      {/* Goals and Restrictions for Diet Plans */}
      {item.type === 'diet' && (
        <>
          {item.goals && item.goals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Goals</h2>
              <div className="flex flex-wrap gap-2">
                {item.goals.map((goal: string, index: number) => (
                  <div key={index} className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-full">
                    <FaCheckCircle className="mr-2" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.restrictions && item.restrictions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Restrictions</h2>
              <div className="flex flex-wrap gap-2">
                {item.restrictions.map((restriction: string, index: number) => (
                  <div key={index} className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-3 py-1 rounded-full">
                    <FaBan className="mr-2" />
                    <span>{restriction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Plan */}
          {item.mealPlan && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Daily Meal Plan</h2>
              <div className="grid gap-6">
                {Object.entries(item.mealPlan).filter(([key]) => key !== 'snacks').map(([mealTime, plan]) => (
                  <div key={mealTime} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">
                        {mealTime}
                      </h3>
                      
                    </div>
                    <ul className="list-disc pl-5 space-y-3">
                      {plan.meals.map((meal: string, index: number) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          <div className="flex justify-between items-center">
                            <span>{meal}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Snacks Section */}
                {item.mealPlan.snacks && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Snacks
                      </h3>
                     
                    </div>
                    <ul className="list-disc pl-5 space-y-3">
                      {item.mealPlan.snacks.meals.map((snack: string, index: number) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {snack}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

               
              </div>
            </div>
          )}
        </>
      )}

      {/* Ingredients for Recipes */}
      {item.type === 'recipe' && item.ingredients && item.ingredients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-2">
            {item.ingredients.map((ingredient: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions for Recipes */}
      {item.type === 'recipe' && item.instructions && item.instructions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-4">
            {item.instructions.map((instruction: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Nutrition Information - Only for Recipes */}
      {item.type === 'recipe' && item.nutrition && Object.keys(item.nutrition).length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Nutrition Facts</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(item.nutrition).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    <span className="text-sm ml-1">g</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
