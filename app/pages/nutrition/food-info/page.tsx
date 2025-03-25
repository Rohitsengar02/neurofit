'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaUtensils, FaWeight, FaFire, FaClock, FaList } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

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
  id: string;
  name: string;
  nutrition?: NutritionInfo;
}

interface MacroCircleProps {
  protein: number;
  carbs: number;
  fat: number;
}

const MacroCircle: React.FC<MacroCircleProps> = ({ protein, carbs, fat }) => {
  const total = protein + carbs + fat;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const proteinPercentage = (protein / total) * 100;
  const carbsPercentage = (carbs / total) * 100;
  const fatPercentage = (fat / total) * 100;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 200 200" className="transform -rotate-90">
        {/* Protein (Green) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#10B981"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (proteinPercentage / 100) * circumference}
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
        {/* Carbs (Blue) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#3B82F6"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (carbsPercentage / 100) * circumference}
          fill="none"
          className="transition-all duration-1000 ease-out"
          transform={`rotate(${(proteinPercentage * 360) / 100} 100 100)`}
        />
        {/* Fat (Red) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#EF4444"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (fatPercentage / 100) * circumference}
          fill="none"
          className="transition-all duration-1000 ease-out"
          transform={`rotate(${((proteinPercentage + carbsPercentage) * 360) / 100} 100 100)`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{Math.round(total)}g</p>
        </div>
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(proteinPercentage)}% Protein</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(carbsPercentage)}% Carbs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(fatPercentage)}% Fat</span>
        </div>
      </div>
    </div>
  );
};

const NutrientCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, value, unit, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {Math.round(value * 10) / 10} {unit}
        </p>
      </div>
    </div>
  </div>
);

interface DailyMeal {
  foodName: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  addedAt: Timestamp;
}

interface DailyMeals {
  date: string;
  meals: Record<string, DailyMeal>;
}

const FoodInfoPage: React.FC = () => {
  const router = useRouter();
  const [foodData, setFoodData] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [mealType, setMealType] = useState<string>('');
  const [mealTime, setMealTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMealsSummary, setShowMealsSummary] = useState(false);
  const [todaysMeals, setTodaysMeals] = useState<DailyMeals | null>(null);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFood = localStorage.getItem('selectedFood');
      if (storedFood) {
        setFoodData(JSON.parse(storedFood));
      }
    }
  }, []);

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

  if (!foodData?.nutrition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const nutrition = foodData.nutrition;
  const getMultiplier = () => {
    switch (unit) {
      case 'oz':
        return (amount * 28.3495) / nutrition.serving_size_g;
      case 'cups':
        return (amount * 236.588) / nutrition.serving_size_g;
      case 'tbsp':
        return (amount * 14.7868) / nutrition.serving_size_g;
      case 'tsp':
        return (amount * 4.92892) / nutrition.serving_size_g;
      default:
        return amount / nutrition.serving_size_g;
    }
  };

  const multiplier = getMultiplier();

  const handleAddToMealPlan = async () => {
    if (!user) {
      setError('Please login to add meals to your plan');
      return;
    }

    if (!mealType) {
      setError('Please select a meal type');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Create a new meal entry
      const mealData = {
        foodName: foodData.name,
        mealType: mealType,
        calories: nutrition.calories * multiplier,
        protein: nutrition.protein_g * multiplier,
        carbs: nutrition.carbohydrates_total_g * multiplier,
        fats: nutrition.fat_total_g * multiplier,
        servingSize: nutrition.serving_size_g,
        addedAt: Timestamp.now(),
        date: dateString
      };

      // Reference to the user's nutrition collection for the specific date
      const userNutritionRef = doc(
        collection(db, `users/${user.uid}/nutrition`),
        dateString
      );

      // Add the meal to the date document
      await setDoc(userNutritionRef, {
        date: dateString,
        meals: {
          [Timestamp.now().toMillis()]: mealData // Use timestamp as unique ID for each meal
        }
      }, { merge: true }); // Use merge to keep existing meals

      setSuccess('Meal added to your plan successfully!');
      
      // Clear the meal type selection
      setMealType('');

      // Show success for 2 seconds then redirect
      setTimeout(() => {
        router.push('/nutrition');
      }, 2000);

    } catch (err) {
      console.error('Error adding meal:', err);
      setError('Failed to add meal to your plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <button
              onClick={() => router.back()}
              className="mb-4 px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Search
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{foodData.name}</h1>
            <p className="text-white/80">Nutritional Information per {nutrition.serving_size_g}g serving</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Amount and Unit Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300">Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300">Unit:</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent"
                >
                  <option value="g">Grams (g)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="cups">Cups</option>
                  <option value="tbsp">Tablespoons</option>
                  <option value="tsp">Teaspoons</option>
                </select>
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Macro Distribution</h2>
              <MacroCircle
                protein={nutrition.protein_g * multiplier}
                carbs={nutrition.carbohydrates_total_g * multiplier}
                fat={nutrition.fat_total_g * multiplier}
              />
            </div>

            {/* Key Nutrients */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NutrientCard
                title="Calories"
                value={nutrition.calories * multiplier}
                unit="kcal"
                icon={FaFire}
              />
              <NutrientCard
                title="Protein"
                value={nutrition.protein_g * multiplier}
                unit="g"
                icon={FaUtensils}
              />
              <NutrientCard
                title="Carbs"
                value={nutrition.carbohydrates_total_g * multiplier}
                unit="g"
                icon={FaWeight}
              />
              <NutrientCard
                title="Fat"
                value={nutrition.fat_total_g * multiplier}
                unit="g"
                icon={FaWeight}
              />
            </div>

            {/* Detailed Nutrients */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <NutrientCard
                title="Fiber"
                value={nutrition.fiber_g * multiplier}
                unit="g"
                icon={FaWeight}
              />
              <NutrientCard
                title="Sugar"
                value={nutrition.sugar_g * multiplier}
                unit="g"
                icon={FaWeight}
              />
              <NutrientCard
                title="Saturated Fat"
                value={nutrition.fat_saturated_g * multiplier}
                unit="g"
                icon={FaWeight}
              />
              <NutrientCard
                title="Cholesterol"
                value={nutrition.cholesterol_mg * multiplier}
                unit="mg"
                icon={FaWeight}
              />
              <NutrientCard
                title="Sodium"
                value={nutrition.sodium_mg * multiplier}
                unit="mg"
                icon={FaWeight}
              />
              <NutrientCard
                title="Potassium"
                value={nutrition.potassium_mg * multiplier}
                unit="mg"
                icon={FaWeight}
              />
            </div>

            {/* Meal Planning */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add to Meal Plan</h3>
              
              {/* Meal Type Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type.toLowerCase())}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                      ${mealType === type.toLowerCase()
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Add to Meal Plan Button */}
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleAddToMealPlan}
                  disabled={isLoading || !mealType}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform
                    ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : mealType
                        ? 'bg-green-500 hover:bg-green-600 hover:scale-105'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding to meal plan...
                    </div>
                  ) : (
                    'Add to Meal Plan'
                  )}
                </button>

                {error && (
                  <p className="text-red-500 text-center">{error}</p>
                )}

                {success && (
                  <p className="text-green-500 text-center">{success}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Meals Summary Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 right-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transform transition-all hover:scale-105"
        onClick={() => {
          fetchTodaysMeals();
          setShowMealsSummary(true);
        }}
      >
        <FaList className="w-6 h-6" />
      </motion.button>

      {/* Today's Meals Summary Modal */}
      <AnimatePresence>
        {showMealsSummary && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setShowMealsSummary(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
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
};

export default FoodInfoPage;
