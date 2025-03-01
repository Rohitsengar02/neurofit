'use client';
import React from 'react';
import { motion } from 'framer-motion';
import LocationHeader from './components/LocationHeader';
import SearchBar from './components/SearchBar';
import SpecialOffers from './components/SpecialOffers';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';

import MobileBottomMenu from '@/app/components/Navigation/MobileBottomMenu';

export default function Shop() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LocationHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-b from-brown-50 to-white dark:from-gray-900 dark:to-gray-800 pb-24"
        >
          <div className="max-w-lg mx-auto">
            {/* Search Bar */}
            <SearchBar />

            {/* Special Offers Slider */}
            <SpecialOffers />

            {/* Categories */}
            <Categories />

            {/* Featured Products */}
            <FeaturedProducts />

            <MobileBottomMenu />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
