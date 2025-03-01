'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}

const AllCategories = () => {
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
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
            <div key={index} className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All Categories
        </motion.h1>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={item}
              onClick={() => router.push(`/pages/shop/category/${category.id}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${category.gradientStart}, ${category.gradientEnd})`
                }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
              
              <div className="relative h-full w-full flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 mb-4 flex items-center justify-center">
                  {category.icon && (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white text-center">{category.name}</h3>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AllCategories;
