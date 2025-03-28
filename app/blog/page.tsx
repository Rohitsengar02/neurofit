'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getBlogs, getLatestBlogs, Blog } from '../services/blogService';
import BlogCard from '../components/Blog/BlogCard';
import SearchBar from '../components/Blog/SearchBar';

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const allBlogs = await getBlogs(searchQuery);
      
      if (allBlogs.length > 0 && !searchQuery) {
        // Get top 3 blogs as featured
        setFeaturedBlogs(allBlogs.slice(0, 3));
        setBlogs(allBlogs.slice(3));
      } else {
        setFeaturedBlogs([]);
        setBlogs(allBlogs);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadBlogs();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="relative mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search blogs by title, category, or tags..."
            />
          </motion.div>
        </div>

        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && !searchQuery && (
          <section className="mb-16">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-bold mb-8 text-gray-900 dark:text-white"
            >
             
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <BlogCard blog={blog} featured={true} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Blogs */}
        <section className="mb-16">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold mb-8 text-gray-900 dark:text-white"
          >
           
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* No Results */}
        {blogs.length === 0 && featuredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-xl text-gray-600 dark:text-gray-400">
              {searchQuery ? 'No blogs found matching your search.' : 'No blogs available.'}
            </h3>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
