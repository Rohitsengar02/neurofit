'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productCategories'));
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProductCategory[];
        console.log('Fetched categories:', categoriesData); // Debug log
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse mb-2"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="px-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Categories</h2>
        <motion.button 
          className="text-sm text-brown-600 dark:text-white hover:text-brown-700 dark:hover:text-brown-300 transition-colors"
          onClick={() => router.push('/pages/shop/all-categories')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          See All
        </motion.button>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 pb-2 min-w-min">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              className="flex flex-col items-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/pages/shop/category/${category.id}`)}
            >
              <motion.div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${category.gradientStart}, ${category.gradientEnd})`
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300"
                />
                <div className="relative w-10 h-10 flex items-center justify-center">
                  {category.icon && (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error(`Error loading icon for ${category.name}:`, e);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        console.log(`Icon loaded for ${category.name}`);
                      }}
                    />
                  )}
                </div>
              </motion.div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap group-hover:text-brown-600 dark:group-hover:text-brown-400 transition-colors">
                {category.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Categories;
