'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Meal } from '@/app/services/dietService';
import MainPageRecipeCard from '@/app/components/Diet/MainPageRecipeCard';
import { FaSearch } from 'react-icons/fa';

export default function DietPlansPage() {
  const [dietPlans, setDietPlans] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        const dietsRef = collection(db, 'diets');
        const dietsSnapshot = await getDocs(dietsRef);
        const dietsData = dietsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          type: 'diet'
        })) as Meal[];
        setDietPlans(dietsData);
      } catch (error) {
        console.error('Error fetching diet plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  const filteredDietPlans = dietPlans.filter(plan =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Diet Plans</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search diet plans..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDietPlans.map(plan => (
            <MainPageRecipeCard
              key={plan.id}
              recipe={plan}
              isLiked={false}
              isSaved={false}
              onComment={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
