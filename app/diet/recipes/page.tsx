'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import RecipeCard from '../../components/Diet/RecipeCard';
import RecipeModal from '../../components/Diet/RecipeModal';
import { Meal } from '../../services/dietService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const sampleImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'https://images.unsplash.com/photo-1547592180-85f173990554',
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'recipe' | 'diet'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users first
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = Object.fromEntries(
          usersSnapshot.docs.map(doc => [
            doc.id,
            {
              id: doc.id,
              name: doc.data().displayName || 'Anonymous User',
              image: doc.data().photoURL || null
            }
          ])
        );

        // Fetch recipes and diets
        const recipesRef = collection(db, 'recipes');
        const dietsRef = collection(db, 'diets');

        const [recipesSnapshot, dietsSnapshot] = await Promise.all([
          getDocs(recipesRef),
          getDocs(dietsRef)
        ]);

        // Merge recipe data with user data
        const recipesData = recipesSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const user = usersData[data.userId] || {
            name: 'Anonymous User',
            image: null
          };
          return {
            ...data,
            id: doc.id,
            type: 'recipe',
            userName: user.name,
            userImage: user.image,
            image: data.imageUrl || sampleImages[index % sampleImages.length],
          } as Meal;
        });

        // Merge diet data with user data
        const dietsData = dietsSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const user = usersData[data.userId] || {
            name: 'Anonymous User',
            image: null
          };
          return {
            ...data,
            id: doc.id,
            type: 'diet',
            userName: user.name,
            userImage: user.image,
            image: data.imageUrl || sampleImages[(index + recipesData.length) % sampleImages.length],
          } as Meal;
        });

        setRecipes([...recipesData, ...dietsData]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter recipes based on search query and type
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || recipe.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          All Recipes & Diet Plans
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover healthy recipes and diet plans created by our community
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search recipes and diets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200
                     ${filterType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('recipe')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200
                     ${filterType === 'recipe'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setFilterType('diet')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200
                     ${filterType === 'diet'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            Diet Plans
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Showing {filteredRecipes.length} {filterType === 'all' ? 'items' : filterType + 's'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
