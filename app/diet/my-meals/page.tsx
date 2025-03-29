'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserMeals, deleteMeal, type Meal as DBMeal } from '../../services/dietService';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';

// Local interface that enforces stricter types for the UI
interface Meal extends Omit<DBMeal, 'mealPlan'> {
  mealPlan?: {
    breakfast: { meals: string[]; calories: number };
    lunch: { meals: string[]; calories: number };
    dinner: { meals: string[]; calories: number };
    snacks: { meals: string[]; calories: number };
  };
}

const MealCard = ({ meal, onDelete }: { meal: Meal; onDelete: (id: string, type: 'recipe' | 'diet') => void }) => {
  const { user } = useAuth();
  const isOwner = user?.uid === meal.userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 w-full">
        {meal.image ? (
          <img 
            src={meal.image} 
            alt={meal.name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              console.error('Image failed to load:', meal.image);
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="h-full w-full bg-gray-100 flex items-center justify-center">
                    <span class="text-gray-400 text-4xl">
                      ${meal.type === 'recipe' ? '🍳' : '📋'}
                    </span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">
              {meal.type === 'recipe' ? '🍳' : '📋'}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
            {meal.userImage ? (
              <img
                src={meal.userImage}
                alt={meal.userName || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-500 text-xl">
                          ${meal.userName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {meal.userName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{meal.name}</h3>
            <p className="text-gray-600 text-sm">{meal.userName || "Anonymous User"}</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {meal.type}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{meal.description}</p>

        {meal.type === 'recipe' && (
          <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600">
            <div>⏰ {meal.prepTime || 'N/A'}</div>
            <div>🍽️ {meal.servings || 'N/A'}</div>
            <div>🔥 {meal.nutrition.calories || '0'} cal</div>
          </div>
        )}

        {meal.type === 'diet' && meal.mealPlan && (
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              {Object.keys(meal.mealPlan).length} meals planned
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.goals.slice(0, 3).map((goal, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {goal}
                </span>
              ))}
              {meal.goals.length > 3 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  +{meal.goals.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <Link
            href={`/diet/my-meals/${meal.id}`}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            View Details
          </Link>
          {isOwner && (
            <button
              onClick={() => onDelete(meal.id, meal.type)}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function MyMealsPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'recipe' | 'diet'>('all');

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user) return;
      try {
        const userMeals = await getUserMeals(user.uid);
        // Transform the meals to match our local interface
        const transformedMeals = userMeals.map(meal => ({
          ...meal,
          mealPlan: meal.mealPlan ? {
            breakfast: meal.mealPlan.breakfast || { meals: [], calories: 0 },
            lunch: meal.mealPlan.lunch || { meals: [], calories: 0 },
            dinner: meal.mealPlan.dinner || { meals: [], calories: 0 },
            snacks: meal.mealPlan.snacks || { meals: [], calories: 0 }
          } : undefined
        }));
        setMeals(transformedMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
        toast.error('Failed to load meals');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user]);

  const handleDelete = async (id: string, type: 'recipe' | 'diet') => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    
    try {
      await deleteMeal(id, type);
      setMeals(meals.filter(meal => meal.id !== id));
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const filteredMeals = selectedType === 'all' 
    ? meals 
    : meals.filter(meal => meal.type === selectedType);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Meals</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('recipe')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'recipe' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setSelectedType('diet')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'diet' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Diet Plans
          </button>
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No meals found</p>
          <Link
            href="/diet/add"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Meal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
