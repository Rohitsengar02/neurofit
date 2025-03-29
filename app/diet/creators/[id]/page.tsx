'use client';

import React, { useState, useEffect, use } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { motion } from 'framer-motion';
import { Meal } from '../../../services/dietService';
import RecipeCard from '../../../components/Diet/RecipeCard';
import RecipeModal from '../../../components/Diet/RecipeModal';
import { FaUtensils, FaListAlt } from 'react-icons/fa';

interface Creator {
  id: string;
  name: string;
  image: string;
  bio?: string;
  isOnline?: boolean;
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [diets, setDiets] = useState<Meal[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'diets'>('recipes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        // Fetch creator details
        const creatorDoc = await getDoc(doc(db, 'users', id));
        if (creatorDoc.exists()) {
          setCreator({
            id: creatorDoc.id,
            name: creatorDoc.data().displayName || 'Anonymous Creator',
            image: creatorDoc.data().photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorDoc.id}`,
            bio: creatorDoc.data().bio,
            isOnline: creatorDoc.data().isOnline
          });
        }

        // Fetch recipes
        const recipesQuery = query(collection(db, 'recipes'), where('userId', '==', id));
        const recipesSnapshot = await getDocs(recipesQuery);
        const recipesData = recipesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Untitled Recipe',
            description: data.description || '',
            image: data.imageUrl || data.image || '/images/sample-recipe.jpg',
            type: 'recipe' as const,
            nutrition: data.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            totalCalories: data.totalCalories || 0,
            userId: id,
           
            userImage: creator?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            prepTime: data.prepTime || '30 mins',
            servings: data.servings || '2',
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            goals: data.goals || [],
            restrictions: data.restrictions || [],
           
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            likes: data.likes || 0
          } as Meal;
        });
        setRecipes(recipesData);

        // Fetch diets
        const dietsQuery = query(collection(db, 'diets'), where('userId', '==', id));
        const dietsSnapshot = await getDocs(dietsQuery);
        const dietsData = dietsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Untitled Diet Plan',
            description: data.description || '',
            image: data.imageUrl || data.image || '/images/sample-diet.jpg',
            type: 'diet' as const,
            nutrition: data.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            totalCalories: data.totalCalories || 0,
            userId: id,
           
            userImage: creator?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            prepTime: data.prepTime || '7 days',
            servings: data.servings || '1',
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            goals: data.goals || [],
            restrictions: data.restrictions || [],
           
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            likes: data.likes || 0
          } as Meal;
        });
        setDiets(dietsData);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [id]);

  const activeItems = activeTab === 'recipes' ? recipes : diets;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Creator not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Creator Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
            {creator.isOnline && (
              <div className="absolute bottom-0 right-0">
                <div className="w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {creator.name}
            </h1>
            {creator.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {creator.bio}
              </p>
            )}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{recipes.length} Recipes</span>
              <span>{diets.length} Diet Plans</span>
              <span>{recipes.reduce((acc, recipe) => acc + (recipe.likes || 0), 0)} Total Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200
                   ${activeTab === 'recipes'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'}`}
        >
          <FaUtensils />
          Recipes
        </button>
        <button
          onClick={() => setActiveTab('diets')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200
                   ${activeTab === 'diets'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'}`}
        >
          <FaListAlt />
          Diet Plans
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeItems.map((item) => (
          <RecipeCard
            key={item.id}
            recipe={item}
            onClick={() => setSelectedRecipe(item)}
          />
        ))}
      </div>

      {/* Empty State */}
      {activeItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No {activeTab} found
          </p>
        </div>
      )}

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
