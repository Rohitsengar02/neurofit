'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
}

export default function WishlistPage() {
  const [user] = useAuthState(auth);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const wishlistRef = collection(db, 'users', user!.uid, 'wishlist');
      const snapshot = await getDocs(wishlistRef);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'users', user!.uid, 'wishlist', itemId));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto pt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your wishlist
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto ">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          My Wishlist
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="bg-gray-200 dark:bg-gray-700 w-full aspect-square rounded-lg mb-4" />
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-3/4 rounded mb-2" />
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding items to your wishlist
            </p>
            <Link href="/pages/shop/allproducts">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex"
              >
                <Link 
                  href={`/pages/shop/product/${item.productId}`}
                  className="relative w-32 h-32 flex-shrink-0"
                >
                  {item.mainImage ? (
                    <Image
                      src={item.mainImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <FiShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 p-4 flex justify-between items-center">
                  <div>
                    <Link href={`/pages/shop/product/${item.productId}`}>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{item?.price ? (item.discountedPrice || item.price) : 0}
                      </div>
                      {item?.price && item.price > (item.discountedPrice || item.price) && (
                        <div className="text-base text-gray-500 dark:text-gray-400 line-through">
                          ₹{item.price}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      href={`/pages/shop/product/${item.productId}`}
                      className="hidden sm:inline-flex px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
