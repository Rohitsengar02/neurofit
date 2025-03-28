import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaClock, FaFire, FaUtensils } from 'react-icons/fa';

interface Recipe {
  id: string;
  name: string;
  description: string;
  type: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  images: string[];
}

interface Props {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl 
                 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48">
        <Image
          src={recipe.images[0]}
          alt={recipe.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
            {recipe.type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {recipe.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FaClock className="w-4 h-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <FaFire className="w-4 h-4" />
            <span>{recipe.calories} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUtensils className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
