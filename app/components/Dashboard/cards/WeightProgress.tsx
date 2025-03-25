'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaWeight, FaChartLine, FaBullseye, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface WeightEntry {
  date: string;
  weight: number;
  timestamp: number;
}

interface WeightData {
  current: number;
  target: number;
  start: number;
  unit: string;
  history: WeightEntry[];
  weeklyChange: number;
  totalChange: number;
  remainingToGoal: number;
}

const DEFAULT_WEIGHT_DATA: WeightData = {
  current: 0,
  target: 0,
  start: 0,
  unit: 'kg',
  history: [],
  weeklyChange: 0,
  totalChange: 0,
  remainingToGoal: 0
};

const WeightProgress = () => {
  const { user } = useAuth();
  const [weightData, setWeightData] = useState<WeightData>(DEFAULT_WEIGHT_DATA);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState<string>('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    currentWeight: '',
    goalWeight: ''
  });

  const calculateWeightMetrics = (history: WeightEntry[]) => {
    if (history.length < 2) return { weeklyChange: 0, totalChange: 0 };

    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    const latestWeight = sortedHistory[0].weight;
    const weekAgoEntry = sortedHistory.find(entry => 
      Date.now() - entry.timestamp <= 7 * 24 * 60 * 60 * 1000
    );
    const startWeight = sortedHistory[sortedHistory.length - 1].weight;

    return {
      weeklyChange: weekAgoEntry ? latestWeight - weekAgoEntry.weight : 0,
      totalChange: latestWeight - startWeight
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch weight data
  useEffect(() => {
    const fetchWeightData = async () => {
      if (!user) return;

      try {
        // Get current weight from profile
        const weightGoalsRef = doc(db, `users/${user.uid}/userData/profile`);
        const currentWeightRef = doc(weightGoalsRef, 'weightGoals/currentWeight');
        const targetWeightRef = doc(weightGoalsRef, 'weightGoals/targetWeight');

        const [currentWeightSnap, targetWeightSnap] = await Promise.all([
          getDoc(currentWeightRef),
          getDoc(targetWeightRef)
        ]);

        if (!currentWeightSnap.exists() || !targetWeightSnap.exists()) {
          setShowSetup(true);
          setLoading(false);
          return;
        }

        const currentWeight = currentWeightSnap.data().weight;
        const targetWeight = targetWeightSnap.data().weight;

        // Get weight history
        const weightHistoryRef = collection(db, `users/${user.uid}/weightHistory`);
        const weightQuery = query(weightHistoryRef, orderBy('timestamp', 'desc'), limit(30));
        const weightSnap = await getDocs(weightQuery);
        
        const history: WeightEntry[] = weightSnap.docs.map(doc => ({
          date: doc.data().date,
          weight: doc.data().weight,
          timestamp: doc.data().timestamp
        }));

        const { weeklyChange, totalChange } = calculateWeightMetrics(history);

        const newWeightData: WeightData = {
          current: currentWeight,
          target: targetWeight,
          start: history.length > 0 ? history[history.length - 1].weight : currentWeight,
          unit: 'kg',
          history,
          weeklyChange,
          totalChange,
          remainingToGoal: targetWeight - currentWeight
        };

        setWeightData(newWeightData);
      } catch (error) {
        console.error('Error fetching weight data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  }, [user]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const currentWeight = parseFloat(setupData.currentWeight);
    const goalWeight = parseFloat(setupData.goalWeight);

    if (isNaN(currentWeight) || isNaN(goalWeight)) return;

    try {
      const now = new Date();
      const weightGoalsRef = doc(db, `users/${user.uid}/userData/profile`);
      
      // Set current weight
      await setDoc(doc(weightGoalsRef, 'weightGoals/currentWeight'), {
        weight: currentWeight,
        timestamp: now.getTime()
      });

      // Set target weight
      await setDoc(doc(weightGoalsRef, 'weightGoals/targetWeight'), {
        weight: goalWeight,
        timestamp: now.getTime()
      });

      // Add first history entry
      const weightHistoryRef = collection(db, `users/${user.uid}/weightHistory`);
      await addDoc(weightHistoryRef, {
        date: formatDate(now),
        weight: currentWeight,
        timestamp: now.getTime()
      });

      // Update local state
      setWeightData({
        ...DEFAULT_WEIGHT_DATA,
        current: currentWeight,
        target: goalWeight,
        start: currentWeight,
        remainingToGoal: goalWeight - currentWeight
      });

      setShowSetup(false);
    } catch (error) {
      console.error('Error setting up weight data:', error);
    }
  };

  const updateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newWeight) return;

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue)) return;

    try {
      const now = new Date();
      const newEntry: WeightEntry = {
        date: formatDate(now),
        weight: weightValue,
        timestamp: now.getTime()
      };

      // Update current weight in profile
      const weightGoalsRef = doc(db, `users/${user.uid}/userData/profile`);
      const currentWeightRef = doc(weightGoalsRef, 'weightGoals/currentWeight');
      await setDoc(currentWeightRef, { 
        weight: weightValue, 
        timestamp: now.getTime() 
      });

      // Add to weight history
      const weightHistoryRef = collection(db, `users/${user.uid}/weightHistory`);
      await addDoc(weightHistoryRef, newEntry);

      // Update local state
      const updatedHistory = [newEntry, ...weightData.history];
      const { weeklyChange, totalChange } = calculateWeightMetrics(updatedHistory);

      setWeightData(prev => ({
        ...prev,
        current: weightValue,
        history: updatedHistory,
        weeklyChange,
        totalChange,
        remainingToGoal: prev.target - weightValue
      }));

      setNewWeight('');
    } catch (error) {
      console.error('Error updating weight:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showSetup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-800 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaWeight className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Set Up Weight Tracking</h3>
        </div>

        <form onSubmit={handleSetupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={setupData.currentWeight}
              onChange={(e) => setSetupData(prev => ({ ...prev, currentWeight: e.target.value }))}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-sm w-full"
              placeholder="Enter your current weight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Goal Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={setupData.goalWeight}
              onChange={(e) => setSetupData(prev => ({ ...prev, goalWeight: e.target.value }))}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-sm w-full"
              placeholder="Enter your goal weight"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Start Tracking
          </button>
        </form>
      </motion.div>
    );
  }

  const progressPercentage = ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-2xl p-6 text-white"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5"
            style={{
              width: '2px',
              height: '40px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: `${Math.random() * 90}deg`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              height: ['40px', '60px', '40px'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaWeight className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">Weight Progress</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
        >
          {Math.round(progressPercentage)}% Complete
        </motion.div>
      </div>

      {/* Current Weight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-center mb-8"
      >
        <div className="text-center">
          <div className="text-5xl font-bold mb-1">
            {weightData.current}
            <span className="text-2xl ml-1">{weightData.unit}</span>
          </div>
          <div className="text-sm opacity-80">Current Weight</div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <div>Start: {weightData.start}{weightData.unit}</div>
          <div>Goal: {weightData.target}{weightData.unit}</div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/30 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>
      </div>

      {/* Weight Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
        {[
          { 
            label: 'Weekly Change',
            value: weightData.weeklyChange,
            icon: weightData.weeklyChange < 0 ? FaArrowDown : FaArrowUp,
            color: weightData.weeklyChange < 0 ? 'text-green-300' : 'text-red-300'
          },
          { 
            label: 'Total Loss',
            value: weightData.totalChange,
            icon: FaChartLine,
            color: 'text-blue-300'
          },
          { 
            label: 'To Goal',
            value: weightData.remainingToGoal,
            icon: FaBullseye,
            color: 'text-purple-300'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
          >
            <div className="flex justify-center mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-lg font-bold">{Math.abs(stat.value)}{weightData.unit}</div>
            <div className="text-xs opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weight History */}
      <div className="relative z-10">
        <h4 className="text-sm font-medium mb-3">Weight History</h4>
        <div className="space-y-2">
          {weightData.history.map((record, index) => (
            <motion.div
              key={record.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2"
            >
              <div className="text-sm">{record.date}</div>
              <div className="font-medium">{record.weight}{weightData.unit}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weight Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative z-10 mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
      >
        <div className="text-sm font-medium mb-1">Weight Insight</div>
        <div className="text-sm opacity-80">
          Great progress! You're consistently losing weight at a healthy rate. Keep it up! 💪
        </div>
      </motion.div>

      <form onSubmit={updateWeight} className="mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Enter weight"
            className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-sm w-32"
          />
          <button
            type="submit"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm transition-colors"
          >
            Update
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default WeightProgress;
