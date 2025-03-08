'use client';
import React from 'react';
import { motion } from 'framer-motion';
import SpecialOffers from './components/SpecialOffers';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';

export default function Shop() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-b from-brown-50 to-white dark:from-gray-900 dark:to-gray-800 pb-24"
      >
        <div className="max-w-lg mx-auto">
          {/* Special Offers Slider */}
          <SpecialOffers />

          {/* Categories */}
          <Categories />

          {/* Featured Products */}
          <FeaturedProducts />
        </div>
      </motion.div>
    </div>
  );
}
