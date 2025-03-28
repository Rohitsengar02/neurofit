'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import DietCategoryCard from '../components/Diet/DietCategoryCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface DietCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  tags: string[];
  order: number;
}

const DietPage = () => {
  const [categories, setCategories] = useState<DietCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, 'dietCategories'),
          where('isActive', '==', true),
          orderBy('order')
        );
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DietCategory[];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching diet categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || category.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
     

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-4  relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search diet plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 
                         focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 
                         focus:ring-blue-500 transition-all"
              >
                <option value="all">All Types</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DietCategoryCard category={category} />
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl text-gray-600 dark:text-gray-400">
              No diet plans found matching your criteria
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPage;
