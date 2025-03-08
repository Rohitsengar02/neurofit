'use client';
import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ActiveWorkout {
  id: string;
  title: string;
  categoryName: string;
  imageUrl: string;
  level: string;
  startDate: string;
  totalDays: number;
}

const ActiveWorkouts = () => {
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveWorkouts = async () => {
      if (!user) return;

      try {
        const workoutsRef = collection(db, `users/${user.uid}/activeWorkouts`); 
        const querySnapshot = await getDocs(workoutsRef);
        
        const workouts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActiveWorkout[];

        setActiveWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching active workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkouts();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="flex space-x-4 overflow-x-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-72">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-40 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeWorkouts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-2xl font-bold text-gray-800 dark:text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Active Workouts
        </motion.h2>

        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {activeWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              className="flex-none w-72"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className="relative h-40">
                  <Image
                    src={workout.imageUrl}
                    alt={workout.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                      {workout.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {workout.categoryName}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-xs font-medium">
                      {workout.level}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {workout.totalDays} days
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <motion.div
                        className="absolute left-0 top-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkouts;
