'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import CartSidebar, { CartItem } from '@/app/components/shop/CartSidebar';

export default function SearchBar() {
  const [user] = useAuthState(auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pages/shop/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/pages/shop">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  NeuroFit
                </span>
              </motion.div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
            </form>

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
            >
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </motion.button>
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
}
