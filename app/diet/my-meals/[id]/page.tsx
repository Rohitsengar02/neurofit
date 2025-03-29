'use client';

import { useEffect, useState, use } from 'react';
import { getMealDetails } from '@/app/services/dietService';
import { Meal } from '@/app/services/dietService';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';
import { FaClock, FaUtensils, FaFire } from 'react-icons/fa';

export default function MealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        // First try as recipe
        let mealData = await getMealDetails(resolvedParams.id, 'recipe');
        if (!mealData) {
          // If not found, try as diet
          mealData = await getMealDetails(resolvedParams.id, 'diet');
        }
        setMeal(mealData);
      } catch (error) {
        console.error('Error fetching meal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Meal not found</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {meal.image && (
          <div className="relative h-64 md:h-96">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center mb-6">
            {meal.userImage ? (
              <img
                src={meal.userImage}
                alt={meal.userName}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="text-gray-500 text-xl">
                  {meal.userName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{meal.name}</h1>
              <p className="text-gray-600">Created by {meal.userName}</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{meal.description}</p>

          {meal.type === 'recipe' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <FaClock className="text-blue-500 mr-2" />
                <span>{meal.prepTime || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FaUtensils className="text-blue-500 mr-2" />
                <span>{meal.servings || 'N/A'} servings</span>
              </div>
              <div className="flex items-center">
                <FaFire className="text-blue-500 mr-2" />
                <span>{meal.nutrition.calories || 0} calories</span>
              </div>
            </div>
          )}

          {meal.type === 'recipe' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
                <ul className="list-disc pl-6">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index} className="mb-2">{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
                <ol className="list-decimal pl-6">
                  {meal.instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Nutrition Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-600">Calories</div>
                    <div className="text-xl font-semibold">{meal.nutrition.calories}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-600">Protein</div>
                    <div className="text-xl font-semibold">{meal.nutrition.protein}g</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-600">Carbs</div>
                    <div className="text-xl font-semibold">{meal.nutrition.carbs}g</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-600">Fat</div>
                    <div className="text-xl font-semibold">{meal.nutrition.fat}g</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {meal.type === 'diet' && meal.mealPlan && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Diet Plan</h2>
                {meal.mealPlan.breakfast && (
                  <div className="mb-4">
                    <h3 className="text-xl font-medium mb-2">Breakfast</h3>
                    <ul className="list-disc pl-6">
                      {meal.mealPlan.breakfast.meals.map((item, index) => (
                        <li key={index} className="mb-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {meal.mealPlan.lunch && (
                  <div className="mb-4">
                    <h3 className="text-xl font-medium mb-2">Lunch</h3>
                    <ul className="list-disc pl-6">
                      {meal.mealPlan.lunch.meals.map((item, index) => (
                        <li key={index} className="mb-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {meal.mealPlan.dinner && (
                  <div className="mb-4">
                    <h3 className="text-xl font-medium mb-2">Dinner</h3>
                    <ul className="list-disc pl-6">
                      {meal.mealPlan.dinner.meals.map((item, index) => (
                        <li key={index} className="mb-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {meal.mealPlan.snacks && (
                  <div className="mb-4">
                    <h3 className="text-xl font-medium mb-2">Snacks</h3>
                    <ul className="list-disc pl-6">
                      {meal.mealPlan.snacks.meals.map((item, index) => (
                        <li key={index} className="mb-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Goals</h2>
                <div className="flex flex-wrap gap-2">
                  {meal.goals.map((goal, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Dietary Restrictions</h2>
                <div className="flex flex-wrap gap-2">
                  {meal.restrictions.map((restriction, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
