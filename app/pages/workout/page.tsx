'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';
import { collection, getDocs, doc, getDoc, query, where, Firestore } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { WorkoutCategory, Workout, ActiveWorkout } from '@/app/types/workout';
import { Clock, Activity, ChevronRight, CalendarDays, Dumbbell, Flame, Target, Trophy, Zap, Timer, Sparkles } from 'lucide-react';
import WorkoutCommitment from '@/app/components/Workout/WorkoutCommitment';
import { addActiveWorkout } from '@/app/firebase/services/activeWorkouts';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ActiveWorkouts from '@/app/pages/workout/components/ActiveWorkouts';

// UI Components
const Card = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

const Button = ({ className = '', children, onClick }: { className?: string, children: React.ReactNode, onClick?: () => void }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Shadcn-inspired components

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">{children}</div>
);

const CardFooter = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const glowAnimation = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const shimmerAnimation = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: "easeInOut"
    }
  }
};

export default function WorkoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  const [isCommitmentOpen, setIsCommitmentOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!db) {
          throw new Error('Firebase DB not initialized');
        }
        const categoriesRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesRef);
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WorkoutCategory[];
        
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (err) {
        setWorkoutError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch workouts when selected category changes
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!selectedCategory || !db) return;
      
      setLoading(true);
      try {
        const workoutsRef = collection(db, `categories/${selectedCategory}/workouts`);
        const querySnapshot = await getDocs(workoutsRef);
        const workoutsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        
        setWorkouts(workoutsData);
      } catch (err) {
        setWorkoutError('Failed to load workouts');
        console.error('Error fetching workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleWorkoutClick = (workout: Workout) => {
    console.log('Selected workout:', workout);
    setSelectedWorkout(workout);
    setIsCommitmentOpen(true);
  };

  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const handleCommit = async (): Promise<string | undefined> => {
    if (!selectedWorkout || !user) {
      console.error('Missing required data:', { selectedWorkout, user });
      return undefined;
    }

    try {
      // Get the category name from categories state instead of fetching
      const category = categories.find(cat => cat.id === selectedCategory);
      if (!category) {
        throw new Error('Category not found');
      }

      // Create active workout object with required fields
      const newActiveWorkout: ActiveWorkout = {
        
        workoutId: selectedWorkout.id,
        originalWorkoutId: selectedWorkout.id,
        categoryId: selectedCategory || '',
        categoryName: category.name,
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedWorkout.days * 24 * 60 * 60 * 1000),
        completedDays: [],
        title: selectedWorkout.title,
        imageUrl: selectedWorkout.imageUrl,
        level: selectedWorkout.level,
        totalDays: selectedWorkout.days,
        caloriesPerDay: selectedWorkout.caloriesPerDay,
        status: 'active'
      };

      // Validate required fields
      const requiredFields = ['workoutId', 'categoryId', 'categoryName', 'title', 'imageUrl', 'level', 'totalDays', 'caloriesPerDay'];
      const missingFields = requiredFields.filter(field => !newActiveWorkout[field as keyof ActiveWorkout]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Add to Firebase
      const result = await addActiveWorkout(user.uid, newActiveWorkout);
      
      if (result.success) {
        // Store the active workout ID for the WorkoutCommitment component to use
        const workoutId = result.id;
        console.log('Created active workout with ID:', workoutId);
        setActiveWorkoutId(workoutId || null);
        return workoutId;
      } else {
        throw new Error('Failed to add active workout');
      }
    } catch (error) {
      console.error('Error in handleCommit:', error);
      setWorkoutError(error instanceof Error ? error.message : 'Failed to start workout');
      return undefined;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Beginner':
        return <Dumbbell className="w-5 h-5" />;
      case 'Intermediate':
        return <Flame className="w-5 h-5" />;
      case 'Advanced':
        return <Zap className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ActiveWorkouts />
        {/* Categories Section */}
        <section className="mb-12 relative">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Categories
          </h2>
          
          <div className="relative">
            {loading ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : workoutError ? (
              <div className="text-red-500 dark:text-red-400">{workoutError}</div>
            ) : (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide relative">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    className={`flex-shrink-0 cursor-pointer group`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="relative mt-[5px]">
                      {/* Category Icon Container */}
                      <div 
                        className={`w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] rounded-full flex items-center justify-center 
                          ${selectedCategory === category.id 
                            ? 'ring-2 sm:ring-4 ring-blue-500 ring-offset-2 sm:ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-900' 
                            : ''
                          }
                          transition-all duration-300 ease-in-out
                          shadow-[0_4px_15px_rgb(0,0,0,0.1)]
                          group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]
                          backdrop-blur-sm bg-opacity-90
                          group-hover:bg-opacity-100`}
                        style={{ backgroundColor: category.backgroundColor }}
                      >
                        <div className="relative w-[35px] h-[35px] sm:w-[50px] sm:h-[50px]">
                          <Image
                            src={category.iconUrl}
                            alt={category.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      
                      {/* Category Name */}
                      <motion.p 
                        className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 text-center mt-2 sm:mt-3
                          line-clamp-1 max-w-[70px] sm:max-w-[100px] mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {category.name}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Gradient Shadows for Scroll Indication */}
            <div className="absolute left-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
          </div>

          {/* Custom Scrollbar Styles */}
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>

        {/* Workouts Grid */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {selectedCategory && categories.find(category => category.id === selectedCategory)?.name} Workouts
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg" />
                  <CardHeader>
                    <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : workoutError ? (
            <div className="text-red-500 dark:text-red-400">{workoutError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-500 backdrop-blur-sm
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-3xl border-0 bg-black/80">
                    <div className="relative h-[450px] w-full overflow-hidden">
                      <Image
                        src={workout.imageUrl}
                        alt={workout.title}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-75"
                      />
                      
                      {/* Animated Gradient Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 mix-blend-overlay"
                        animate={{
                          opacity: [0.3, 0.5, 0.3],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Top badges row */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                        <div className="flex gap-2">
                          {/* Level Badge */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Badge 
                              className="bg-amber-400/90 text-black px-3 py-1 text-xs font-medium rounded-full
                                backdrop-blur-md shadow-lg flex items-center gap-1.5"
                            >
                              {getLevelIcon(workout.level)}
                              {workout.level}
                            </Badge>
                          </motion.div>

                          {/* Duration Badge */}
                          
                        </div>

                        {/* Challenge Badge */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Badge 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-medium 
                              rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Challenge
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t 
                        from-black via-black/80 to-transparent">
                        {/* Title & Progress */}
                        <div className="flex items-center justify-between mb-2">
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl font-bold text-white flex items-center gap-2"
                          >
                            {workout.title}
                            
                          </motion.h3>
                          <span className="text-sm text-gray-400">Progress: 0/30</span>
                        </div>

                        {/* Description */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-sm text-gray-300 mb-4 line-clamp-2"
                        >
                          {workout.description}
                        </motion.p>

                        {/* Stats Grid */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="grid grid-cols-3 gap-3 mb-4"
                        >
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                            <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                            <span className="text-xs text-gray-300 block">Duration</span>
                            <span className="text-sm text-white font-medium">{workout.days} days</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                            <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                            <span className="text-xs text-gray-300 block">Calories</span>
                            {loading ? (
                              <div className="h-5 w-16 bg-white/20 rounded animate-pulse mx-auto" />
                            ) : (
                              <span className="text-sm text-white font-medium">
                                {workout.caloriesPerDay ? 
                                  `${workout.caloriesPerDay.toLocaleString()}/day` : 
                                  'N/A'
                                }
                              </span>
                            )}
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                            <Target className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-300 block">Exercises</span>
                            <span className="text-sm text-white font-medium">6-7/day</span>
                          </div>
                        </motion.div>

                        {/* Start Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                              hover:to-indigo-700 text-white text-sm py-4 rounded-xl
                              flex items-center justify-center gap-2 group/btn transition-all duration-300
                              hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                            onClick={() => handleWorkoutClick(workout)}
                          >
                            <span>Start Challenge</span>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
      {isCommitmentOpen && selectedWorkout && (
        <WorkoutCommitment
          isOpen={isCommitmentOpen}
          onClose={() => setIsCommitmentOpen(false)}
          onCommit={handleCommit}
          workout={selectedWorkout}
          workoutId={activeWorkoutId || selectedWorkout.id}
        />
      )}
    </div>
  );
}
