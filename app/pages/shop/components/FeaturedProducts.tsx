'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, getDoc, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/app/firebase/config';
import Image from 'next/image';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi2';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  discountedPrice: number;
}

interface ShopSection {
  id: string;
  title: string;
  description: string;
  order: number;
  displayType: 'scroll' | 'grid';
  products: Product[];
}

export default function FeaturedProducts() {
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    fetchSections();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchSections = async () => {
    try {
      const sectionsRef = collection(db, 'shopSections');
      const q = query(sectionsRef, orderBy('order'));
      const querySnapshot = await getDocs(q);
      
      const sectionsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const section = { id: doc.id, ...doc.data() } as ShopSection;
          section.products = await fetchProductsForSection(section.id);
          return section;
        })
      );
      
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const wishlistRef = collection(db, `users/${user.uid}/wishlist`);
      const snapshot = await getDocs(wishlistRef);
      setWishlistItems(snapshot.docs.map(doc => doc.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const wishlistRef = doc(db, `users/${user.uid}/wishlist/${productId}`);
      if (wishlistItems.includes(productId)) {
        await deleteDoc(wishlistRef);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await setDoc(wishlistRef, { addedAt: new Date() });
        setWishlistItems(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const fetchProductsForSection = async (sectionId: string): Promise<Product[]> => {
    try {
      const sectionRef = doc(db, 'shopSections', sectionId);
      const sectionDoc = await getDoc(sectionRef);
      
      if (!sectionDoc.exists()) {
        return [];
      }

      const sectionData = sectionDoc.data();
      const productIds = sectionData.productIds || [];

      const productsPromises = productIds.map(async (productId: string) => {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const data = productDoc.data();
          return {
            id: productDoc.id,
            name: data.name || '',
            price: data.price || 0,
            discountedPrice: data.discountedPrice || data.price || 0,
            mainImage: data.mainImage || ''
          } as Product;
        }
        return null;
      });

      const products = (await Promise.all(productsPromises)).filter((p): p is Product => p !== null);
      return products;
    } catch (error) {
      console.error('Error fetching products for section:', error);
      return [];
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Wishlist Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md backdrop-blur-sm"
      >
        {wishlistItems.includes(product.id) ? (
          <HiHeart className="w-5 h-5 text-red-500" />
        ) : (
          <FiHeart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </motion.button>

      <Link href={`/pages/shop/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          {product.mainImage && (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
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
      </Link>
    </motion.div>
  );

  return (
    <div className="space-y-12 py-8 -px-4">
      <AnimatePresence>
        {sections.map((section) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 -z-10 animate-gradient-x" />
            
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>

              {section.displayType === 'scroll' ? (
                <div className="relative group">
                  <div className="overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6 pb-4">
                      {section.products.map((product) => (
                        <div key={product.id} className="w-72 flex-shrink-0">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scroll Buttons */}
                  <button
                    onClick={() => {
                      const container = document.getElementById(`scroll-${section.id}`);
                      if (container) container.scrollLeft -= 300;
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById(`scroll-${section.id}`);
                      if (container) container.scrollLeft += 300;
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <FaArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {section.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>

      {/* Add some custom styles for the gradient animation */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
