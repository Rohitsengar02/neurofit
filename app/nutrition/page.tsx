'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaSearch, FaAppleAlt, FaCarrot, FaBreadSlice, FaDrumstickBite, FaFish, FaEgg, FaGlassMartini, FaPizzaSlice, FaList, FaCamera } from 'react-icons/fa';
import { GiMilkCarton, GiFruitBowl, GiChocolateBar } from 'react-icons/gi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, doc, getDoc, Timestamp, setDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// Dynamically import the FoodScanner component with no SSR
const FoodScanner = dynamic(() => import('@/components/FoodScanner'), {
  ssr: false,
});

interface NutritionInfo {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

interface FoodItem {
  name: string;
  description: string;
  icon?: any;
  color?: string;
}

interface DailyMeal {
  foodName: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  addedAt: any;
}

interface DailyMeals {
  date: string;
  meals: Record<string, DailyMeal>;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const defaultFoods = [
  { name: 'Apple', icon: FaAppleAlt, color: 'from-red-400 to-red-600' },
  { name: 'Banana', icon: GiFruitBowl, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Chicken Breast', icon: FaDrumstickBite, color: 'from-orange-400 to-orange-600' },
  { name: 'Milk', icon: GiMilkCarton, color: 'from-blue-400 to-blue-600' },
  { name: 'Bread', icon: FaBreadSlice, color: 'from-yellow-600 to-yellow-800' },
  { name: 'Carrot', icon: FaCarrot, color: 'from-orange-500 to-orange-700' },
  { name: 'Salmon', icon: FaFish, color: 'from-pink-400 to-pink-600' },
  { name: 'Egg', icon: FaEgg, color: 'from-yellow-200 to-yellow-400' },
  { name: 'Pizza', icon: FaPizzaSlice, color: 'from-red-500 to-red-700' },
  { name: 'Chocolate', icon: GiChocolateBar, color: 'from-brown-400 to-brown-600' },
  { name: 'Water', icon: FaGlassMartini, color: 'from-blue-300 to-blue-500' }
];

const getIconForFood = (foodName: string) => {
  const defaultFood = defaultFoods.find(food => 
    foodName.toLowerCase().includes(food.name.toLowerCase())
  );
  return {
    icon: defaultFood?.icon || FaCarrot,
    color: defaultFood?.color || 'from-blue-500 to-purple-500'
  };
};

export default function NutritionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showMealsSummary, setShowMealsSummary] = useState(false);
  const [todaysMeals, setTodaysMeals] = useState<DailyMeals | null>(null);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchFood(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const fetchTodaysMeals = async () => {
    if (!user) return;

    setLoadingMeals(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealsRef = doc(db, `users/${user.uid}/nutrition`, today);
      const mealsDoc = await getDoc(mealsRef);

      if (mealsDoc.exists()) {
        setTodaysMeals(mealsDoc.data() as DailyMeals);
      } else {
        setTodaysMeals({ date: today, meals: {} });
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
    } finally {
      setLoadingMeals(false);
    }
  };

  const searchFood = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setErrorMessage('');
      return;
    }

    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Generate food suggestions based on the search query "${query}". Include:
      1. The exact food item
      2. Related foods or dishes made with this ingredient
      3. Popular variations

      Return 8-10 items total. For each food item, provide:
      1. The exact food name
      2. A very brief one-line description that highlights key nutritional benefits or ingredients
      Format as JSON array with 'name' and 'description' fields only.
      Example: [{"name": "Banana", "description": "Fresh fruit rich in potassium and fiber"}]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text and parse JSON
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const suggestions = JSON.parse(cleanJson);
      
      const foodResults = suggestions.map((item: any) => ({
        ...item,
        ...getIconForFood(item.name)
      }));

      setSearchResults(foodResults);
      setErrorMessage('');
    } catch (error) {
      console.error('Error searching food:', error);
      setErrorMessage('Failed to search for food items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    try {
      localStorage.setItem('selectedFood', JSON.stringify(food));
      router.push(`/nutrition/food-info`);
    } catch (error) {
      console.error('Error storing food data:', error);
      setErrorMessage('Error selecting food item. Please try again.');
    }
  };

  const handleScannedFood = (food: any) => {
    try {
      const foodItem = {
        name: food.name,
        description: food.description || `Nutritional information for ${food.name}`,
        ...getIconForFood(food.name)
      };
      handleFoodSelect(foodItem);
    } catch (error) {
      console.error('Error processing scanned food:', error);
      setErrorMessage('Error processing the scanned food. Please try again.');
    }
  };

  const handleDeleteMeal = async (timestamp: string) => {
    if (!user) return;
    
    setIsDeleting(timestamp);
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealsRef = doc(db, `users/${user.uid}/nutrition`, today);
      
      // Get current meals
      const mealsDoc = await getDoc(mealsRef);
      if (!mealsDoc.exists()) return;
      
      const currentData = mealsDoc.data() as DailyMeals;
      const updatedMeals = { ...currentData.meals };
      delete updatedMeals[timestamp];
      
      // Update document with meal removed
      await setDoc(mealsRef, {
        date: today,
        meals: updatedMeals
      });

      // Refresh the meals list
      await fetchTodaysMeals();

    } catch (err) {
      console.error('Error deleting meal:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any food..."
              className="w-full px-6 py-4 text-lg rounded-2xl shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pl-14"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 whitespace-nowrap"
          >
            <FaCamera className="mr-2" />
            <span className="hidden sm:inline">Scan Food</span>
          </button>
        </div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-8"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : searchResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {searchResults.map((food, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleFoodSelect(food)}
                  className={`bg-white p-6 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300 border border-gray-100`}
                >
                  <div className={`flex items-center space-x-4`}>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${food.color || 'from-blue-500 to-purple-500'}`}>
                      {React.createElement(food.icon || FaCarrot, { className: "text-white text-xl" })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{food.name}</h3>
                      <p className="text-gray-600 text-sm">{food.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : !isLoading && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-600"
            >
              No results found for &quot;{searchQuery}&quot;
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && (
          <div className="text-center mt-4">
            <p className="text-red-500">Error: {errorMessage.replace(/"/g, '&quot;')}</p>
          </div>
        )}

        {!searchQuery && (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Foods</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {defaultFoods.map((food, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleFoodSelect({ name: food.name, description: `Common ${food.name.toLowerCase()}` })}
                    className={`bg-white p-6 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300 border border-gray-100`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${food.color}`}>
                        {React.createElement(food.icon, { className: "text-white text-xl" })}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800">{food.name}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <div className="flex items-center justify-center mt-4">
              <p className="text-gray-600">No food items found. Try searching for &quot;banana&quot; or &quot;chicken&quot;</p>
            </div>
          </div>
        )}
        
        {/* Food Scanner Modal */}
        {/* Meals Summary Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMealsSummary(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg z-30"
        >
          <FaList className="w-6 h-6" />
        </motion.button>
      </div>
      
      {/* Food Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <FoodScanner 
            onClose={() => setShowScanner(false)}
            onFoodSelect={handleScannedFood}
          />
        )}
      </AnimatePresence>
      
      {/* Meals Summary Modal */}
      <AnimatePresence>
        {showMealsSummary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowMealsSummary(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[80vh] overflow-y-auto z-50"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Today's Meals
                  </h3>
                  <button
                    onClick={() => setShowMealsSummary(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {loadingMeals ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : todaysMeals && Object.keys(todaysMeals.meals).length > 0 ? (
                  <div className="space-y-4">
                    {/* Daily Summary */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Daily Summary
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(todaysMeals.meals).reduce((sum, meal) => sum + meal.calories, 0).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(todaysMeals.meals).reduce((sum, meal) => sum + meal.protein, 0).toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(todaysMeals.meals).reduce((sum, meal) => sum + meal.carbs, 0).toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Fats</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(todaysMeals.meals).reduce((sum, meal) => sum + meal.fats, 0).toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meals List */}
                    <div className="space-y-3">
                      {Object.entries(todaysMeals.meals)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([timestamp, meal]) => (
                          <div
                            key={timestamp}
                            className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {meal.foodName}
                                </h5>
                                <p className="text-sm text-purple-500 dark:text-purple-300 capitalize">
                                  {meal.mealType}
                                </p>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="text-right">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {meal.calories.toFixed(0)} cal
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(Number(timestamp)).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteMeal(timestamp)}
                                  disabled={isDeleting === timestamp}
                                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  {isDeleting === timestamp ? (
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Protein: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.protein.toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Carbs: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.carbs.toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Fats: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.fats.toFixed(1)}g
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No meals added today
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
