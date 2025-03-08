'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/app/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import debounce from 'lodash/debounce';
import { FiSearch, FiArrowRight, FiShoppingCart, FiMapPin, FiPackage, FiHeart } from 'react-icons/fi';
import CartSidebar, { CartItem } from '@/app/components/shop/CartSidebar';

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Subscribe to cart updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/cart`),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CartItem[];
        setCartItems(items);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Cart operations
  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    const cartItemRef = doc(db, `users/${user.uid}/cart/${id}`);
    await updateDoc(cartItemRef, { quantity: newQuantity });
  };

  const handleRemoveItem = async (id: string) => {
    if (!user) return;
    
    const cartItemRef = doc(db, `users/${user.uid}/cart/${id}`);
    await deleteDoc(cartItemRef);
  };

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

  // Navigation handlers
  const handleCartClick = () => setIsCartOpen(true);
  const handleAddressClick = () => router.push('/pages/shop/address');
  const handleOrdersClick = () => router.push('/pages/shop/orders');
  const handleWishlistClick = () => router.push('/pages/shop/wishlist');

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm">
        <div className="max-w-9xl mx-auto pl-4 pr-2 pb-2 pt-4">
          <div className="flex items-center ">
            {/* Search Bar */}
            <div className="relative flex-1" ref={searchRef}>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800/50 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-gray-200 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                />
              </div>

              <AnimatePresence>
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
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

            {/* Navigation Icons */}
            <div className="flex items-center ">
              

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOrdersClick}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 relative group"
              >
                <FiPackage className="w-6 h-6" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Orders
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddressClick}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 relative group"
              >
                <FiMapPin className="w-6 h-6" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Address
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCartClick}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 relative group"
              >
                <div className="relative">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Cart
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
};

export default SearchBar;
