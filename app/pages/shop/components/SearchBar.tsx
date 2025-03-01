'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  category: string;
}

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
}

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
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
      }
    };
    fetchCategories();
  }, []);

  // Debounced search function
  const searchProducts = debounce(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const termLower = term.toLowerCase();
      const productsRef = collection(db, 'products');
      
      // Search in products
      const productsQuery = query(
        productsRef,
        orderBy('name'),
        where('name', '>=', termLower),
        where('name', '<=', termLower + '\uf8ff'),
        limit(5)
      );

      const productsSnapshot = await getDocs(productsQuery);
      const productResults = new Map<string, Product>();

      // Add product matches
      productsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.name?.toLowerCase().includes(termLower)) {
          productResults.set(doc.id, {
            id: doc.id,
            name: data.name,
            category: data.category,
            price: data.price,
            mainImage: data.mainImage
          });
        }
      });

      // Search in categories and get their products
      const matchingCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(termLower)
      );

      for (const category of matchingCategories) {
        const categoryProductsQuery = query(
          productsRef,
          where('category', '==', category.name),
          limit(3)
        );
        
        const categoryProductsSnapshot = await getDocs(categoryProductsQuery);
        categoryProductsSnapshot.docs.forEach(doc => {
          if (!productResults.has(doc.id)) {
            const data = doc.data();
            productResults.set(doc.id, {
              id: doc.id,
              name: data.name,
              category: data.category,
              price: data.price,
              mainImage: data.mainImage
            });
          }
        });
      }

      // Sort results by relevance
      const sortedResults = Array.from(productResults.values()).sort((a, b) => {
        // Prioritize exact matches in name
        const aNameMatch = a.name.toLowerCase().startsWith(termLower) ? 0 : 1;
        const bNameMatch = b.name.toLowerCase().startsWith(termLower) ? 0 : 1;
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;

        // Then prioritize category matches
        const aCategoryMatch = a.category.toLowerCase().includes(termLower) ? 0 : 1;
        const bCategoryMatch = b.category.toLowerCase().includes(termLower) ? 0 : 1;
        return aCategoryMatch - bCategoryMatch;
      });

      setSuggestions(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProducts(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/pages/shop/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className="relative flex items-center overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 backdrop-blur-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <motion.div
              animate={{ 
                scale: isLoading ? [1, 1.2, 1] : 1,
                rotate: isLoading ? [0, 180, 360] : 0 
              }}
              transition={{ 
                duration: 1.5,
                repeat: isLoading ? Infinity : 0,
                ease: "linear"
              }}
            >
              <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            placeholder="Search for products..."
            autoComplete="off"
          />

          {/* Loading Spinner */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute right-4"
              >
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300"/>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subtle Gradient Effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-pink-100/40 via-purple-100/40 to-indigo-100/40 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 blur-xl"/>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {searchTerm.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50"
          >
            {suggestions.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {suggestions.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/pages/shop/product/${product.id}`}
                  >
                    <motion.div 
                      className="flex items-center gap-4 p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      whileHover={{ x: 4 }}
                    >
                      {/* Product Image */}
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                        {product.mainImage && (
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{product.price}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <FiArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <motion.div 
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500">
                  <FiSearch className="h-full w-full" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No products found
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
