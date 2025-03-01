import { motion } from 'framer-motion';
import { FaFire, FaWeight, FaCarrot } from 'react-icons/fa';
import { MdFiberManualRecord } from 'react-icons/md';
import { Recipe } from '@/app/data/predefinedDiets';
import { Tab } from '@headlessui/react';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const renderNutritionalInfo = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center space-x-2">
        <FaFire className="text-orange-500" />
        <span>{recipe.nutritionalValues.calories} cal</span>
      </div>
      <div className="flex items-center space-x-2">
        <FaWeight className="text-blue-500" />
        <span>{recipe.nutritionalValues.protein}g protein</span>
      </div>
      <div className="flex items-center space-x-2">
        <FaCarrot className="text-green-500" />
        <span>{recipe.nutritionalValues.carbs}g carbs</span>
      </div>
      <div className="flex items-center space-x-2">
        <MdFiberManualRecord className="text-purple-500" />
        <span>{recipe.nutritionalValues.fiber}g fiber</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{recipe.description}</p>

        <Tab.Group>
          <Tab.List className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            <Tab className={({ selected }) =>
              `px-4 py-2 focus:outline-none ${
                selected
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`
            }>
              Ingredients
            </Tab>
            <Tab className={({ selected }) =>
              `px-4 py-2 focus:outline-none ${
                selected
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`
            }>
              Instructions
            </Tab>
            <Tab className={({ selected }) =>
              `px-4 py-2 focus:outline-none ${
                selected
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`
            }>
              Nutrition
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <ul className="list-disc pl-6 space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </Tab.Panel>

            <Tab.Panel>
              <ol className="list-decimal pl-6 space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {instruction}
                  </li>
                ))}
              </ol>
            </Tab.Panel>

            <Tab.Panel>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {renderNutritionalInfo()}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Estimated Time: {recipe.estimatedTime}</span>
            <span>Serving Size: {recipe.servingSize}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipeModal;
