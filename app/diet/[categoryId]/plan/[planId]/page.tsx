'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import RecipeCard from '@/app/components/Diet/RecipeCard';
import RecipeModal from '@/app/components/Diet/RecipeModal';
import { FaArrowLeft, FaClock, FaFire, FaUsers, FaCalendar } from 'react-icons/fa';

interface DietPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  targetGroup: string[];
  calories: {
    min: number;
    max: number;
  };
  schedule: {
    mealsPerDay: number;
    timings: string[];
  };
  restrictions: string[];
  benefits: string[];
  image: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  type: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
  instructions: {
    step: number;
    description: string;
    image?: string;
  }[];
  images: string[];
  tips: string[];
  tags: string[];
}

const DietPlanPage = () => {
  const params = useParams();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState('all');

  useEffect(() => {
    const fetchPlanAndRecipes = async () => {
      try {
        if (params.categoryId && params.planId) {
          // Fetch plan details
          const planDoc = await getDoc(
            doc(db, `dietCategories/${params.categoryId}/diets/${params.planId}`)
          );
          if (planDoc.exists()) {
            setPlan({ id: planDoc.id, ...planDoc.data() } as DietPlan);
          }

          // Fetch recipes
          const recipesQuery = query(
            collection(db, `dietCategories/${params.categoryId}/diets/${params.planId}/recipes`),
            where('isActive', '==', true)
          );
          const recipesSnapshot = await getDocs(recipesQuery);
          const recipesData = recipesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Recipe[];
          setRecipes(recipesData);
        }
      } catch (error) {
        console.error('Error fetching plan and recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAndRecipes();
  }, [params.categoryId, params.planId]);

  const filteredRecipes = recipes.filter(recipe => 
    selectedMealType === 'all' || recipe.type === selectedMealType
  );

  if (loading || !plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src={plan.image}
          alt={plan.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 
                              dark:group-hover:text-blue-400 transition-colors" />
        </motion.button>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex flex-wrap gap-4 mb-6">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${plan.difficulty === 'beginner' ? 'bg-green-500 text-white' : ''}
                  ${plan.difficulty === 'intermediate' ? 'bg-yellow-500 text-white' : ''}
                  ${plan.difficulty === 'advanced' ? 'bg-red-500 text-white' : ''}
                `}>
                  {plan.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                  {plan.calories.min}-{plan.calories.max} calories
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {plan.name}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mb-8">
                {plan.description}
              </p>
              <div className="flex flex-wrap gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <FaClock className="w-5 h-5" />
                  <span>{plan.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" />
                  <span>{plan.schedule.mealsPerDay} meals per day</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="w-5 h-5" />
                  <span>{plan.targetGroup.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Benefits
            </h2>
            <ul className="space-y-4">
              {plan.benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Restrictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Restrictions
            </h2>
            <ul className="space-y-4">
              {plan.restrictions.map((restriction, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <span className="text-gray-700 dark:text-gray-300">{restriction}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Meal Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Daily Meal Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.schedule.timings.map((timing, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center 
                             justify-center mx-auto mb-4">
                  <FaClock className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{timing}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recipes Section */}
        <div className="py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meal Recipes
            </h2>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 
                       bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 
                       focus:ring-blue-500 transition-all"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snacks</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RecipeCard
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              </motion.div>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-2xl text-gray-600 dark:text-gray-400">
                No recipes found for the selected meal type
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default DietPlanPage;
