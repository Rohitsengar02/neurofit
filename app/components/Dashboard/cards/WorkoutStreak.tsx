'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaDumbbell, FaRunning, FaBiking, FaSwimmer } from 'react-icons/fa';
import { IoMdFitness } from 'react-icons/io';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { format, subDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

interface WorkoutData {
  id: string;
  type: string;
  icon: React.ElementType;
  duration: string;
  calories: number;
  date: string;
  actualDate: Date;
}

const WorkoutStreak = () => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to determine workout type icon based on exercise names
  const getWorkoutTypeAndIcon = (exerciseDetails: any[]) => {
    if (!exerciseDetails || exerciseDetails.length === 0) {
      return { type: 'Workout', icon: FaDumbbell };
    }

    // Check first exercise name to determine type
    const firstExercise = exerciseDetails[0].name.toLowerCase();
    
    if (firstExercise.includes('run') || firstExercise.includes('jog') || firstExercise.includes('sprint')) {
      return { type: 'Running', icon: FaRunning };
    } else if (firstExercise.includes('bike') || firstExercise.includes('cycle') || firstExercise.includes('cycling')) {
      return { type: 'Cycling', icon: FaBiking };
    } else if (firstExercise.includes('swim')) {
      return { type: 'Swimming', icon: FaSwimmer };
    } else if (firstExercise.includes('yoga') || firstExercise.includes('stretch')) {
      return { type: 'Yoga', icon: IoMdFitness };
    } else {
      return { type: 'Workout', icon: FaDumbbell };
    }
  };

  // Format relative date (Today, Yesterday, etc.)
  const formatRelativeDate = (date: Date) => {
    const today = new Date();
    const diffDays = differenceInDays(today, date);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, 'MMM d');
  };

  // Calculate streak based on workout history
  const calculateStreak = (workouts: WorkoutData[]) => {
    if (workouts.length === 0) return 0;
    
    // Sort workouts by date (newest first)
    const sortedWorkouts = [...workouts].sort((a, b) => 
      b.actualDate.getTime() - a.actualDate.getTime()
    );
    
    let streak = 0;
    let bestStreak = 0;
    let currentDate = new Date();
    let consecutiveWeeks = 0;
    
    // Check if there's a workout today or yesterday
    const hasRecentWorkout = sortedWorkouts.some(workout => 
      differenceInDays(currentDate, workout.actualDate) <= 1
    );
    
    if (!hasRecentWorkout) {
      return 0; // Streak broken if no workout today or yesterday
    }
    
    // Group workouts by week
    const workoutsByWeek = new Map<string, WorkoutData[]>();
    
    sortedWorkouts.forEach(workout => {
      const weekStart = startOfWeek(workout.actualDate, { weekStartsOn: 1 }); // Monday as week start
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!workoutsByWeek.has(weekKey)) {
        workoutsByWeek.set(weekKey, []);
      }
      
      workoutsByWeek.get(weekKey)?.push(workout);
    });
    
    // Convert to array of [weekKey, workouts] pairs and sort by week (newest first)
    const sortedWeeks = Array.from(workoutsByWeek.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    
    // Check consecutive weeks with 6+ workouts (allowing one rest day)
    for (let i = 0; i < sortedWeeks.length; i++) {
      const [weekKey, weekWorkouts] = sortedWeeks[i];
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      // If this is not the first week, check if it's consecutive with the previous week
      if (i > 0) {
        const prevWeekKey = sortedWeeks[i-1][0];
        const prevWeekStart = new Date(prevWeekKey);
        
        // Check if weeks are consecutive
        if (differenceInDays(prevWeekStart, weekEnd) > 7) {
          break; // Break the streak if weeks are not consecutive
        }
      }
      
      // Check if this week has at least 6 workouts or 6 unique days with workouts
      const uniqueDays = new Set(weekWorkouts.map((w: WorkoutData) => format(w.actualDate, 'yyyy-MM-dd')));
      
      if (uniqueDays.size >= 6 || weekWorkouts.length >= 6) {
        consecutiveWeeks++;
      } else {
        break; // Break the streak if not enough workouts this week
      }
    }
    
    // Each consecutive week with 6+ workouts adds 7 to the streak
    streak = consecutiveWeeks * 7;
    
    // Cap streak at actual number of days with workouts
    const uniqueWorkoutDays = new Set(sortedWorkouts.map(w => format(w.actualDate, 'yyyy-MM-dd')));
    streak = Math.min(streak, uniqueWorkoutDays.size);
    
    return streak;
  };

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch workout stats from the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        const statsRef = collection(db, `users/${user.uid}/workoutStats`);
        const statsQuery = query(
          statsRef,
          where('date', '>=', thirtyDaysAgo),
          orderBy('date', 'desc')
        );
        
        const statsSnapshot = await getDocs(statsQuery);
        
        if (statsSnapshot.empty) {
          setWorkoutHistory([]);
          setCurrentStreak(0);
          setBestStreak(0);
          setLoading(false);
          return;
        }
        
        // Process workout data
        const workouts: WorkoutData[] = statsSnapshot.docs.map(doc => {
          const data = doc.data();
          const date = data.date instanceof Date ? data.date : data.date.toDate();
          const { type, icon } = getWorkoutTypeAndIcon(data.exerciseDetails);
          
          return {
            id: doc.id,
            type,
            icon,
            duration: `${Math.floor(data.totalTime / 60)} min`,
            calories: data.caloriesBurned,
            date: formatRelativeDate(date),
            actualDate: date
          };
        });
        
        setWorkoutHistory(workouts);
        
        // Calculate current streak
        const streak = calculateStreak(workouts);
        setCurrentStreak(streak);
        
        // Set best streak (in a real app, this would be stored in the user profile)
        setBestStreak(Math.max(streak, 14)); // Using 14 as a fallback best streak
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [user]);

  // Demo workout history data as fallback
  const demoWorkoutHistory = [
    { id: '1', type: 'Running', icon: FaRunning, duration: '45 min', calories: 320, date: 'Today', actualDate: new Date() },
    { id: '2', type: 'Cycling', icon: FaBiking, duration: '60 min', calories: 450, date: 'Yesterday', actualDate: subDays(new Date(), 1) },
    { id: '3', type: 'Swimming', icon: FaSwimmer, duration: '30 min', calories: 280, date: '2 days ago', actualDate: subDays(new Date(), 2) },
    { id: '4', type: 'Yoga', icon: IoMdFitness, duration: '40 min', calories: 180, date: '3 days ago', actualDate: subDays(new Date(), 3) },
    { id: '5', type: 'Running', icon: FaRunning, duration: '50 min', calories: 380, date: '4 days ago', actualDate: subDays(new Date(), 4) },
    { id: '6', type: 'Workout', icon: FaDumbbell, duration: '55 min', calories: 400, date: '5 days ago', actualDate: subDays(new Date(), 5) },
    { id: '7', type: 'Cycling', icon: FaBiking, duration: '45 min', calories: 350, date: '7 days ago', actualDate: subDays(new Date(), 7) },
  ];

  // Use real data if available, otherwise use demo data
  const displayWorkouts = workoutHistory.length > 0 ? workoutHistory : demoWorkoutHistory;
  const displayCurrentStreak = workoutHistory.length > 0 ? currentStreak : 7;
  const displayBestStreak = workoutHistory.length > 0 ? bestStreak : 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-800 rounded-2xl p-6 text-white"
    >
      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaFire className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <h3 className="text-lg font-semibold">Workout Streak</h3>
        </div>
        <div className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          Best: {displayBestStreak} days
        </div>
      </div>

      {/* Current Streak */}
      <div className="relative z-10 text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-1"
        >
          {displayCurrentStreak} Days
        </motion.div>
        <div className="text-sm opacity-80">Current Streak</div>
      </div>

      {/* Workout History - Horizontally Scrollable */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-4">Recent Workouts</h4>
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
            {displayWorkouts.slice(0, 5).map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2"
                style={{ minWidth: '140px' }}
              >
                <workout.icon className="w-6 h-6 mb-1" />
                <div className="text-sm font-medium">{workout.type}</div>
                <div className="text-xs opacity-80">{workout.duration}</div>
                <div className="text-xs opacity-80">{workout.calories} cal</div>
                <div className="text-xs opacity-60">{workout.date}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex justify-between items-center text-sm">
          <span className="opacity-80">This Week</span>
          <span className="font-medium">4 workouts · 890 cal</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutStreak;
