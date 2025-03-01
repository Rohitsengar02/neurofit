'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaSearch, FaUtensils } from 'react-icons/fa';

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
  nutrition: NutritionInfo;
}

const NutritionPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const API_NINJA_KEY = process.env.NEXT_PUBLIC_API_NINJA_KEY;

  useEffect(() => {
    const searchFood = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(debouncedSearchQuery)}`,
          {
            headers: {
              'X-Api-Key': API_NINJA_KEY!,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        const formattedResults = data.map((item: NutritionInfo, index: number) => ({
          id: `${index}-${item.name}`,
          name: item.name,
          nutrition: item
        }));

        setSearchResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to fetch food data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    searchFood();
  }, [debouncedSearchQuery, API_NINJA_KEY]);

  const handleFoodSelect = (food: FoodItem) => {
    localStorage.setItem('selectedFood', JSON.stringify(food));
    router.push('/pages/nutrition/food-info');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any food..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-transparent dark:text-white text-lg"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </div>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </motion.div>

        {/* Debug Info */}
        <div className="text-sm text-gray-500">
          {searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results'}
        </div>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {searchResults.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleFoodSelect(food)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                    <FaUtensils className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {food.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {food.nutrition.calories} kcal per {food.nutrition.serving_size_g}g
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results Message */}
        {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No foods found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPage;
