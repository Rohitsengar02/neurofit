'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Blog, getBlogById, getBlogs } from '@/app/services/blogService';
import { FaCalendar, FaTag, FaFolder, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import BlogCard from '@/app/components/Blog/BlogCard';

const BlogDetailPage = () => {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        if (params.id) {
          const [blogData, allBlogsData] = await Promise.all([
            getBlogById(params.id as string),
            getBlogs()
          ]);

          if (blogData) {
            setBlog(blogData);
            setAllBlogs(allBlogsData);

            // Filter related blogs
            const related = allBlogsData
              .filter(b => b.id !== params.id)
              .filter(b => 
                b.category === blogData.category || 
                b.tags.some(tag => blogData.tags.includes(tag))
              )
              .slice(0, 3);
            setRelatedBlogs(related);
          }
        }
      } catch (error) {
        console.error('Error loading blog:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [params.id]);

  const scrollBlogList = (direction: 'left' | 'right') => {
    const container = document.getElementById('blog-scroll-container');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl text-red-500">Blog not found</h1>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-[70px] left-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-full 
                   shadow-lg hover:shadow-xl transition-all duration-300 group"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 
                                dark:group-hover:text-blue-400 transition-colors" />
        </motion.button>

        {/* Hero Section */}
        <div className="relative h-[50vh] lg:h-[70vh] w-full overflow-hidden">
          <Image
            src={blog.imageUrl}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
        </div>

        {/* Content Section */}
        <div className="relative -mt-32 lg:-mt-48">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl 
                       p-8 md:p-12 lg:p-16 mb-16 backdrop-blur-lg bg-opacity-95"
            >
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-8 text-gray-600 dark:text-gray-400">
                
                <div className="flex items-center">
                  <FaFolder className="w-5 h-5 mr-2" />
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 
                                 px-3 py-1 rounded-full text-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             px-4 py-2 rounded-full text-sm"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>

              {/* Summary */}
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
                {blog.summary}
              </p>

              {/* Content */}
              <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300 max-w-none">
                <div className="mb-12">
                  <p className="text-lg leading-relaxed">{blog.content.introduction}</p>
                </div>

                {blog.content.sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="mb-12"
                  >
                    {section.type === 'heading' && (
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        {section.content}
                      </h2>
                    )}
                    {section.type === 'paragraph' && (
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {section.content}
                      </p>
                    )}
                    {section.type === 'image' && (
                      <div className="relative h-96 rounded-2xl overflow-hidden my-8">
                        <Image
                          src={section.content}
                          alt={section.alt || 'Blog section image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Conclusion */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Key Takeaways
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {blog.content.conclusion}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedBlogs.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
            >
              Related Posts
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <BlogCard blog={relatedBlog} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Blogs Horizontal Scroll */}
        <section className="container mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
          >
            Explore More Blogs
          </motion.h2>
          <div className="relative">
            {/* Scroll Buttons */}
            <button
              onClick={() => scrollBlogList('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 
                       backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <FaChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => scrollBlogList('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 
                       backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <FaChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Scrollable Container */}
            <div
              id="blog-scroll-container"
              className="overflow-x-auto scrollbar-hide"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              <div className="flex gap-6 py-4 px-2">
                {allBlogs
                  .filter(b => b.id !== blog.id)
                  .map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="min-w-[300px] md:min-w-[350px]"
                    >
                      <BlogCard blog={blog} />
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlogDetailPage;
