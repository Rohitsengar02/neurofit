import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaUtensils, FaFire } from 'react-icons/fa';
import { Meal } from '@/app/services/dietService';

interface RecipeCardProps {
  recipe: Meal;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl">{recipe.type === 'recipe' ? '🍳' : '📋'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
          {recipe.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <FaClock className="mr-1" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center">
            <FaUtensils className="mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center">
            <FaFire className="mr-1" />
            <span>{recipe.totalCalories} cal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
