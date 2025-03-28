'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Blog } from '@/app/services/blogService';
import { FaCalendar, FaTag } from 'react-icons/fa';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, featured = false }) => {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300
                 ${featured ? 'border-2 border-blue-500/20' : ''}`}
      onClick={() => router.push(`/blog/${blog.id}`)}
    >
      <div className={`relative ${featured ? 'h-56' : 'h-48'} overflow-hidden`}>
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          fill
          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {blog.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center">
            <FaCalendar className="w-4 h-4 mr-1" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 mr-1" />
            <span>{blog.tags.length} tags</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 dark:text-white mb-2 
                      line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
          {blog.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {blog.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 
                       px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {blog.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{blog.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Read More Link */}
        <motion.div
          whileHover={{ x: 5 }}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm"
        >
          Read More
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
