'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DietPlanCard from '../../components/Diet/DietPlanCard';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

interface DietCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  tags: string[];
}

interface DietPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  targetGroup: string[];
  calories: {
    min: number;
    max: number;
  };
  image: string;
}

const DietCategoryPage = () => {
  const params = useParams();
  const [category, setCategory] = useState<DietCategory | null>(null);
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategoryAndPlans = async () => {
      try {
        if (params.categoryId) {
          // Fetch category details
          const categoryDoc = await getDoc(doc(db, 'dietCategories', params.categoryId as string));
          if (categoryDoc.exists()) {
            setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as DietCategory);
          }

          // Fetch diet plans
          const plansQuery = query(
            collection(db, `dietCategories/${params.categoryId}/diets`),
            where('isActive', '==', true)
          );
          const plansSnapshot = await getDocs(plansQuery);
          const plansData = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as DietPlan[];
          setPlans(plansData);
        }
      } catch (error) {
        console.error('Error fetching category and plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndPlans();
  }, [params.categoryId]);

  const scrollPlans = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const filteredPlans = plans.filter(plan => 
    selectedDifficulty === 'all' || plan.difficulty === selectedDifficulty
  );

  if (loading || !category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 
                              dark:group-hover:text-blue-400 transition-colors" />
        </motion.button>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {category.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-sm rounded-full"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {category.name}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {category.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Plans Slider */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured Diet Plans
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollPlans('left')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => scrollPlans('right')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors"
              >
                <FaChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <div className="flex gap-6 pb-4">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="min-w-[300px] md:min-w-[350px]"
                >
                  <DietPlanCard plan={plan} categoryId={category.id} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Plans Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Diet Plans
          </h2>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 
                     bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 
                     focus:ring-blue-500 transition-all"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DietPlanCard plan={plan} categoryId={category.id} />
            </motion.div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl text-gray-600 dark:text-gray-400">
              No diet plans found for the selected difficulty level
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietCategoryPage;
