'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiLinkedin, FiTwitter, FiInstagram, FiMail, FiArrowRight, FiAward, FiUsers, FiHeart } from 'react-icons/fi';
import { RiMedalFill, RiTeamFill, RiHeartPulseFill } from 'react-icons/ri';
import { IoFitness, IoRocket, IoTrophy } from 'react-icons/io5';
import { useTheme } from 'next-themes';

const FounderPage = () => {
  const { theme } = useTheme();
  const controls = useAnimation();
  const bioRef = useRef(null);
  const visionRef = useRef(null);
  const journeyRef = useRef(null);
  const achievementsRef = useRef(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const isBioInView = useInView(bioRef, { once: true, amount: 0.3 });
  const isVisionInView = useInView(visionRef, { once: true, amount: 0.3 });
  const isJourneyInView = useInView(journeyRef, { once: true, amount: 0.3 });
  const isAchievementsInView = useInView(achievementsRef, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (isBioInView) controls.start('bioVisible');
    if (isVisionInView) controls.start('visionVisible');
    if (isJourneyInView) controls.start('journeyVisible');
    if (isAchievementsInView) controls.start('achievementsVisible');
  }, [controls, isBioInView, isVisionInView, isJourneyInView, isAchievementsInView]);

  // Testimonial auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    bioVisible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    },
    visionVisible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    },
    journeyVisible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    },
    achievementsVisible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    bioVisible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
    visionVisible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
    journeyVisible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
    achievementsVisible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const cardHoverVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  const testimonials = [
    {
      quote: "Rohit's vision for NeuroFit has transformed how we approach fitness technology. His leadership continues to inspire our team to push boundaries.",
      author: "Sarah Johnson",
      title: "CTO, FitTech Ventures",
      image: "/images/testimonial-1.jpg"
    },
    {
      quote: "Working with Rohit has been a game-changer for our fitness center. The NeuroFit platform has helped us deliver personalized experiences at scale.",
      author: "Michael Chen",
      title: "Owner, Elite Fitness Club",
      image: "/images/testimonial-2.jpg"
    },
    {
      quote: "Rohit Sengar is one of the most innovative minds in the fitness tech space. His commitment to accessibility and personalization sets NeuroFit apart.",
      author: "Priya Sharma",
      title: "Fitness Industry Analyst",
      image: "/images/testimonial-3.jpg"
    }
  ];
  
  const achievements = [
    { number: "1M+", label: "Active Users", icon: <FiUsers className="w-6 h-6" /> },
    { number: "30+", label: "Countries", icon: <IoRocket className="w-6 h-6" /> },
    { number: "15+", label: "Industry Awards", icon: <IoTrophy className="w-6 h-6" /> },
    { number: "24/7", label: "Global Support", icon: <FiHeart className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          
          {/* Animated particles */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-green-500 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
          <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-indigo-500 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '7s' }} />
          
          {/* Animated gradient lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative mb-2">
                <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                <h4 className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider ml-2 mb-2">FOUNDER & VISIONARY</h4>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Rohit Sengar</span>
              </h1>
              <div className="flex items-center mb-6">
                <div className="h-px bg-gradient-to-r from-blue-600 to-transparent flex-grow max-w-[100px] mr-4"></div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Founder & CEO</h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Visionary entrepreneur revolutionizing fitness through technology and personalized experiences. Pioneering the future of health and wellness with NeuroFit's innovative AI-driven solutions.  
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <motion.div 
                  className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <IoFitness className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Fitness Tech Pioneer</span>
                </motion.div>
                <motion.div 
                  className="flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <RiMedalFill className="text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Award-Winning Entrepreneur</span>
                </motion.div>
                <motion.div 
                  className="flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <RiHeartPulseFill className="text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Wellness Advocate</span>
                </motion.div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <motion.button 
                    className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiLinkedin className="w-6 h-6" />
                  </motion.button>
                </Link>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <motion.button 
                    className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiTwitter className="w-6 h-6" />
                  </motion.button>
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <motion.button 
                    className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiInstagram className="w-6 h-6" />
                  </motion.button>
                </Link>
                <Link href="mailto:rohit@neurofit.com">
                  <motion.button 
                    className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMail className="w-6 h-6" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px]">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 dark:border-blue-700 animate-spin-slow" style={{ animationDuration: '30s' }} />
                <div className="absolute inset-8 rounded-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 animate-reverse-spin" style={{ animationDuration: '20s' }} />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse" />
                
                {/* Image container */}
                <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full shadow-2xl" />
                <div className="absolute inset-[22px] overflow-hidden rounded-full border-4 border-white dark:border-gray-700 shadow-inner">
                  <Image
                    src="https://res.cloudinary.com/dubhzug5i/image/upload/v1746072702/apxlos1enrcbhgggqxmk.png"
                    alt="Rohit Sengar - Founder of NeuroFit"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Badge */}
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-xl">
                  <span className="text-sm font-medium">Since 2002</span>
                </div>
                
                {/* Floating badges */}
                <motion.div 
                  className="absolute -top-2 -left-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 p-3 rounded-full shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <FiAward className="w-6 h-6" />
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-6 left-1/4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 p-3 rounded-full shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                >
                  <IoRocket className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-1">
            <motion.div 
              className="w-1 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Bio Section */}
      <section ref={bioRef} className="pt-0 pb-24 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Background elements */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="bioVisible"
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                <motion.div 
                  variants={itemVariants}
                  className="w-full md:w-1/2 order-2 md:order-1"
                >
                  <div className="relative mb-6">
                    <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    <h4 className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider ml-2 mb-2">ABOUT ROHIT</h4>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    The Vision Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">NeuroFit</span>
                  </h2>
                  
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      Rohit Sengar founded NeuroFit with a clear mission: to make personalized fitness accessible to everyone. With a background in technology and a passion for health and wellness, Rohit identified a gap in the market for truly personalized fitness solutions that adapt to individual needs.
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      Under Rohit's leadership, NeuroFit has grown from a simple workout app to a comprehensive fitness ecosystem that combines AI-powered workout plans, nutrition guidance, and mental wellness support.
                    </p>
                  </div>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Tech Innovator</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Fitness Enthusiast</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Mental Health Advocate</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="w-full md:w-1/2 order-1 md:order-2 mb-10 md:mb-0"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-600 to-indigo-600"></div>
                    <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-indigo-600 to-blue-600"></div>
                    
                    <div className="aspect-w-4 aspect-h-3 w-full">
                      <Image
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                        alt="Rohit Sengar working on NeuroFit"
                        width={1000}
                        height={750}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-lg font-medium">Rohit working on the NeuroFit platform</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants} className="mb-20">
                <blockquote className="relative p-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg">
                  <div className="absolute top-4 left-4 text-7xl text-blue-300 dark:text-blue-700 opacity-50">"</div>
                  <div className="absolute bottom-4 right-4 text-7xl text-blue-300 dark:text-blue-700 opacity-50 rotate-180">"</div>
                  <div className="relative z-10">
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed text-center">
                      I believe that fitness should be a journey tailored to each person's unique body, goals, and lifestyle. With NeuroFit, we're using cutting-edge technology to create experiences that evolve with our users, helping them achieve sustainable results.
                    </p>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                          alt="Rohit Sengar"
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <cite className="text-gray-900 dark:text-white font-medium not-italic block">Rohit Sengar</cite>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Founder & CEO, NeuroFit</span>
                      </div>
                    </div>
                  </div>
                </blockquote>
              </motion.div>
              
              <div className="relative py-16">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                  Core <span className="text-blue-600 dark:text-blue-400">Values</span>
                </h3>
                
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                  <motion.div 
                    className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-600 relative overflow-hidden"
                    whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                      <IoFitness className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Pioneering AI-driven fitness solutions that adapt to individual progress and needs. We constantly push the boundaries of what's possible in fitness technology.
                    </p>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-tl-full -mb-8 -mr-8 z-0"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-600 relative overflow-hidden"
                    whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                      <RiTeamFill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Building a supportive ecosystem where users motivate each other to achieve their goals. We believe in the power of connection to drive lasting change.
                    </p>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-tl-full -mb-8 -mr-8 z-0"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-600 relative overflow-hidden"
                    whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                      <RiHeartPulseFill className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Wellness</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Promoting holistic health by integrating physical fitness with mental and nutritional wellbeing. We treat the whole person, not just their workout routine.
                    </p>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-tl-full -mb-8 -mr-8 z-0"></div>
                  </motion.div>
                </motion.div>
              </div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-1"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/3">
                      <div className="relative">
                        <div className="aspect-w-1 aspect-h-1">
                          <Image
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                            alt="NeuroFit mission"
                            width={400}
                            height={400}
                            className="object-cover rounded-xl"
                          />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg">
                          <span className="font-bold">Our Mission</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Democratizing Fitness</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                        My goal is to democratize fitness by making personalized training accessible to everyone, regardless of their experience level or background. NeuroFit is more than an app—it's a movement toward a healthier, happier world.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Personalized Experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Accessible Technology</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Global Community</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            The Entrepreneurial Journey
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <motion.div 
                className="flex flex-col md:flex-row gap-8 items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-full md:w-1/3">
                  <div className="relative h-60 w-full md:h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/journey-1.jpg"
                      alt="Early beginnings"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <span className="text-white font-bold">2020</span>
                        <h3 className="text-xl text-white font-semibold">The Beginning</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">From Idea to MVP</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    After years of personal fitness struggles and seeing friends and family face similar challenges, Rohit identified a gap in the market for truly personalized fitness solutions. In 2020, he launched the first version of NeuroFit with a small team of developers and fitness experts.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    The initial app focused on basic workout tracking and simple AI recommendations, but quickly gained traction among early adopters who appreciated the personalized approach.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col md:flex-row-reverse gap-8 items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-full md:w-1/3">
                  <div className="relative h-60 w-full md:h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/journey-2.jpg"
                      alt="Growth phase"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <span className="text-white font-bold">2022</span>
                        <h3 className="text-xl text-white font-semibold">Expansion</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scaling New Heights</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    By 2022, NeuroFit had grown to over 100,000 active users and secured its first major round of funding. Rohit expanded the team and enhanced the platform with advanced features including nutrition tracking, mental wellness modules, and social community elements.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    This period also saw the launch of NeuroFit's innovative "Neural Adaptation" technology, which uses machine learning to continuously optimize workout plans based on user feedback and progress.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col md:flex-row gap-8 items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-full md:w-1/3">
                  <div className="relative h-60 w-full md:h-80 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/journey-3.jpg"
                      alt="Present day"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <span className="text-white font-bold">2025</span>
                        <h3 className="text-xl text-white font-semibold">Today & Beyond</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transforming the Industry</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Today, NeuroFit stands as one of the leading fitness platforms globally, with millions of users across 30+ countries. Under Rohit's leadership, the company continues to push boundaries with innovations in AI, wearable integration, and personalized coaching.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Looking ahead, Rohit's vision includes expanding NeuroFit's reach to underserved communities and developing new technologies that make fitness even more accessible and enjoyable for people of all abilities.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Connect with Rohit</h2>
              <p className="text-xl opacity-90 mb-8">
                Interested in collaborating, speaking opportunities, or just want to say hello?
              </p>
              <Link href="https://rohitsengar.vercel.app/contact">
                <motion.button 
                  className="px-8 py-4 bg-white text-blue-600 rounded-full font-medium text-lg flex items-center justify-center mx-auto hover:bg-opacity-90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get in Touch
                  <FiArrowRight className="ml-2" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FounderPage;
