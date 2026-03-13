'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaSearch, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import {
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  collection,
  getDocs
} from 'firebase/firestore';

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  gifUrl?: string;
  category?: string;
  gender?: string;
  imageUrl?: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const PAGE_SIZE = 12;

  // Initialize Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'exerciseCategories'));
        const catData = categoriesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data().name);
        setCategories(['All', ...catData]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchData = async (isLoadMore = false) => {
    if (loading || loadingMore) return;
    if (!isLoadMore) {
      setLoading(true);
      setExercises([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const exercisesCollection = collection(db, 'exercises');
      // Query all exercises
      let q = query(
        exercisesCollection,
        orderBy('name'),
        limit(PAGE_SIZE)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);

      const newExercises = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];

      if (isLoadMore) {
        setExercises(prev => [...prev, ...newExercises]);
      } else {
        setExercises(newExercises);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] as any || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load exercises.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset and fetch on search change
  useEffect(() => {
    fetchData();
  }, []);

  // Load more on scroll
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchData(true);
    }
  }, [inView, hasMore]);

  const filteredExercises = exercises.filter(exercise => {
    return exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          className="mb-8 max-w-4xl mx-auto space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 pr-6 text-lg rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300 outline-none"
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
                <div className="relative group">
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {exercise.videoUrl ? (
                      <video
                        src={exercise.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        poster={exercise.imageUrl}
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : exercise.gifUrl ? (
                      <Image
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaDumbbell className="text-4xl text-gray-400" />
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded-lg border border-white/20">
                        {exercise.category}
                      </span>
                      <span className={`px-2 py-1 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded-lg border border-white/20 ${exercise.gender === 'men' ? 'bg-indigo-500/50' : 'bg-pink-500/50'}`}>
                        {exercise.gender}
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {exercise.name}
                    </h2>
                    {exercise.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* No Results Message */}
          {!loading && filteredExercises.length === 0 && (
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
                Try adjusting your search query or filters
              </p>
            </motion.div>
          )}

          {/* Loading More Spinner / Intersection Observer Target */}
          {hasMore && (
            <div ref={ref} className="col-span-full py-10 flex justify-center">
              {(loading || loadingMore) && (
                <div className="flex items-center gap-3 text-blue-500 font-bold">
                  <FaSpinner className="animate-spin text-2xl" />
                  <span>Loading more amazing exercises...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
