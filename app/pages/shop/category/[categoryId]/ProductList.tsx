'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  mainImage: string;
  discountedPrice: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductListProps {
  categoryId: string;
}

const ProductList = ({ categoryId }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // First fetch the category details
        const categoryDoc = await getDocs(collection(db, 'productCategories'));
        const categoryData = categoryDoc.docs
          .find(doc => doc.id === categoryId);

        if (categoryData) {
          setCategory({
            id: categoryData.id,
            name: categoryData.data().name
          });

          // Then fetch products that match both category ID and name
          const productsQuery = query(
            collection(db, 'products'),
            where('category', '==', categoryData.data().name)
          );
          
          const querySnapshot = await getDocs(productsQuery);
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  const handleProductClick = (productId: string) => {
    router.push(`/pages/shop/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {category && (
          <motion.h1 
            className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {category.name}
          </motion.h1>
        )}

        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative aspect-square">
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-brown-600 dark:text-brown-400 font-medium text-sm">
                  ₹{product.discountedPrice.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && !loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No products found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
