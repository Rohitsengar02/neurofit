'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaPlus, FaQuoteLeft, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
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
  
  // For gratitude history modal
  const [showGratitudeHistory, setShowGratitudeHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entriesForDate, setEntriesForDate] = useState<GratitudeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [calendarDates, setCalendarDates] = useState<string[]>([]);
  
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
      
      return () => unsubscribe();
    }
  }, [user]);

  // Fetch dates with gratitude entries for calendar
  useEffect(() => {
    const fetchDatesWithEntries = async () => {
      if (!user) return;
      
      try {
        const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
        const entriesSnapshot = await getDocs(entriesCollectionRef);
        
        const dates: string[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.date && !dates.includes(data.date)) {
            dates.push(data.date);
          }
        });
        
        setCalendarDates(dates);
      } catch (error) {
        console.error('Error fetching gratitude dates:', error);
      }
    };
    
    fetchDatesWithEntries();
  }, [user]);

  // Fetch entries for selected date
  useEffect(() => {
    const fetchEntriesForDate = async () => {
      if (!user || !selectedDate || !showGratitudeHistory) return;
      
      try {
        setLoadingEntries(true);
        const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
        const dateQuery = query(entriesCollectionRef, where("date", "==", selectedDate), orderBy("timestamp", "desc"));
        const entriesSnapshot = await getDocs(dateQuery);
        
        const entries: GratitudeEntry[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            content: data.content,
            date: data.date,
            timestamp: data.timestamp.toDate()
          });
        });
        
        setEntriesForDate(entries);
        setLoadingEntries(false);
      } catch (error) {
        console.error('Error fetching gratitude entries for date:', error);
        setLoadingEntries(false);
      }
    };
    
    fetchEntriesForDate();
  }, [user, selectedDate, showGratitudeHistory]);

  const addGratitudeEntry = async () => {
    if (!user || updating || !newEntry.trim()) return;

    try {
      setUpdating(true);
      
      // Get the current date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if we need to update the streak
      const gratitudeDocRef = doc(db, `users/${user.uid}/mentalHealth/gratitude`);
      const gratitudeDoc = await getDoc(gratitudeDocRef);
      
      let streak = 0;
      let totalEntries = 0;
      
      if (gratitudeDoc.exists()) {
        const data = gratitudeDoc.data();
        totalEntries = data.totalEntries || 0;
        
        // Calculate if streak should increase
        if (data.lastEntry) {
          const lastEntryDate = data.lastEntry.toDate();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Format dates to compare just the date part (not time)
          const lastEntryFormatted = format(lastEntryDate, 'yyyy-MM-dd');
          const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');
          const todayFormatted = format(new Date(), 'yyyy-MM-dd');
          
          if (lastEntryFormatted === todayFormatted) {
            // Already added an entry today, maintain streak
            streak = data.streak || 0;
          } else if (lastEntryFormatted === yesterdayFormatted) {
            // Added yesterday, increase streak
            streak = (data.streak || 0) + 1;
          } else {
            // Break in streak, reset to 1
            streak = 1;
          }
        } else {
          // First entry ever
          streak = 1;
        }
      } else {
        // First entry ever
        streak = 1;
      }
      
      // Add the new entry to the entries subcollection
      const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/gratitude/entries`);
      const newEntryRef = doc(entriesCollectionRef);
      
      await setDoc(newEntryRef, {
        content: newEntry.trim(),
        date: today,
        timestamp: serverTimestamp()
      });
      
      // Update the main gratitude document
      await setDoc(gratitudeDocRef, {
        totalEntries: totalEntries + 1,
        streak,
        lastEntry: new Date(),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      // Reset form and show animation
      setNewEntry('');
      setShowAddForm(false);
      setShowAnimation(true);
      
      // Hide animation after a delay
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error adding gratitude entry:', error);
      setUpdating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-5 h-full relative overflow-hidden">
      {/* Animated hearts background */}
      {hearts.map(heart => (
        <motion.div
          key={heart.id}
          className="absolute text-white/20"
          initial={{ 
            x: `${heart.x}%`, 
            y: `${heart.y}%`, 
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            y: [`${heart.y}%`, `${Math.max(0, heart.y - 40)}%`],
            scale: [0, heart.size / 10],
            opacity: [0, heart.opacity, 0]
          }}
          transition={{ 
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 10
          }}
        >
          <FaHeart />
        </motion.div>
      ))}
      
      {/* Success animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="bg-white/20 p-8 rounded-full"
            >
              <FaHeart className="text-pink-400 text-5xl" />
            </motion.div>
            <motion.div
              className="absolute text-white text-xl font-medium text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0 }}
            >
              Gratitude Added!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-0">
        <div className="flex items-center mb-4">
          <FaHeart className="text-pink-400 mr-2" />
          <h2 className="text-white text-lg font-bold">Gratitude Journal</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">Total Entries</div>
                <div className="text-white font-bold text-xl">{gratitudeData.totalEntries}</div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white/40"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (gratitudeData.totalEntries / 100) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="flex justify-end">
                <div className="text-white/70 text-xs mt-1">Goal: 100 entries</div>
              </div>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/5 rounded-full p-6">
                  <FaHeart className="text-white text-xl" />
                </div>
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
              <button 
                onClick={() => setShowGratitudeHistory(true)}
                className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
              >
                View Journal
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Gratitude History Modal */}
      <AnimatePresence>
        {showGratitudeHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowGratitudeHistory(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.4 
                }
              }}
              exit={{ 
                y: '100%', 
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto z-50"
            >
              {/* Close button */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <FaHeart className="mr-2 text-pink-500" /> Gratitude Journal
                  </h2>
                  <button
                    onClick={() => setShowGratitudeHistory(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
                {/* Calendar section */}
                <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-700 dark:text-white font-medium">Select Date</h3>
                  <div className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {format(new Date(selectedDate), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`header-${i}`} className="text-center text-gray-500 dark:text-gray-400 text-xs py-1">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: new Date(selectedDate.slice(0, 7) + '-01').getDay() }, (_, i) => (
                    <div key={`empty-start-${i}`} className="aspect-square" />
                  ))}
                  
                  {Array.from(
                    { length: new Date(parseInt(selectedDate.slice(0, 4)), parseInt(selectedDate.slice(5, 7)) - 1, 0).getDate() }, 
                    (_, i) => {
                      const day = i + 1;
                      const dateStr = `${selectedDate.slice(0, 8)}${day.toString().padStart(2, '0')}`;
                      const hasEntries = calendarDates.includes(dateStr);
                      const isSelected = dateStr === selectedDate;
                      
                      return (
                        <motion.button
                          key={`day-${day}`}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`aspect-square rounded-full flex items-center justify-center text-sm
                            ${isSelected ? 'bg-pink-500 text-white font-bold' : 'text-gray-700 dark:text-gray-300'}
                            ${hasEntries && !isSelected ? 'bg-pink-100 dark:bg-pink-900/30' : ''}
                            ${!hasEntries && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                          `}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {day}
                        </motion.button>
                      );
                    }
                  )}
                </div>
              </div>
              
                {/* Entries for selected date */}
                <div>
                  <h3 className="text-gray-700 dark:text-white font-medium mb-3">
                    Entries for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                  </h3>
                  
                  {loadingEntries ? (
                    <div className="text-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-pink-500 rounded-full animate-spin"></div>
                    </div>
                  ) : entriesForDate.length > 0 ? (
                    <div className="space-y-3">
                      {entriesForDate.map(entry => (
                        <div key={entry.id} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-start">
                            <FaQuoteLeft className="text-pink-500 mr-2 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-gray-700 dark:text-white text-sm">
                                {entry.content}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                {format(new Date(entry.timestamp), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No gratitude entries for this date.
                    </div>
                  )}
                </div>
                
                {/* Benefits section */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-700 dark:text-white font-medium mb-2">Benefits of Gratitude</h3>
                  <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                    <li>• Improves mental well-being</li>
                    <li>• Reduces stress and anxiety</li>
                    <li>• Enhances sleep quality</li>
                    <li>• Strengthens relationships</li>
                    <li>• Increases resilience</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GratitudeJournal;
