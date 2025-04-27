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
  const [categoryWorkouts, setCategoryWorkouts] = useState<{ [key: string]: Workout[] }>({});
  const [loading, setLoading] = useState(true);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  const [isCommitmentOpen, setIsCommitmentOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

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
        
        // Initialize workouts for each category
        const workoutsObj: { [key: string]: Workout[] } = {};
        categoriesData.forEach(category => {
          workoutsObj[category.id] = [];
        });
        setCategoryWorkouts(workoutsObj);
        
        // Fetch workouts for all categories
        await Promise.all(
          categoriesData.map(category => fetchWorkoutsForCategory(category.id))
        );
      } catch (err) {
        setWorkoutError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch workouts for a specific category
  const fetchWorkoutsForCategory = async (categoryId: string) => {
    if (!categoryId || !db) return;
    
    try {
      const workoutsRef = collection(db, `categories/${categoryId}/workouts`);
      const querySnapshot = await getDocs(workoutsRef);
      const workoutsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        categoryId: categoryId, // Add categoryId to each workout
        ...doc.data()
      })) as Workout[];
      
      setCategoryWorkouts(prev => ({
        ...prev,
        [categoryId]: workoutsData
      }));
    } catch (err) {
      console.error(`Error fetching workouts for category ${categoryId}:`, err);
    }
  };

  const handleWorkoutClick = (workout: Workout) => {
    console.log('Selected workout:', workout);
    setSelectedWorkout(workout);
    setIsCommitmentOpen(true);
  };

  const handleCommit = async (): Promise<string | undefined> => {
    if (!selectedWorkout || !user) {
      console.error('Missing required data:', { selectedWorkout, user });
      return undefined;
    }

    try {
      // Get the category name from categories state instead of fetching
      const category = categories.find(cat => cat.id === selectedWorkout.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Create active workout object with required fields
      const newActiveWorkout: ActiveWorkout = {
        workoutId: selectedWorkout.id,
        originalWorkoutId: selectedWorkout.id,
        categoryId: selectedWorkout.categoryId || '',
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
        {/* Active Workouts - Horizontal Scrollable Section */}
        <section className=" relative">
         
          
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <ActiveWorkouts />
            </div>
            
            {/* Gradient Shadows for Scroll Indication */}
            <div className="absolute left-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
          </div>
        </section>

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

        {/* Categories and their Workouts */}
        {loading ? (
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex-shrink-0 w-[250px] h-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : workoutError ? (
          <div className="text-red-500 dark:text-red-400">{workoutError}</div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category.id} className="space-y-6">
                {/* Category Header with Icon */}
                <div className="flex items-center gap-3 mb-4">
                 
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                </div>
                
                {/* Workouts for this category - Horizontal Scrollable */}
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                    {categoryWorkouts[category.id]?.length > 0 ? (
                      categoryWorkouts[category.id].map((workout) => (
                        <motion.div
                          key={workout.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                          className="group flex-shrink-0 w-[280px] sm:w-[320px]"
                        >
                          <Card className="overflow-hidden transition-all duration-500 backdrop-blur-sm
                            hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-3xl border-0 bg-black/80 h-full">
                            <div className="relative h-[400px] w-full overflow-hidden">
                              <Image
                                src={workout.imageUrl}
                                alt={workout.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
                              
                              {/* Floating Elements */}
                              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                <div className="flex justify-between">
                                  <Badge className={`${getLevelColor(workout.level)} flex items-center gap-1.5`}>
                                    {getLevelIcon(workout.level)}
                                    {workout.level}
                                  </Badge>
                                  <motion.div 
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
                                    {...glowAnimation}
                                  >
                                    <CalendarDays className="w-5 h-5" />
                                  </motion.div>
                                </div>
                                
                                <div>
                                  
                                  
                                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                                    {workout.title}
                                  </h3>
                                  
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                                      <Clock className="w-4 h-4" />
                                      <span>30-40 min</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                                      <Activity className="w-4 h-4" />
                                      <span>{workout.caloriesPerDay} cal</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                                      <Trophy className="w-4 h-4" />
                                      <span>{workout.days} days</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-3">
                                    <Button 
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
                                      onClick={() => handleWorkoutClick(workout)}
                                    >
                                      Start Challenge
                                    </Button>
                                    <motion.button
                                      className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
                                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center w-full py-12 text-gray-500 dark:text-gray-400">
                        No workouts available for this category
                      </div>
                    )}
                  </div>
                  
                  {/* Gradient Shadows for Scroll Indication */}
                  <div className="absolute left-0 top-0 bottom-6 w-8 sm:w-12 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
                  <div className="absolute right-0 top-0 bottom-6 w-8 sm:w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
                </div>
              </div>
            ))}
          </div>
        )}
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
