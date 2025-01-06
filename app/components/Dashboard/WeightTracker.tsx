'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaArrowDown, FaArrowUp, FaEquals, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { db, auth } from '@/app/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp,
  FirestoreError,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeightEntry {
  id: string;
  date: Date;
  weight: number;
}

interface WeightTrackerProps {
  userData: any;
}

interface EditModalProps {
  entry: WeightEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number) => Promise<void>;
}

const formatChartDate = (date: Date) => {
  return format(date, 'MMM d');
};

const EditModal = ({ entry, isOpen, onClose, onSave }: EditModalProps) => {
  const [weight, setWeight] = useState(entry?.weight.toString() || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setWeight(entry.weight.toString());
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      setError('Please enter a valid weight between 30 and 300 kg');
      return;
    }
    await onSave(weightNum);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Weight Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError('');
              }}
              step="0.1"
              min="30"
              max="300"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-indigo-500 text-gray-900"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function WeightTracker({ userData }: WeightTrackerProps) {
  const [selectedTab, setSelectedTab] = useState('6months');
  const [newWeight, setNewWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [{
      label: 'Weight (kg)',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.1,
      fill: true
    }]
  });
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);
  const [error, setError] = useState('');

  const handleEditWeight = async (weight: number) => {
    try {
      const user = auth.currentUser;
      if (!user || !editEntry) {
        setError('Please sign in to edit weight');
        return;
      }

      const weightRef = doc(db, 'weights', editEntry.id);
      await updateDoc(weightRef, {
        weight: weight
      });

      // Update local state
      const updatedHistory = weightHistory.map(entry =>
        entry.id === editEntry.id
          ? { ...entry, weight }
          : entry
      );

      // Sort the updated history by date
      const sortedHistory = [...updatedHistory].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );

      setWeightHistory(sortedHistory);

      // Update chart data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const weightMap = new Map<string, number>();
      sortedHistory.forEach(weight => {
        const dateStr = weight.date.toISOString().split('T')[0];
        if (!weightMap.has(dateStr)) {
          weightMap.set(dateStr, weight.weight);
        }
      });

      const chartLabels = dates.map(date => formatChartDate(date));
      const chartWeights = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const weight = weightMap.get(dateStr);
        
        if (weight !== undefined) return weight;
        
        const previousDates = dates.slice(0, index).reverse();
        for (const prevDate of previousDates) {
          const prevWeight = weightMap.get(prevDate.toISOString().split('T')[0]);
          if (prevWeight !== undefined) return prevWeight;
        }
        
        if (index < dates.length - 1) {
          const nextDates = dates.slice(index + 1);
          for (const nextDate of nextDates) {
            const nextWeight = weightMap.get(nextDate.toISOString().split('T')[0]);
            if (nextWeight !== undefined) return nextWeight;
          }
        }
        
        return sortedHistory[0]?.weight || 0;
      });

      setChartData({
        labels: chartLabels,
        datasets: [{
          label: 'Weight (kg)',
          data: chartWeights,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.5)';
          }),
          tension: 0.1,
          fill: true,
          pointBackgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgb(75, 192, 192)' : 'rgba(75, 192, 192, 0.8)';
          }),
          pointBorderColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? '#fff' : 'rgb(75, 192, 192)';
          }),
          pointRadius: dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return weightMap.has(dateStr) ? 5 : 3;
          }),
          pointHoverRadius: 8
        }]
      });

      setEditEntry(null);
    } catch (error) {
      console.error('Error editing weight:', error);
      setError('Failed to edit weight. Please try again.');
    }
  };

  const handleDeleteWeight = async (entryId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to delete weight');
        return;
      }

      const weightRef = doc(db, 'weights', entryId);
      await deleteDoc(weightRef);

      loadWeightHistory();
    } catch (error) {
      console.error('Error deleting weight:', error);
      setError('Failed to delete weight. Please try again.');
    }
  };

  const loadWeightHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        setError('Please sign in to view weight history');
        return;
      }

      setLoading(true);
      console.log('Loading weight history for user:', user.uid);

      const weightsRef = collection(db, 'weights');
      const q = query(
        weightsRef,
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('Found weights:', querySnapshot.size);

      if (querySnapshot.empty) {
        console.log('No weights found for user');
        setChartData({
          labels: [],
          datasets: [{
            label: 'Weight (kg)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1,
            fill: true
          }]
        });
        setLoading(false);
        return;
      }

      const weights = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Weight document:', data);
        return {
          id: doc.id,
          date: new Date(data.date),
          weight: Number(data.weight) || 0
        };
      });

      console.log('Processed weights:', weights);

      const sortedWeights = weights.sort((a, b) => b.date.getTime() - a.date.getTime());
      setWeightHistory(sortedWeights);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      console.log('Date range:', dates[0], 'to', dates[dates.length - 1]);

      const weightMap = new Map<string, number>();
      sortedWeights.forEach(weight => {
        const dateStr = weight.date.toISOString().split('T')[0];
        if (!weightMap.has(dateStr)) {
          weightMap.set(dateStr, weight.weight);
        }
      });

      console.log('Weight map:', Object.fromEntries(weightMap));

      const chartLabels = dates.map(date => formatChartDate(date));
      const chartWeights = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const weight = weightMap.get(dateStr);
        
        if (weight !== undefined) return weight;
        
        const previousDates = dates.slice(0, index).reverse();
        for (const prevDate of previousDates) {
          const prevWeight = weightMap.get(prevDate.toISOString().split('T')[0]);
          if (prevWeight !== undefined) return prevWeight;
        }
        
        if (index < dates.length - 1) {
          const nextDates = dates.slice(index + 1);
          for (const nextDate of nextDates) {
            const nextWeight = weightMap.get(nextDate.toISOString().split('T')[0]);
            if (nextWeight !== undefined) return nextWeight;
          }
        }
        
        return sortedWeights[0]?.weight || 0;
      });

      console.log('Chart data:', { labels: chartLabels, data: chartWeights });

      const newChartData = {
        labels: chartLabels,
        datasets: [{
          label: 'Weight (kg)',
          data: chartWeights,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.5)';
          }),
          tension: 0.1,
          fill: true,
          pointBackgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgb(75, 192, 192)' : 'rgba(75, 192, 192, 0.8)';
          }),
          pointBorderColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? '#fff' : 'rgb(75, 192, 192)';
          }),
          pointRadius: dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return weightMap.has(dateStr) ? 5 : 3;
          }),
          pointHoverRadius: 8
        }]
      };

      console.log('Setting new chart data:', newChartData);
      setChartData(newChartData);

    } catch (error) {
      console.error('Error loading weight history:', error);
      if (error instanceof FirestoreError) {
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please make sure you are signed in.');
        } else {
          setError(`Failed to load weight history: ${error.message}`);
        }
      } else {
        setError('Failed to load weight history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight || parseFloat(newWeight) < 20 || parseFloat(newWeight) > 300) {
      setError('Please enter a valid weight between 20 and 300 kg');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to add weight');
        return;
      }

      const weightData = {
        userId: user.uid,
        weight: parseFloat(newWeight),
        date: selectedDate
      };

      console.log('Adding new weight:', weightData);
      const weightsRef = collection(db, 'weights');
      const docRef = await addDoc(weightsRef, weightData);
      console.log('Added weight with ID:', docRef.id);

      // Create new weight entry
      const newEntry = {
        id: docRef.id,
        date: new Date(selectedDate),
        weight: parseFloat(newWeight)
      };

      // Update weight history with new entry
      const updatedHistory = [newEntry, ...weightHistory]
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      setWeightHistory(updatedHistory);

      // Update chart data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const weightMap = new Map<string, number>();
      updatedHistory.forEach(weight => {
        const dateStr = weight.date.toISOString().split('T')[0];
        if (!weightMap.has(dateStr)) {
          weightMap.set(dateStr, weight.weight);
        }
      });

      const chartLabels = dates.map(date => formatChartDate(date));
      const chartWeights = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const weight = weightMap.get(dateStr);
        
        if (weight !== undefined) return weight;
        
        const previousDates = dates.slice(0, index).reverse();
        for (const prevDate of previousDates) {
          const prevWeight = weightMap.get(prevDate.toISOString().split('T')[0]);
          if (prevWeight !== undefined) return prevWeight;
        }
        
        if (index < dates.length - 1) {
          const nextDates = dates.slice(index + 1);
          for (const nextDate of nextDates) {
            const nextWeight = weightMap.get(nextDate.toISOString().split('T')[0]);
            if (nextWeight !== undefined) return nextWeight;
          }
        }
        
        return updatedHistory[0]?.weight || 0;
      });

      setChartData({
        labels: chartLabels,
        datasets: [{
          label: 'Weight (kg)',
          data: chartWeights,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.5)';
          }),
          tension: 0.1,
          fill: true,
          pointBackgroundColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? 'rgb(75, 192, 192)' : 'rgba(75, 192, 192, 0.8)';
          }),
          pointBorderColor: dates.map(date => {
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            return isToday ? '#fff' : 'rgb(75, 192, 192)';
          }),
          pointRadius: dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return weightMap.has(dateStr) ? 5 : 3;
          }),
          pointHoverRadius: 8
        }]
      });

      setNewWeight('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setError('Weight added successfully!');
      setTimeout(() => setError(''), 3000);

    } catch (error) {
      console.error('Error adding weight:', error);
      setError('Failed to add weight. Please try again.');
    }
  };

  useEffect(() => {
    loadWeightHistory();
  }, []);

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
    
    return weightHistory.filter(entry => entry.date >= cutoff);
  };

  const filteredHistory = getFilteredData();
  
  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0;
  const targetWeight = userData?.weightGoals?.targetWeight || 0;
  const weightDifference = currentWeight - targetWeight;
  const isWeightGoalClose = Math.abs(weightDifference) < 2;

  const getWeightTrendIcon = () => {
    if (weightDifference > 0) {
      return <FaArrowDown className="text-green-500" />;
    } else if (weightDifference < 0) {
      return <FaArrowUp className="text-red-500" />;
    }
    return <FaEquals className="text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4">
        <div>
          <h2 className="text-xl text-shadow:[0_0_10px_black] md:text-xl font-semibold text-gray-800">Weight Progress</h2>
          <p className="text-xs md:text-sm text-gray-500">Track your weight journey</p>
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
                  ? 'bg-white text-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:shadow-sm'
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
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Current</h3>
              <button 
                onClick={() => {
                  if (weightHistory.length > 0) {
                    setEditEntry(weightHistory[weightHistory.length - 1]);
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                <FaEdit size={16} />
              </button>
            </div>
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
            >
              {weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0}
              <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">kg</span>
            </motion.p>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
              {weightHistory.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  {weightHistory[weightHistory.length - 1].weight > weightHistory[weightHistory.length - 2].weight ? (
                    <FaArrowUp className="text-red-500" />
                  ) : (
                    <FaArrowDown className="text-green-500" />
                  )}
                  <span className="truncate">
                    {Math.abs(weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight).toFixed(1)} kg
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Target</h3>
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
            >
              {userData?.weightGoals?.targetWeight || 0}
              <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">kg</span>
            </motion.p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0) / (userData?.weightGoals?.targetWeight || 1) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-500/30 animate-gradient" />
          <div className="relative p-4 bg-white/90 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Change</h3>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 mb-1"
            >
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {Math.abs(weightDifference).toFixed(1)}
                <span className="text-lg sm:text-xl font-normal text-gray-600 ml-1">kg</span>
              </span>
              {weightDifference > 0 ? (
                <FaArrowUp className="text-red-500 text-xl" />
              ) : weightDifference < 0 ? (
                <FaArrowDown className="text-green-500 text-xl" />
              ) : (
                <FaEquals className="text-gray-500 text-xl" />
              )}
            </motion.div>
            <p className="text-xs sm:text-sm text-gray-600">
              {weightDifference > 0 
                ? 'to lose' 
                : weightDifference < 0 
                ? 'to gain' 
                : 'on target'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[350px] md:min-h-[400px] lg:min-h-[450px] bg-white rounded-xl p-3 md:p-4 shadow-2xl hover:shadow-2xl transition-shadow duration-300">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm" />
          <div className="relative z-10 h-full">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart'
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      font: {
                        size: 12,
                        weight: 600
                      },
                      padding: 16,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    bodyFont: {
                      size: 13
                    },
                    padding: 12,
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                      label: function(context: any) {
                        return `${context.dataset.label}: ${context.parsed.y} kg`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(0,0,0,0.06)'
                    },
                    ticks: {
                      font: {
                        size: 11
                      },
                      callback: function(value: any) {
                        return `${value} kg`;
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0,0,0,0.06)'
                    },
                    ticks: {
                      font: {
                        size: 11
                      }
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Add Weight Form */}
      <form onSubmit={handleAddWeight} className="flex gap-4 items-end mt-6">
        <div className="flex-1 space-y-4">
          <div>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => {
                setNewWeight(e.target.value);
                setError('');
              }}
              placeholder="Enter weight (kg)"
              step="0.1"
              min="30"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-black"
            />
          </div>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-black"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
        onSave={handleEditWeight}
      />
    </div>
  );
}
