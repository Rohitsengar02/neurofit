'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface CartItem {
  id: string;
  quantity: number;
}

export default function LocationHeader() {
  const [user] = useAuthState(auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pages/shop/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
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
          <Link href="/pages/shop/cart">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2"
            >
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
