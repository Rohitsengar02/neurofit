'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaPlus, FaQuoteLeft } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format } from 'date-fns';

interface GratitudeEntry {
  id: string;
  content: string;
  date: string;
  timestamp: Date;
}

interface GratitudeData {
  totalEntries: number;
  streak: number;
  lastEntry: Date | null;
  recentEntries: GratitudeEntry[];
}

// Generate animated heart particles for background
const generateHearts = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `heart-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 5 + Math.random() * 10,
    duration: 20 + Math.random() * 40,
    delay: Math.random() * 15,
    opacity: 0.1 + Math.random() * 0.3
  }));
};

const GratitudeJournal = () => {
  const { user } = useAuth();
  const [gratitudeData, setGratitudeData] = useState<GratitudeData>({
    totalEntries: 0,
    streak: 0,
    lastEntry: null,
    recentEntries: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Generate hearts for animation
  const hearts = generateHearts(12);

  useEffect(() => {
    const fetchGratitudeData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const gratitudeDocRef = doc(db, `users/${user.uid}/mentalHealth/gratitude`);
        const gratitudeDoc = await getDoc(gratitudeDocRef);

        // Get recent entries
        const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
        const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(5));
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const recentEntries: GratitudeEntry[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          recentEntries.push({
            id: doc.id,
            content: data.content,
            date: data.date,
            timestamp: data.timestamp.toDate()
          });
        });

        if (gratitudeDoc.exists()) {
          const data = gratitudeDoc.data();
          setGratitudeData({
            totalEntries: data.totalEntries || 0,
            streak: data.streak || 0,
            lastEntry: data.lastEntry?.toDate() || null,
            recentEntries
          });
        } else {
          // Create a new document if it doesn't exist
          const newGratitudeData = {
            totalEntries: 0,
            streak: 0,
            lastEntry: null,
            lastUpdated: new Date()
          };
          setGratitudeData({
            ...newGratitudeData,
            recentEntries
          });
          await setDoc(gratitudeDocRef, {
            ...newGratitudeData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gratitude data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchGratitudeData();
    
    // Set up real-time listener for updates
    if (user) {
      const gratitudeDocRef = doc(db, `users/${user.uid}/mentalHealth/gratitude`);
      
      const unsubscribe = onSnapshot(gratitudeDocRef, async (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          
          // Get recent entries
          const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
          const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(5));
          const entriesSnapshot = await getDocs(entriesQuery);
          
          const recentEntries: GratitudeEntry[] = [];
          entriesSnapshot.forEach(doc => {
            const data = doc.data();
            recentEntries.push({
              id: doc.id,
              content: data.content,
              date: data.date,
              timestamp: data.timestamp.toDate()
            });
          });
          
          setGratitudeData({
            totalEntries: data.totalEntries || 0,
            streak: data.streak || 0,
            lastEntry: data.lastEntry?.toDate() || null,
            recentEntries
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const addGratitudeEntry = async () => {
    if (!user || updating || !newEntry.trim()) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const gratitudeDocRef = doc(db, `users/${user.uid}/mentalHealth/gratitude`);
      const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
      
      // Check if we need to update the streak
      let newStreak = gratitudeData.streak;
      const lastEntryDate = gratitudeData.lastEntry 
        ? format(gratitudeData.lastEntry, 'yyyy-MM-dd')
        : null;
        
      if (!lastEntryDate || lastEntryDate !== today) {
        // First entry today, increment streak
        newStreak = gratitudeData.streak + 1;
      }
      
      // Add a new entry
      const entryId = `entry_${Date.now()}`;
      await setDoc(doc(entriesCollectionRef, entryId), {
        content: newEntry,
        date: today,
        timestamp: serverTimestamp()
      });
      
      // Update the main document
      const newTotalEntries = gratitudeData.totalEntries + 1;
      
      await updateDoc(gratitudeDocRef, {
        totalEntries: newTotalEntries,
        streak: newStreak,
        lastEntry: new Date(),
        lastUpdated: serverTimestamp()
      });

      // Update local state
      const newEntryObj: GratitudeEntry = {
        id: entryId,
        content: newEntry,
        date: today,
        timestamp: new Date()
      };
      
      setGratitudeData({
        ...gratitudeData,
        totalEntries: newTotalEntries,
        streak: newStreak,
        lastEntry: new Date(),
        recentEntries: [newEntryObj, ...gratitudeData.recentEntries.slice(0, 4)]
      });
      
      // Reset form
      setNewEntry('');
      setShowAddForm(false);
      
      // Show animation
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error adding gratitude entry:', error);
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-pink-500 to-rose-600">
      {/* Animated Hearts Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-white"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: heart.size,
              opacity: heart.opacity
            }}
            animate={{
              opacity: [heart.opacity, heart.opacity * 2, heart.opacity],
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: heart.duration,
              delay: heart.delay,
              ease: "easeInOut"
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>
      
      {/* Heart Burst Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const distance = 100 + Math.random() * 50;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const size = 10 + Math.random() * 20;
              
              return (
                <motion.div
                  key={`burst-${i}`}
                  className="absolute text-white"
                  style={{ 
                    fontSize: size
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    x: x, 
                    y: y, 
                    opacity: 0,
                    scale: 1.5
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: "easeOut" 
                  }}
                >
                  ♥
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Gratitude</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaHeart className="text-white text-xl" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-medium">Daily Streak</div>
            <div className="text-white font-bold text-xl">{gratitudeData.streak} days</div>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (gratitudeData.streak / 30) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="text-white/70 text-xs mt-1 text-right">Goal: 30 days</div>
        </div>

        {!showAddForm ? (
          <div className="mb-4">
            {gratitudeData.recentEntries.length > 0 ? (
              <div className="bg-white/10 rounded-lg p-3 mb-3">
                <div className="flex items-start">
                  <FaQuoteLeft className="text-white/50 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">
                      {gratitudeData.recentEntries[0].content}
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      {format(new Date(gratitudeData.recentEntries[0].timestamp), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/70 text-center text-sm mb-3">
                No entries yet. Start your gratitude practice today!
              </div>
            )}
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              disabled={updating}
              className="w-full py-2 bg-white/20 rounded-lg text-white text-sm font-medium flex items-center justify-center"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="mr-2" /> Add Today's Entry
            </motion.button>
          </div>
        ) : (
          <div className="mb-4">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="What are you grateful for today?"
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 resize-none mb-2"
              rows={3}
            />
            
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
                onClick={addGratitudeEntry}
                disabled={updating || !newEntry.trim()}
                className="flex-1 py-2 bg-white/20 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                Save
              </motion.button>
            </div>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/pages/mental-health/gratitude"
            className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
          >
            View Journal
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default GratitudeJournal;
