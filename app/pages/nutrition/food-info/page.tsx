'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaUtensils, FaWeight, FaFire, FaClock } from 'react-icons/fa';

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

const FoodInfoPage: React.FC = () => {
  const router = useRouter();
  const [foodData, setFoodData] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [mealType, setMealType] = useState<string>('');
  const [mealTime, setMealTime] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFood = localStorage.getItem('selectedFood');
      if (storedFood) {
        setFoodData(JSON.parse(storedFood));
      }
    }
  }, []);

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

  const handleAddToMeal = async () => {
    if (!mealType || !mealTime) {
      alert('Please select both meal type and time');
      return;
    }

    try {
      // Add to your database here
      const mealData = {
        foodId: foodData.id,
        name: foodData.name,
        amount,
        unit,
        mealType,
        mealTime,
        nutrition: {
          calories: nutrition.calories * multiplier,
          protein: nutrition.protein_g * multiplier,
          carbs: nutrition.carbohydrates_total_g * multiplier,
          fat: nutrition.fat_total_g * multiplier
        },
        date: new Date().toISOString()
      };

      console.log('Adding meal:', mealData);
      // Add your database logic here

      router.push('/nutrition');
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
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

              {/* Meal Time Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setMealTime(time.toLowerCase())}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                      ${mealTime === time.toLowerCase()
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {/* Add to Meal Plan Button */}
              <button
                onClick={handleAddToMeal}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transform transition-all hover:scale-105"
              >
                Add to Meal Plan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FoodInfoPage;
