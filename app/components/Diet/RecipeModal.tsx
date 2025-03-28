import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaFire, FaUtensils, FaTimes } from 'react-icons/fa';

interface Nutrient {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface Instruction {
  step: number;
  description: string;
  image?: string;
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
  nutrients: Nutrient;
  ingredients: Ingredient[];
  instructions: Instruction[];
  images: string[];
  tips: string[];
}

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<Props> = ({ recipe, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 
                     transition-colors"
          >
            <FaTimes className="w-6 h-6 text-white" />
          </button>

          {/* Recipe Header */}
          <div className="relative h-72">
            <Image
              src={recipe.images[0]}
              alt={recipe.name}
              fill
              className="object-cover rounded-t-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                          rounded-t-3xl" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white mb-4 
                           inline-block">
                {recipe.type}
              </span>
              <h2 className="text-3xl font-bold text-white mb-2">{recipe.name}</h2>
              <p className="text-white/90">{recipe.description}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <FaClock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Prep Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{recipe.prepTime} min</p>
              </div>
              <div className="text-center">
                <FaClock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{recipe.cookTime} min</p>
              </div>
              <div className="text-center">
                <FaUtensils className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
                <p className="font-semibold text-gray-900 dark:text-white">{recipe.servings}</p>
              </div>
              <div className="text-center">
                <FaFire className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="font-semibold text-gray-900 dark:text-white">{recipe.calories}</p>
              </div>
            </div>

            {/* Nutrients */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutrients).map(([nutrient, value]) => (
                  <div
                    key={nutrient}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{nutrient}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{value}g</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </p>
                      {ingredient.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ingredient.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h3>
              <div className="space-y-6">
                {recipe.instructions.map((instruction) => (
                  <div key={instruction.step} className="flex gap-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white 
                                  flex items-center justify-center font-semibold">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white mb-4">
                        {instruction.description}
                      </p>
                      {instruction.image && (
                        <div className="relative h-48 rounded-xl overflow-hidden">
                          <Image
                            src={instruction.image}
                            alt={`Step ${instruction.step}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {recipe.tips.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Tips & Notes
                </h3>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecipeModal;
