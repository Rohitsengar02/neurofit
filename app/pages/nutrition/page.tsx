'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaAppleAlt, FaCarrot, FaEgg } from 'react-icons/fa';
import { MdFoodBank } from 'react-icons/md';
import { getFoodNutritionInfo, NutritionData } from '@/app/services/nutritionAI';

const NutritionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [selectedFood, setSelectedFood] = useState<NutritionData | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getFoodNutritionInfo(searchQuery);
      setNutritionData(data);
      setSelectedFood(null);
    } catch (err) {
      setError('Failed to fetch nutrition information. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruits':
        return <FaAppleAlt className="w-6 h-6" />;
      case 'vegetables':
        return <FaCarrot className="w-6 h-6" />;
      case 'proteins':
        return <FaEgg className="w-6 h-6" />;
      default:
        return <MdFoodBank className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Nutrition Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Discover detailed nutritional information about your favorite foods
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for any food..."
              className="w-full px-6 py-4 text-lg rounded-full border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-600 dark:focus:border-purple-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin" />
              ) : (
                <FaSearch className="w-6 h-6" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
        </motion.div>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {nutritionData.map((food, index) => (
              <motion.div
                key={food.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-105 ${
                  selectedFood?.name === food.name ? 'ring-4 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedFood(food)}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-lg ${
                      selectedFood?.name === food.name 
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {getCategoryIcon(food.category)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {food.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {food.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        {food.calories} kcal
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Serving</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        {food.servingSize}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Protein</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {food.macros.protein}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(food.macros.protein / 30) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Carbs</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {food.macros.carbs}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(food.macros.carbs / 100) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Fats</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {food.macros.fats}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(food.macros.fats / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {selectedFood?.name === food.name && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Vitamins</h4>
                        <div className="flex flex-wrap gap-2">
                          {food.vitamins.map((vitamin) => (
                            <span
                              key={vitamin}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                            >
                              {vitamin}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Minerals</h4>
                        <div className="flex flex-wrap gap-2">
                          {food.minerals.map((mineral) => (
                            <span
                              key={mineral}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                            >
                              {mineral}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Health Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                          {food.healthBenefits.map((benefit) => (
                            <li key={benefit}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NutritionPage;
