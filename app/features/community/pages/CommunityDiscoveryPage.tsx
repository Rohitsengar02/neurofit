'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiSearch, FiFilter, FiStar, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import { useCommunity } from '../context/CommunityContext';
import { Community } from '../utils/types';
import * as communityService from '../services/communityService';

const categories = [
  'All'
];

const CommunityDiscoveryPage = () => {
  const router = useRouter();
  const { 
    featuredCommunities, 
    isLoadingFeatured, 
    refreshFeaturedCommunities,
    setCurrentCommunity,
    trainerProfile,
    isLoadingTrainer
  } = useCommunity();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Load featured communities on initial render
  useEffect(() => {
    refreshFeaturedCommunities();
  }, []);
  
  // Handle search
  const handleSearch = async () => {
    if (!searchTerm && selectedCategories.length === 0) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await communityService.searchCommunities(searchTerm, selectedCategories);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching communities:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Navigate to community detail page
  const navigateToCommunity = (community: Community) => {
    setCurrentCommunity(community);
    router.push(`/community/${community.id}`);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Discover Fitness Communities
            </motion.h1>
            <motion.p 
              className="text-xl mb-6 text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join trainer-led communities for personalized workouts, live sessions, and a supportive fitness journey
            </motion.p>
            
            {/* Trainer Dashboard Button - Only shown if user is a trainer */}
            {trainerProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-10"
              >
                <button
                  onClick={() => router.push('/community/trainer/dashboard')}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors flex items-center mx-auto"
                >
                  <FiStar className="mr-2" /> Trainer Dashboard
                </button>
              </motion.div>
            )}
            
            {/* Search Bar */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex-grow flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                <FiSearch className="text-gray-500 dark:text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search communities, trainers, or workout styles..."
                  className="bg-transparent w-full focus:outline-none text-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FiFilter className="mr-2" /> Filter by Category
            </h2>
            {selectedCategories.length > 0 && (
              <button
                className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                onClick={() => setSelectedCategories([])}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Search Results
            </h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {searchResults.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onClick={() => navigateToCommunity(community)}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Featured Communities */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <FiStar className="mr-2 text-yellow-500" /> Featured Communities
            </h2>
          </div>
          
          {isLoadingFeatured ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredCommunities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No featured communities available yet.</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {featuredCommunities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onClick={() => navigateToCommunity(community)}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Become a Trainer CTA */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Are You a Fitness Professional?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create your own community, share your expertise, and grow your online presence. 
                  Connect with members, host live sessions, and monetize your fitness knowledge.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
                  onClick={() => router.push('/community/trainer/apply')}
                >
                  Become a Trainer <FiArrowRight className="ml-2" />
                </button>
              </div>
              <div className="w-full md:w-1/2 relative min-h-[300px]">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Fitness trainer"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface CommunityCardProps {
  community: Community;
  onClick: () => void;
  variants?: any;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onClick, variants }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      variants={variants}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48">
        <Image
          src={community.coverImage || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"}
          alt={community.name}
          fill
          className="object-cover"
        />
        {community.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>
        )}
        {community.logoImage && (
          <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
            <Image
              src={community.logoImage}
              alt={`${community.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="p-6 pt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {community.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {community.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {community.categories.slice(0, 3).map((category) => (
            <span 
              key={category} 
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
          {community.categories.length > 3 && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              +{community.categories.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex items-center mr-4">
            <FiUsers className="mr-1" />
            <span>{community.memberCount} members</span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>Since {new Date(community.createdAt.seconds * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityDiscoveryPage;
