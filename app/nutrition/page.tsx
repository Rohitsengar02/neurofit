'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaSearch, FaAppleAlt, FaCarrot, FaBreadSlice, FaDrumstickBite, FaFish, FaEgg, FaGlassMartini, FaPizzaSlice } from 'react-icons/fa';
import { GiMilkCarton, GiFruitBowl, GiChocolateBar } from 'react-icons/gi';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const NutritionPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const searchFood = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setErrorMessage('');
      return;
    }

    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

  useEffect(() => {
    if (debouncedSearch) {
      searchFood(debouncedSearch);
    }
  }, [debouncedSearch]);

  const handleFoodSelect = (food: FoodItem) => {
    try {
      localStorage.setItem('selectedFood', JSON.stringify(food));
      router.push(`/nutrition/food-info`);
    } catch (error) {
      console.error('Error storing food data:', error);
      setErrorMessage('Error selecting food item. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any food..."
              className="w-full px-6 py-4 text-lg rounded-2xl shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pl-14"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
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
        )}
        <div className="flex items-center justify-center">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-gray-600">No food items found. Try searching for "banana" or "chicken"</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
