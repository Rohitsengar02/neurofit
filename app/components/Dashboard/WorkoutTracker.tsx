'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaFire, FaCalendarCheck, FaClock, FaBullseye, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { db, auth } from '@/app/firebase/config';
import { 
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { format } from 'date-fns';
import '@/app/styles/animations.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutEntry {
  id: string;
  date: Date;
  duration: number;
  type: string;
  calories: number;
}

interface WorkoutTrackerProps {
  userData: any;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: WorkoutEntry | null;
  onSave: (duration: string, type: string) => void;
}

interface CustomChartData extends ChartData<'bar'> {
  datasets: {
    data: number[];
    backgroundColor: string;
    borderRadius: number;
    borderSkipped: boolean;
    hoverBackgroundColor: string;
    workoutCounts: number[];
  }[];
}

interface CustomTooltip extends Omit<ChartOptions<'bar'>['plugins'], 'tooltip'> {
  tooltip?: {
    backgroundColor: string;
    titleColor: string;
    bodyColor: string;
    padding: number;
    displayColors: boolean;
    callbacks: {
      label(context: any): string | string[];
    };
  };
}

const workoutTypes = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'cycling', label: 'Cycling' }
];

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const EditModal = ({ entry, isOpen, onClose, onSave }: EditModalProps) => {
  const [duration, setDuration] = useState(entry?.duration.toString() || '');
  const [type, setType] = useState(entry?.type || 'cardio');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
      setError('Please enter a valid duration between 1 and 300 minutes');
      return;
    }
    await onSave(durationNum.toString(), type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Workout Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workout Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              {workoutTypes.map(type => (
                <option key={type.value} value={type.value} className="text-gray-900">
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setError('');
              }}
              min="1"
              max="300"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function WorkoutTracker({ userData }: WorkoutTrackerProps) {
  const [selectedTab, setSelectedTab] = useState('6months');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState('');
  const [newWorkoutType, setNewWorkoutType] = useState('cardio');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState<WorkoutEntry | null>(null);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<CustomChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: 'rgb(129, 140, 248)',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgb(99, 102, 241)',
        workoutCounts: []
      }
    ]
  });

  const [chartOptions, setChartOptions] = useState<ChartOptions<'bar'>>({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const workoutCount = (chartData.datasets[datasetIndex] as any).workoutCounts[index];
            const duration = context.parsed.y;
            const workoutText = workoutCount === 1 ? 'workout' : 'workouts';
            return [
              `Total Duration: ${duration} minutes`,
              `${workoutCount} ${workoutText}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          stepSize: 1,
          color: '#6B7280'
        }
      }
    }
  });

  const formatChartDate = (date: Date) => {
    return format(date, 'MMM d');
  };

  const loadWorkoutHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to view workouts');
        return;
      }

      setLoading(true);

      const workoutsRef = collection(db, 'workouts');
      const q = query(
        workoutsRef,
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const workoutDate = data.date.toDate();
        return {
          id: doc.id,
          date: workoutDate,
          duration: Number(data.duration) || 0,
          type: data.type,
          calories: Number(data.calories) || 0
        } as WorkoutEntry;
      });

      // Sort workouts by date client-side
      const sortedWorkouts = workouts.sort((a, b) => b.date.getTime() - a.date.getTime());
      setWorkoutHistory(sortedWorkouts);
      
      // Get dates for the last 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
        return date;
      });

      // Create a map to store workouts by date
      const workoutsByDate = new Map<string, WorkoutEntry[]>();

      // Group workouts by date
      sortedWorkouts.forEach(workout => {
        const dateStr = workout.date.toISOString().split('T')[0];
        const existingWorkouts = workoutsByDate.get(dateStr) || [];
        existingWorkouts.push(workout);
        workoutsByDate.set(dateStr, existingWorkouts);
      });

      // Create chart data
      const chartLabels = dates.map(date => formatChartDate(date));
      const chartDurations = dates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const workouts = workoutsByDate.get(dateStr) || [];
        return workouts.reduce((sum: number, workout: WorkoutEntry) => sum + workout.duration, 0);
      });

      // Count workouts per day for tooltip
      const workoutCounts = dates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const workouts = workoutsByDate.get(dateStr) || [];
        return workouts.length;
      });

      // Update chart data
      setChartData({
        labels: chartLabels,
        datasets: [{
          data: chartDurations,
          backgroundColor: 'rgb(129, 140, 248)',
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgb(99, 102, 241)',
          workoutCounts: workoutCounts
        }]
      });

    } catch (error) {
      console.error('Error loading workouts:', error);
      if (error instanceof FirestoreError) {
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please make sure you are signed in.');
        } else {
          setError(`Failed to load workouts: ${error.message}`);
        }
      } else {
        setError('Failed to load workouts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadWorkoutHistory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddWorkout = async (e: any) => {
    e.preventDefault();
    
    if (!newWorkoutDuration || parseInt(newWorkoutDuration) < 1 || parseInt(newWorkoutDuration) > 300) {
      setError('Please enter a valid duration between 1 and 300 minutes.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to add workouts');
        return;
      }

      const caloriesPerMinute = 5;
      const calories = parseInt(newWorkoutDuration) * caloriesPerMinute;

      const workoutData = {
        userId: user.uid,
        type: newWorkoutType,
        duration: parseInt(newWorkoutDuration),
        calories: calories,
        date: Timestamp.fromDate(new Date())
      };

      const workoutsCollectionRef = collection(db, 'workouts');
      await addDoc(workoutsCollectionRef, workoutData);

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        let currentStreak = 1;
        
        if (userData.lastWorkoutDate) {
          const lastWorkout = userData.lastWorkoutDate.toDate();
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          lastWorkout.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          yesterday.setHours(0,0,0,0);
          
          if (lastWorkout.getTime() === yesterday.getTime()) {
            currentStreak = (userData.currentStreak || 0) + 1;
          } else if (lastWorkout.getTime() === today.getTime()) {
            currentStreak = userData.currentStreak || 1;
          }
        }

        await updateDoc(userRef, {
          lastWorkoutDate: Timestamp.now(),
          currentStreak: currentStreak,
          highestStreak: Math.max(currentStreak, userData.highestStreak || 0)
        });
      } else {
        await updateDoc(userRef, {
          lastWorkoutDate: Timestamp.now(),
          currentStreak: 1,
          highestStreak: 1
        });
      }

      setNewWorkoutDuration('');
      setNewWorkoutType('cardio');
      setError('Workout added successfully!');
      setTimeout(() => setError(''), 3000);

      loadWorkoutHistory();
      
    } catch (error) {
      console.error('Error adding workout:', error);
      if (error instanceof FirestoreError) {
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please make sure you are signed in.');
        } else {
          setError(`Failed to add workout: ${error.message}`);
        }
      } else {
        setError('Failed to add workout. Please try again.');
      }
    }
  };

  const handleEditWorkout = async (duration: string, type: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to edit workouts');
        return;
      }

      if (!editEntry) {
        setError('No workout selected for editing');
        return;
      }

      const caloriesPerMinute = 5;
      const newCalories = parseInt(duration) * caloriesPerMinute;

      const updatedHistory = workoutHistory.map(entry =>
        entry.id === editEntry.id 
          ? { 
              ...entry, 
              duration: parseInt(duration), 
              type,
              calories: newCalories 
            } 
          : entry
      );
      setWorkoutHistory(updatedHistory);

      const workoutRef = doc(db, 'workouts', editEntry.id);
      await updateDoc(workoutRef, {
        duration: parseInt(duration),
        type,
        calories: newCalories,
        updatedAt: Timestamp.now()
      });

      setEditEntry(null);
      setError('Workout updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error updating workout:', error);
      if (error instanceof FirestoreError) {
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please make sure you are signed in.');
        } else {
          setError(`Failed to update workout: ${error.message}`);
        }
      } else {
        setError('Failed to update workout. Please try again.');
      }
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to delete workouts');
        return;
      }

      const updatedHistory = workoutHistory.filter(entry => entry.id !== entryId);
      setWorkoutHistory(updatedHistory);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        workoutHistory: updatedHistory,
        'profile.lastWorkout': updatedHistory[updatedHistory.length - 1] || null
      });

      setError('Workout deleted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError('Failed to delete workout. Please try again.');
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const periods = {
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    };
    
    const days = periods[selectedTab as keyof typeof periods];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return workoutHistory.filter(entry => entry.date >= cutoff);
  };

  const filteredHistory = getFilteredData();
  
  const averageDuration = workoutHistory.length > 0
    ? Math.round(workoutHistory.reduce((acc, curr) => acc + curr.duration, 0) / workoutHistory.length)
    : 0;

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const workoutDates = new Set(workoutHistory.map(entry => entry.date.toISOString().split('T')[0]));
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (workoutDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const monthlyGoal = 20; // Default to 20 if not set
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyWorkouts = workoutHistory.filter(entry => {
    const date = entry.date;
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  
  const goalProgress = Math.round((monthlyWorkouts / monthlyGoal) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Workout Progress</h2>
          <p className="text-xs md:text-sm text-gray-500">Track your fitness journey</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: '1month', label: '1M' },
            { id: '3months', label: '3M' },
            { id: '6months', label: '6M' },
            { id: '1year', label: '1Y' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                selectedTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-blue-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Last</h3>
              <button 
                onClick={() => {
                  if (workoutHistory.length > 0) {
                    setEditEntry(workoutHistory[workoutHistory.length - 1]);
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                <FaEdit size={16} />
              </button>
            </div>
            {workoutHistory.length > 0 ? (
              <>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
                >
                  {workoutHistory[workoutHistory.length - 1].duration}
                  <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">min</span>
                </motion.p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 capitalize truncate">
                  {workoutHistory[workoutHistory.length - 1].type}
                </p>
              </>
            ) : (
              <p className="text-gray-600">No workouts yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-red-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaFire className="text-orange-500" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Goal</h3>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
            >
              {monthlyWorkouts}
              <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">/{monthlyGoal}</span>
            </motion.div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendarCheck className="text-green-500" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Streak</h3>
            </div>
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
            >
              {streak}
              <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">days</span>
            </motion.p>
            <p className="text-xs sm:text-sm text-gray-600">Keep it up!</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaClock className="text-purple-500" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Total</h3>
            </div>
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
            >
              {workoutHistory.reduce((total, entry) => total + entry.duration, 0)}
              <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">min</span>
            </motion.p>
            <p className="text-xs sm:text-sm text-gray-600">This month</p>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[350px] md:min-h-[400px] lg:min-h-[450px] bg-white rounded-xl p-3 md:p-4 shadow-2xl hover:shadow-2xl transition-all duration-300">
        <div className="h-64 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : chartData.datasets[0].data.length > 0 ? (
            <Bar 
              data={chartData}
              options={chartOptions}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No workout data available
            </div>
          )}
        </div>
      </div>

      {/* Add Workout Form */}
      <form onSubmit={handleAddWorkout} className="mt-4 flex flex-col md:flex-row gap-2">
        <select
          value={newWorkoutType}
          onChange={(e) => setNewWorkoutType(e.target.value)}
          className="md:w-1/3 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
        >
          {workoutTypes.map(type => (
            <option key={type.value} value={type.value} className="text-gray-900">
              {type.label}
            </option>
          ))}
        </select>
        <div className="flex-1">
          <input
            type="number"
            value={newWorkoutDuration}
            onChange={(e) => {
              setNewWorkoutDuration(e.target.value);
              setError('');
            }}
            placeholder="Duration (minutes)"
            min="1"
            max="300"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <FaPlus size={12} />
          <span>Add</span>
        </motion.button>
      </form>

      {/* Edit Modal */}
      <EditModal
        entry={editEntry}
        isOpen={!!editEntry}
        onClose={() => setEditEntry(null)}
        onSave={handleEditWorkout}
      />
    </div>
  );
}
