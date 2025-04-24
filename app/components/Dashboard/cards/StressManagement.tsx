'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaChartLine, FaCheck, FaExclamation, FaPlus } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface StressEntry {
  id: string;
  level: number;
  triggers: string[];
  notes: string;
  date: string;
  timestamp: Date;
}

interface StressData {
  weeklyAverage: number;
  currentLevel: number;
  lastEntry: Date | null;
  trend: 'improving' | 'worsening' | 'stable';
  recentEntries: StressEntry[];
}

const StressManagement = () => {
  const { user } = useAuth();
  const [stressData, setStressData] = useState<StressData>({
    weeklyAverage: 0,
    currentLevel: 0,
    lastEntry: null,
    trend: 'stable',
    recentEntries: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [stressTriggers, setStressTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Common stress triggers
  const commonTriggers = [
    'Work', 'Family', 'Health', 'Finances', 
    'Relationships', 'Time Management', 'Sleep', 'Exercise'
  ];

  useEffect(() => {
    const fetchStressData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stressDocRef = doc(db, `users/${user.uid}/mentalHealth/stress`);
        const stressDoc = await getDoc(stressDocRef);

        // Get recent entries
        const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/stress/entries`);
        const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(7));
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const recentEntries: StressEntry[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          recentEntries.push({
            id: doc.id,
            level: data.level,
            triggers: data.triggers || [],
            notes: data.notes || '',
            date: data.date,
            timestamp: data.timestamp.toDate()
          });
        });

        // Calculate trend based on recent entries
        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (recentEntries.length >= 3) {
          const oldAvg = recentEntries.slice(Math.max(recentEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, recentEntries.length);
          const newAvg = recentEntries.slice(0, 3).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, recentEntries.length);
          
          if (newAvg < oldAvg - 0.5) {
            trend = 'improving';
          } else if (newAvg > oldAvg + 0.5) {
            trend = 'worsening';
          }
        }

        // Calculate weekly average
        let weeklyAverage = 0;
        if (recentEntries.length > 0) {
          weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.level, 0) / recentEntries.length;
        }

        if (stressDoc.exists()) {
          const data = stressDoc.data();
          setStressData({
            weeklyAverage: weeklyAverage,
            currentLevel: recentEntries.length > 0 ? recentEntries[0].level : data.currentLevel || 0,
            lastEntry: data.lastEntry?.toDate() || null,
            trend: trend,
            recentEntries
          });
        } else {
          // Create a new document if it doesn't exist
          const newStressData = {
            weeklyAverage: weeklyAverage,
            currentLevel: recentEntries.length > 0 ? recentEntries[0].level : 0,
            lastEntry: null,
            lastUpdated: new Date()
          };
          setStressData({
            ...newStressData,
            trend: trend,
            recentEntries
          });
          await setDoc(stressDocRef, {
            ...newStressData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stress data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStressData();
    
    // Set up real-time listener for updates
    if (user) {
      const stressDocRef = doc(db, `users/${user.uid}/mentalHealth/stress`);
      
      const unsubscribe = onSnapshot(stressDocRef, async (doc) => {
        if (doc.exists()) {
          // Get recent entries
          const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/stress/entries`);
          const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(7));
          const entriesSnapshot = await getDocs(entriesQuery);
          
          const recentEntries: StressEntry[] = [];
          entriesSnapshot.forEach(doc => {
            const data = doc.data();
            recentEntries.push({
              id: doc.id,
              level: data.level,
              triggers: data.triggers || [],
              notes: data.notes || '',
              date: data.date,
              timestamp: data.timestamp.toDate()
            });
          });
          
          // Calculate trend based on recent entries
          let trend: 'improving' | 'worsening' | 'stable' = 'stable';
          if (recentEntries.length >= 3) {
            const oldAvg = recentEntries.slice(Math.max(recentEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, recentEntries.length);
            const newAvg = recentEntries.slice(0, 3).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, recentEntries.length);
            
            if (newAvg < oldAvg - 0.5) {
              trend = 'improving';
            } else if (newAvg > oldAvg + 0.5) {
              trend = 'worsening';
            }
          }

          // Calculate weekly average
          let weeklyAverage = 0;
          if (recentEntries.length > 0) {
            weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.level, 0) / recentEntries.length;
          }
          
          const data = doc.data();
          setStressData({
            weeklyAverage: weeklyAverage,
            currentLevel: recentEntries.length > 0 ? recentEntries[0].level : data.currentLevel || 0,
            lastEntry: data.lastEntry?.toDate() || null,
            trend: trend,
            recentEntries
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const addStressEntry = async () => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const stressDocRef = doc(db, `users/${user.uid}/mentalHealth/stress`);
      const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/stress/entries`);
      
      // Add a new entry
      const entryId = `entry_${Date.now()}`;
      await setDoc(doc(entriesCollectionRef, entryId), {
        level: stressLevel,
        triggers: stressTriggers,
        notes: notes,
        date: today,
        timestamp: serverTimestamp()
      });
      
      // Update the main document
      await updateDoc(stressDocRef, {
        currentLevel: stressLevel,
        lastEntry: new Date(),
        lastUpdated: serverTimestamp()
      });

      // Update local state
      const newEntry: StressEntry = {
        id: entryId,
        level: stressLevel,
        triggers: stressTriggers,
        notes: notes,
        date: today,
        timestamp: new Date()
      };
      
      const updatedEntries = [newEntry, ...stressData.recentEntries.slice(0, 6)];
      
      // Calculate new weekly average
      const newWeeklyAverage = updatedEntries.reduce((sum, entry) => sum + entry.level, 0) / updatedEntries.length;
      
      // Calculate new trend
      let newTrend: 'improving' | 'worsening' | 'stable' = stressData.trend;
      if (updatedEntries.length >= 3) {
        const oldAvg = updatedEntries.slice(Math.max(updatedEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, updatedEntries.length);
        const newAvg = updatedEntries.slice(0, 3).reduce((sum, entry) => sum + entry.level, 0) / Math.min(3, updatedEntries.length);
        
        if (newAvg < oldAvg - 0.5) {
          newTrend = 'improving';
        } else if (newAvg > oldAvg + 0.5) {
          newTrend = 'worsening';
        }
      }
      
      setStressData({
        ...stressData,
        currentLevel: stressLevel,
        weeklyAverage: newWeeklyAverage,
        lastEntry: new Date(),
        trend: newTrend,
        recentEntries: updatedEntries
      });
      
      // Reset form
      setStressLevel(3);
      setStressTriggers([]);
      setNotes('');
      setShowAddForm(false);
      
      // Show animation
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error adding stress entry:', error);
      setUpdating(false);
    }
  };

  const toggleTrigger = (trigger: string) => {
    if (stressTriggers.includes(trigger)) {
      setStressTriggers(stressTriggers.filter(t => t !== trigger));
    } else {
      setStressTriggers([...stressTriggers, trigger]);
    }
  };

  // Generate animated particles for background
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 30,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.2
    }));
  };
  
  const particles = generateParticles(15);

  // Prepare chart data
  const chartData = {
    labels: stressData.recentEntries.slice().reverse().map(entry => format(new Date(entry.date), 'MMM d')),
    datasets: [
      {
        label: 'Stress Level',
        data: stressData.recentEntries.slice().reverse().map(entry => entry.level),
        borderColor: 'rgba(255, 255, 255, 0.7)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 10
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#333',
        bodyColor: '#333',
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 12
        },
        padding: 8,
        cornerRadius: 4
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-orange-500 to-amber-600">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: 'blur(1px)'
            }}
            animate={{
              opacity: [particle.opacity, particle.opacity * 2, particle.opacity],
              scale: [1, 1.5, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Save Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="absolute inset-0 bg-white/20 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/20 rounded-full p-6"
            >
              <FaCheck className="text-white text-4xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Stress Levels</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaBrain className="text-white text-xl" />
          </div>
        </div>

        {!showAddForm ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-white font-medium">Current Level</div>
                <div className="flex items-center">
                  <div className="text-white font-bold text-xl mr-2">{stressData.currentLevel}/10</div>
                  {stressData.trend === 'improving' ? (
                    <div className="bg-green-400/30 text-white text-xs px-2 py-0.5 rounded-full">Improving</div>
                  ) : stressData.trend === 'worsening' ? (
                    <div className="bg-red-400/30 text-white text-xs px-2 py-0.5 rounded-full">Worsening</div>
                  ) : (
                    <div className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Stable</div>
                  )}
                </div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div 
                  className={`h-full ${
                    stressData.currentLevel <= 3 ? 'bg-green-400/70' : 
                    stressData.currentLevel <= 6 ? 'bg-yellow-400/70' : 
                    'bg-red-400/70'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(stressData.currentLevel / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              {stressData.recentEntries.length > 0 && (
                <div className="h-24 w-full mb-3">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 bg-white/20 rounded-lg text-white text-sm font-medium flex items-center justify-center mb-4"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="mr-2" /> Log Today's Stress Level
            </motion.button>
          </>
        ) : (
          <div className="mb-4">
            <div className="mb-3">
              <div className="text-white font-medium mb-2">Stress Level (1-10)</div>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="ml-2 text-white font-bold">{stressLevel}</span>
              </div>
              <div className="flex justify-between text-white/70 text-xs mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-white font-medium mb-2">Triggers</div>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      stressTriggers.includes(trigger) 
                        ? 'bg-white text-amber-600 font-medium' 
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-white font-medium mb-2">Notes (Optional)</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's causing your stress today?"
                className="w-full p-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 resize-none"
                rows={2}
              />
            </div>
            
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-white/10 rounded-lg text-white text-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                onClick={addStressEntry}
                disabled={updating}
                className="flex-1 py-2 bg-white/20 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                Save
              </motion.button>
            </div>
          </div>
        )}

        {!showAddForm && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/pages/mental-health/stress"
              className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
            >
              View History & Tips
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StressManagement;
