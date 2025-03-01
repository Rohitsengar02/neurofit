'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiPackage, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';
import CartSidebar, { CartItem } from '@/app/components/shop/CartSidebar';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

const LocationHeader = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user] = useAuthState(auth);
  const router = useRouter();

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
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    const cartItemRef = doc(db, `users/${user.uid}/cart/${id}`);
    await updateDoc(cartItemRef, { quantity: newQuantity });
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    
    const cartItemRef = doc(db, `users/${user.uid}/cart/${id}`);
    await deleteDoc(cartItemRef);
  };

  const handleAddressClick = () => {
    if (!user) {
      // If not logged in, redirect to login
      router.push('/auth/login');
      return;
    }
    router.push('/pages/shop/address');
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/90 via-purple-100/90 to-indigo-100/90 dark:from-rose-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 backdrop-blur-lg" />

        {/* Header Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/pages/shop">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  NeuroFit
                </span>
              </motion.div>
            </Link>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-700 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <FiShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </motion.button>

              <Link href="/pages/shop/orders">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-700 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <FiPackage className="h-6 w-6" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddressClick}
                className="p-2 text-gray-700 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <FiMapPin className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent" />
      </motion.header>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </>
  );
};

export default LocationHeader;
