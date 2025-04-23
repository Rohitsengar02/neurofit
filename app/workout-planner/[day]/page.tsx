'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaPlus, FaClock, FaTimes, FaArrowLeft, FaPlay, FaPause, FaFire, FaTrophy, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Import the ExerciseSet component with correct case sensitivity
import ExerciseSet from '@/app/components/Workout/ExerciseSet';
import { useAuth } from '@/app/hooks/useAuth';



interface Set {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  gifUrl: string;
  sets: Set[];
  restTime: number;
}

interface WorkoutState {
  isActive: boolean;
  startTime: number | null;
  pauseTime: number | null;
  totalTime: number;
}

interface WorkoutSummary {
  totalTime: number;
  exercises: {
    name: string;
    completedSets: number;
    totalWeight: number;
    totalReps: number;
  }[];
  totalCalories: number;
  date: string;
}

export default function DayWorkoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    isActive: false,
    startTime: null,
    pauseTime: null,
    totalTime: 0
  });

  const dayName = typeof params?.day === 'string' 
    ? params.day.charAt(0).toUpperCase() + params.day.slice(1)
    : '';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (workoutState.isActive && workoutState.startTime) {
      timer = setInterval(() => {
        const now = Date.now();
        setWorkoutState(prev => ({
          ...prev,
          totalTime: prev.totalTime + (now - (prev.startTime || now))
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [workoutState.isActive, workoutState.startTime]);

  const startWorkout = () => {
    setWorkoutState({
      isActive: true,
      startTime: Date.now(),
      pauseTime: null,
      totalTime: 0
    });
  };

  const pauseWorkout = () => {
    setWorkoutState(prev => ({
      ...prev,
      isActive: false,
      pauseTime: Date.now()
    }));
  };

  const resumeWorkout = () => {
    if (!workoutState.pauseTime) return;
    
    setWorkoutState(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
      totalTime: prev.totalTime + (prev.pauseTime ? Date.now() - prev.pauseTime : 0),
      pauseTime: null
    }));
  };

  const finishWorkout = async () => {
    if (!workoutState.isActive && !workoutState.pauseTime) return;

    const endTime = Date.now();
    const totalTime = workoutState.totalTime + (endTime - (workoutState.startTime || endTime));

    const summary: WorkoutSummary = {
      totalTime,
      exercises: exercises.map(ex => ({
        name: ex.name,
        completedSets: ex.sets.filter(s => s.isCompleted).length,
        totalWeight: ex.sets.reduce((sum, s) => sum + (s.isCompleted ? s.weight : 0), 0),
        totalReps: ex.sets.reduce((sum, s) => sum + (s.isCompleted ? s.reps : 0), 0)
      })),
      totalCalories: calculateCalories(exercises),
      date: new Date().toISOString()
    };

    setWorkoutSummary(summary);
    setShowSummary(true);
  };

  const handleSaveAndExit = async () => {
    try {
      if (user && workoutSummary) {
        // Save to current day workout
        const currentWorkoutRef = doc(db, `users/${user.uid}/customWorkout/currentDayWorkout`);
        await setDoc(currentWorkoutRef, {
          day: params.day,
          ...workoutSummary,
          exercises: exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(set => ({
              ...set,
              isCompleted: false // Reset completion status
            }))
          }))
        });

        // Reset workout state
        setWorkoutState({
          isActive: false,
          startTime: null,
          pauseTime: null,
          totalTime: 0
        });

        setShowSummary(false);

        // Refresh the exercises with reset completion status
        setExercises(prev => prev.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
            ...set,
            isCompleted: false
          }))
        })));

        router.push('/workout-planner');
      }
    } catch (err) {
      console.error('Error saving workout:', err);
      setError('Failed to save workout data');
    }
  };

  const calculateCalories = (exercises: Exercise[]) => {
    // Simple calorie calculation based on weight and reps
    // You can make this more sophisticated based on exercise type and intensity
    const MET = 5; // Metabolic equivalent for moderate exercise
    const WEIGHT_KG = 70; // Default weight if not available
    const caloriesPerMinute = (MET * 3.5 * WEIGHT_KG) / 200;
    const totalMinutes = workoutState.totalTime / 60000; // Convert ms to minutes
    return Math.round(caloriesPerMinute * totalMinutes);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // First check if there's a current workout for this day
      if (user) {
        const currentWorkoutRef = doc(db, `users/${user.uid}/customWorkout/currentDayWorkout`);
        const currentWorkoutSnap = await getDoc(currentWorkoutRef);
        
        if (currentWorkoutSnap.exists()) {
          const currentWorkout = currentWorkoutSnap.data();
          if (currentWorkout.day === params.day) {
            // Load the current workout exercises
            setExercises(currentWorkout.exercises);
            setLoading(false);
            return;
          }
        }
      }
      
      // If no current workout, load from local storage or Firebase as before
      const localStorageKey = `workout-${params.day}`;
      const savedExercises = localStorage.getItem(localStorageKey);
      if (savedExercises) {
        setExercises(JSON.parse(savedExercises));
      }
      
      if (user) {
        const dayDoc = doc(db, `users/${user.uid}/customWorkouts/${params.day}`);
        const daySnapshot = await getDoc(dayDoc);
        
        if (daySnapshot.exists()) {
          setExercises(daySnapshot.data().exercises || []);
        }
      }

      // Fetch available exercises
      const exercisesRef = collection(db, 'exercises');
      const exercisesSnapshot = await getDocs(exercisesRef);
      const exercisesData = exercisesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sets: [{
          id: '1',
          reps: 12,
          weight: 0,
          isCompleted: false
        }],
        restTime: 60
      } as Exercise));
      setAvailableExercises(exercisesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updatedExercises: Exercise[]) => {
    // Always save to local storage
    const localStorageKey = `workout-${params.day}`;
    localStorage.setItem(localStorageKey, JSON.stringify(updatedExercises));
    
    // If user is logged in, also save to Firebase
    if (user) {
      try {
        const dayDoc = doc(db, `users/${user.uid}/customWorkouts/${params.day}`);
        await setDoc(dayDoc, { exercises: updatedExercises }, { merge: true });
      } catch (err) {
        console.error('Error saving to Firebase:', err);
        setError('Changes saved locally but failed to sync with cloud');
      }
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const updatedExercises = [...exercises, exercise];
    setExercises(updatedExercises);
    saveData(updatedExercises);
    setShowExerciseSelector(false);
  };

  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: (ex.sets.length + 1).toString(),
              reps: ex.sets[0].reps,
              weight: ex.sets[0].weight,
              isCompleted: false
            }
          ]
        };
      }
      return ex;
    });
    setExercises(updatedExercises);
    saveData(updatedExercises);
  };

  const handleUpdateSet = (exerciseId: string, setId: string, updates: { reps?: number; weight?: number; isCompleted?: boolean }) => {
    setExercises(prevExercises => {
      const newExercises = [...prevExercises];
      const exerciseIndex = newExercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) return prevExercises;

      const exercise = { ...newExercises[exerciseIndex] };
      const setIndex = exercise.sets.findIndex(s => s.id === setId);
      if (setIndex === -1) return prevExercises;

      exercise.sets[setIndex] = {
        ...exercise.sets[setIndex],
        ...updates
      };

      newExercises[exerciseIndex] = exercise;
      saveData(newExercises);
      return newExercises;
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
    setExercises(updatedExercises);
    saveData(updatedExercises);
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(set => set.id !== setId)
        };
      }
      return ex;
    });
    setExercises(updatedExercises);
    saveData(updatedExercises);
  };

  const handleUpdateRestTime = (exerciseId: string, restTime: number) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          restTime
        };
      }
      return ex;
    });
    setExercises(updatedExercises);
    saveData(updatedExercises);
  };

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, [params.day, user]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header with Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {dayName}'s Workout
            </h1>
            {(workoutState.isActive || workoutState.pauseTime) && (
              <div className="mt-2 font-mono text-2xl font-bold text-gray-700">
                {formatTime(workoutState.totalTime)}
              </div>
            )}
          </div>
        </div>

        {/* Workout Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {!workoutState.isActive && !workoutState.pauseTime ? (
            <button
              onClick={startWorkout}
              className="col-span-2 sm:col-span-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FaPlay /> Start Workout
            </button>
          ) : (
            <>
              {workoutState.isActive ? (
                <button
                  onClick={pauseWorkout}
                  className="col-span-1 sm:col-span-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaPause /> Pause Workout
                </button>
              ) : (
                <button
                  onClick={resumeWorkout}
                  className="col-span-1 sm:col-span-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaPlay /> Resume Workout
                </button>
              )}
              <button
                onClick={finishWorkout}
                className="col-span-1 sm:col-span-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FaDumbbell /> Finish Workout
              </button>
            </>
          )}
        </div>

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExerciseSelector(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl mb-8 font-semibold"
        >
          <FaPlus className="text-white" /> Add Exercise
        </button>

        {/* Exercise List */}
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              {/* Exercise Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Exercise GIF */}
                  <div className="w-full sm:w-48 h-48 sm:h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                    {exercise.gifUrl ? (
                      <Image
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaDumbbell className="text-5xl text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Exercise Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {exercise.name}
                        </h3>
                        {exercise.description && (
                          <p className="text-gray-600 text-sm sm:text-base line-clamp-2 sm:line-clamp-none mb-4">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* Rest Timer Control */}
                    <div className="mt-auto">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <FaClock className="text-blue-500" />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={exercise.restTime}
                            onChange={(e) => handleUpdateRestTime(exercise.id, parseInt(e.target.value))}
                            className="w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                            min="0"
                            step="5"
                          />
                          <span className="text-sm text-gray-600 font-medium">sec rest</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sets */}
              <div className="p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                <div className="grid gap-4">
                  {exercise.sets.map((set) => (
                    <ExerciseSet
                      key={set.id}
                      setNumber={parseInt(set.id)}
                      reps={set.reps}
                      weight={set.weight}
                      isCompleted={set.isCompleted}
                      restTime={exercise.restTime}
                      onUpdateSet={(updates: { reps?: number; weight?: number; isCompleted?: boolean }) => handleUpdateSet(exercise.id, set.id, updates)}
                      onComplete={() => handleUpdateSet(exercise.id, set.id, { isCompleted: true })}
                      onRemove={() => handleRemoveSet(exercise.id, set.id)}
                    />
                  ))}
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="w-full mt-6 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <FaPlus className="text-gray-500" /> Add Set
                </button>
              </div>
            </motion.div>
          ))}

          {exercises.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-4 rounded-2xl bg-white shadow-sm border border-gray-100"
            >
              <FaDumbbell className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No exercises added yet. Click "Add Exercise" to begin.
              </p>
            </motion.div>
          )}
        </div>

        {/* Exercise Selector Modal */}
        <AnimatePresence>
          {showExerciseSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      Add Exercise
                    </h2>
                    <button
                      onClick={() => setShowExerciseSelector(false)}
                      className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Search exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
                    />
                    <FaDumbbell className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Exercise List */}
                  <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2 custom-scrollbar">
                    {filteredExercises.map((exercise) => (
                      <motion.button
                        key={exercise.id}
                        onClick={() => handleAddExercise(exercise)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {exercise.gifUrl ? (
                              <Image
                                src={exercise.gifUrl}
                                alt={exercise.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaDumbbell className="text-4xl text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {exercise.name}
                            </h3>
                            {exercise.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {exercise.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}

                    {filteredExercises.length === 0 && (
                      <div className="text-center py-12">
                        <FaDumbbell className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No exercises found matching your search.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSummary && workoutSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white mb-4"
                  >
                    <FaTrophy size={40} />
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                    Workout Complete!
                  </h2>
                  <p className="text-gray-600">Great job on completing your workout!</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center"
                  >
                    <FaClock className="mx-auto text-blue-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-blue-700">
                      {formatTime(workoutSummary.totalTime)}
                    </div>
                    <div className="text-sm text-blue-600">Duration</div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl text-center"
                  >
                    <FaFire className="mx-auto text-orange-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-orange-700">
                      {workoutSummary.totalCalories}
                    </div>
                    <div className="text-sm text-orange-600">Calories</div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold mb-4">Exercise Summary</h3>
                  <div className="space-y-4">
                    {workoutSummary.exercises.map((ex, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="bg-gray-50 p-4 rounded-xl"
                      >
                        <div className="font-medium text-gray-800">{ex.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {ex.completedSets} sets • {ex.totalReps} total reps • {ex.totalWeight}kg total weight
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={handleSaveAndExit}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Done
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ... (keep existing exercise list and other components) ... */}
      </div>
    </div>
  );
}
