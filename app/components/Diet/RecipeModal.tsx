import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaUtensils, FaFire } from 'react-icons/fa';
import { Meal } from '@/app/services/dietService';

interface RecipeModalProps {
  recipe: Meal | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, isOpen, onClose }) => {
  if (!recipe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                     bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden
                     md:w-[90%] md:max-w-4xl md:h-auto max-h-[90vh]"
          >
            {/* Header with Image */}
            <div className="relative h-64 md:h-80">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-6xl">{recipe.type === 'recipe' ? '🍳' : '📋'}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)]">
              {/* Author Info */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  {recipe.userImage ? (
                    <img
                      src={recipe.userImage}
                      alt={recipe.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xl">
                        {recipe.userName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recipe.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{recipe.userName}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">{recipe.description}</p>

              {recipe.type === 'recipe' ? (
                <>
                  {/* Recipe Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <FaClock className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Prep Time</p>
                        <p className="font-medium">{recipe.prepTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaUtensils className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Servings</p>
                        <p className="font-medium">{recipe.servings}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaFire className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                        <p className="font-medium">{recipe.nutrition.calories}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-600 dark:text-gray-400"
                        >
                          <span className="mr-2">•</span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Instructions
                    </h3>
                    <ol className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <li
                          key={index}
                          className="flex text-gray-600 dark:text-gray-400"
                        >
                          <span className="font-bold mr-4">{index + 1}.</span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  {/* Diet Plan */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Goals
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  {recipe.mealPlan && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        Meal Plan
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(recipe.mealPlan).map(([time, meal]) => (
                          <div
                            key={time}
                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                              {time}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {meal.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restrictions */}
                  {recipe.restrictions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        Dietary Restrictions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recipe.restrictions.map((restriction, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RecipeModal;
