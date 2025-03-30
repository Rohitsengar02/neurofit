'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiPlus, FiHeart, FiMapPin, FiPackage, FiGrid } from 'react-icons/fi';

const menuItems = [
  {
    icon: FiHeart,
    label: 'Wishlist',
    href: '/pages/shop/wishlist',
    color: 'text-red-500'
  },
  {
    icon: FiGrid,
    label: 'All Products',
    href: '/pages/shop/allproducts',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
  },
  {
    icon: FiMapPin,
    label: 'Addresses',
    href: '/pages/shop/addresses',
    color: 'text-blue-500'
  },
  {
    icon: FiPackage,
    label: 'Orders',
    href: '/pages/shop/orders',
    color: 'text-green-500'
  }
];

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a product detail page
  const isProductPage = pathname?.includes('/shop/product/');
  const bottomPosition = isProductPage ? 'bottom-[16.8vh]' : 'bottom-20';

  return (
    <div className={`fixed right-4 ${bottomPosition} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col-reverse gap-3 mb-4"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: index * 0.1 } 
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.6,
                  transition: { delay: (menuItems.length - 1 - index) * 0.05 }
                }}
              >
                <Link href={item.href}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${item.color} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="absolute right-full mr-3 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-green-400 hover:bg-green-400 text-white shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'rotate-45' : ''} transform transition-transform duration-200`}
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
