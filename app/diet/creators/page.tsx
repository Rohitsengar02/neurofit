'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Creator {
  id: string;
  name: string;
  image: string;
  recipeCount: number;
  dietCount: number;
  totalLikes: number;
  isOnline?: boolean;
}

export default function CreatorsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        // Fetch all recipes and diets
        const [recipesSnapshot, dietsSnapshot] = await Promise.all([
          getDocs(collection(db, 'recipes')),
          getDocs(collection(db, 'diets'))
        ]);

        // Get unique creator IDs and count their recipes/diets
        const creatorStats = new Map<string, {
          recipes: number;
          diets: number;
          likes: number;
        }>();

        recipesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.userId;
          const stats = creatorStats.get(userId) || { recipes: 0, diets: 0, likes: 0 };
          stats.recipes += 1;
          stats.likes += data.likes || 0;
          creatorStats.set(userId, stats);
        });

        dietsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.userId;
          const stats = creatorStats.get(userId) || { recipes: 0, diets: 0, likes: 0 };
          stats.diets += 1;
          stats.likes += data.likes || 0;
          creatorStats.set(userId, stats);
        });

        // Fetch user details for creators
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const creatorsData: Creator[] = [];

        usersSnapshot.docs.forEach(doc => {
          if (creatorStats.has(doc.id)) {
            const userData = doc.data();
            const stats = creatorStats.get(doc.id)!;
            creatorsData.push({
              id: doc.id,
              name: userData.displayName || 'Anonymous Creator',
              image: userData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + doc.id,
              recipeCount: stats.recipes,
              dietCount: stats.diets,
              totalLikes: stats.likes,
              isOnline: userData.isOnline || false
            });
          }
        });

        setCreators(creatorsData);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Featured Creators
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover amazing creators sharing healthy recipes and diet plans
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCreators.map((creator) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="relative">
              {/* Creator Image */}
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Online Status */}
              {creator.isOnline && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {creator.name}
              </h3>
              
              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p>{creator.recipeCount} Recipes</p>
                  <p>{creator.dietCount} Diet Plans</p>
                </div>
                
              </div>

              {/* View Profile Button */}
              <button
                onClick={() => router.push(`/diet/creators/${creator.id}`)}
                className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 
                         text-white rounded-lg transition-colors duration-200"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredCreators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No creators found</p>
        </div>
      )}
    </div>
  );
}
