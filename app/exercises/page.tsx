'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaSearch } from 'react-icons/fa';
import Image from 'next/image';

interface Exercise {
  id: string;
  name: string;
  description: string;
  gifUrl: string;
}

export default function ExercisesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setError(null);

        // Fetch exercises from the correct collection
        const exercisesCollection = collection(db, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollection);
        
        const exercisesData = exercisesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Exercise',
            description: data.description || '',
            gifUrl: data.gifUrl || ''
          };
        });
        
        if (mounted) {
          setExercises(exercisesData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (mounted) {
          setError('Failed to load exercises. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl text-blue-500">
          <FaDumbbell />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Exercise Library
        </h1>
        
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 pr-6 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none shadow-lg"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </motion.div>
        
        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex h-48">
                  {/* Left side - GIF */}
                  <div className="w-1/2 relative">
                    {exercise.gifUrl ? (
                      <Image
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaDumbbell className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Exercise Info */}
                  <div className="w-1/2 p-4 flex flex-col justify-center">
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-xl font-semibold text-gray-800 mb-2"
                    >
                      {exercise.name}
                    </motion.h2>
                    {exercise.description && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-gray-600 text-sm line-clamp-3"
                      >
                        {exercise.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* No Results Message */}
          {filteredExercises.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <FaDumbbell className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No exercises found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search query
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
