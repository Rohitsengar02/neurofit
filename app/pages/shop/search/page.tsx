'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  category: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchQuery) {
      searchProducts();
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      // Filter products locally based on search query
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const filteredProducts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
        .filter(product => {
          const productName = product.name?.toLowerCase() || '';
          const productCategory = product.category?.toLowerCase() || '';
          
          // Check if all search terms are found in either name or category
          return searchTerms.every(term => 
            productName.includes(term) || productCategory.includes(term)
          );
        });

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Search Results for "{searchQuery}"
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link href={`/pages/shop/product/${product.id}`} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {product.mainImage ? (
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <FiShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{product.discountedPrice.toLocaleString()}
                      </span>
                      {product.price > product.discountedPrice && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
