'use client';

import { useState } from 'react';
import { FaLeaf, FaDrumstickBite, FaFire, FaWeight, FaCarrot, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeModal from './RecipeModal';
import { generateMealPlan } from '@/app/services/gemini';
import { saveDietPlan, deleteDietPlan } from '@/app/services/dietService';
import { DietPlan, Recipe, MealSection } from '@/app/data/predefinedDiets';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface DietPlanProps {
  predefinedDiets: DietPlan[];
}

const DietPlanComponent: React.FC<DietPlanProps> = ({ predefinedDiets }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleGenerateDiet = async (dietType: 'veg' | 'non-veg') => {
    try {
      if (!user) {
        toast.error('Please sign in to generate a diet plan');
        return;
      }

      setIsGenerating(true);
      setError(null);
      const generatedPlan = await generateMealPlan(dietType);
      await saveDietPlan(generatedPlan);
      toast.success('New diet plan generated and saved!');
      router.refresh();
    } catch (error) {
      console.error('Failed to generate diet plan:', error);
      setError('Failed to generate diet plan. Please try again.');
      toast.error('Failed to generate diet plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDiet = async (dietId: string) => {
    try {
      if (!user) {
        toast.error('Please sign in to delete a diet plan');
        return;
      }

      await deleteDietPlan(dietId);
      toast.success('Diet plan deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete diet plan:', error);
      toast.error('Failed to delete diet plan');
    }
  };

  const renderRecipeCard = (recipe: Recipe) => (
    <div
      key={recipe.id}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <h4 className="text-lg font-semibold mb-2">{recipe.name}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{recipe.description}</p>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <FaClock className="mr-1" />
        <span>{recipe.estimatedTime}</span>
        <div className="mx-2">•</div>
        <FaFire className="mr-1" />
        <span>{recipe.nutritionalValues.calories} cal</span>
      </div>
    </div>
  );

  const renderMealSection = (section: MealSection) => (
    <div key={section.mealTime} className="mb-6">
      <h3 className="text-lg font-semibold capitalize mb-3">{section.mealTime}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {section.options.map(renderRecipeCard)}
      </div>
    </div>
  );

  const renderDietPlan = (diet: DietPlan) => (
    <div key={diet.id} className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold">{diet.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{diet.description}</p>
        </div>
        {diet.createdBy === 'ai' && user && (
          <button
            onClick={() => handleDeleteDiet(diet.id)}
            className="px-3 py-1 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      {diet.sections.map(renderMealSection)}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-8">
          Please sign in to generate and save diet plans
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vegetarian Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaLeaf className="mr-2 text-green-500" />
              Vegetarian Plans
            </h2>
            <button
              onClick={() => handleGenerateDiet('veg')}
              disabled={isGenerating || !user}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate New Plan'}
            </button>
          </div>
          <div className="space-y-6">
            {predefinedDiets
              .filter(diet => diet.type === 'veg')
              .map(renderDietPlan)}
          </div>
        </div>

        {/* Non-Vegetarian Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaDrumstickBite className="mr-2 text-red-500" />
              Non-Vegetarian Plans
            </h2>
            <button
              onClick={() => handleGenerateDiet('non-veg')}
              disabled={isGenerating || !user}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate New Plan'}
            </button>
          </div>
          <div className="space-y-6">
            {predefinedDiets
              .filter(diet => diet.type === 'non-veg')
              .map(renderDietPlan)}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-md mt-6">
          {error}
        </div>
      )}

      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietPlanComponent;
