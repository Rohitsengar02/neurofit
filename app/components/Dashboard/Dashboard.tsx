'use client';

import { useState, useEffect } from 'react';
import { format, isYesterday, isToday, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/app/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  orderBy, 
  Timestamp, 
  updateDoc
} from 'firebase/firestore';
import WeightTracker from './WeightTracker';
import WorkoutTracker from './WorkoutTracker';
import { UserData } from '@/app/utils/userService';
import { FaChartLine, FaDumbbell, FaUser, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface DashboardProps {
  userData: UserData;
}

interface MenuItem {
  icon: JSX.Element;
  label: string;
  active?: boolean;
}

interface WorkoutData {
  userId: string;
  date: Timestamp;
  type: string;
  duration: number;
  calories: number;
}

interface UserStreakData {
  currentStreak: number;
  highestStreak: number;
  lastWorkoutDate: Timestamp;
}

interface CalendarValue {
  date: Date;
  view: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<Date | null>(null);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Fetch workout dates from Firebase
  const fetchWorkoutDates = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const workoutsRef = collection(db, `users/${user.uid}/workouts`);
      const workoutsQuery = query(workoutsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(workoutsQuery);

      const dates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return new Date(data.date);
      });

      setWorkoutDates(dates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching workout dates:', error);
      setIsLoading(false);
    }
  };

  // Get user streak data from Firebase
  const fetchStreakData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as UserStreakData;

      if (userData) {
        setStreak(userData.currentStreak || 0);
        setHighestStreak(userData.highestStreak || 0);
        if (userData.lastWorkoutDate) {
          setLastWorkout(userData.lastWorkoutDate.toDate());
        }
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  // Calculate totals from workout data
  const calculateTotals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const workoutsRef = collection(db, 'workouts');
      const q = query(
        workoutsRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => {
        const data = doc.data() as WorkoutData;
        return {
          ...data,
          date: data.date.toDate(),
          duration: Number(data.duration) || 0,
          calories: Number(data.calories) || 0
        };
      });

      if (workouts.length === 0) return;

      // Calculate totals
      const totals = workouts.reduce((acc, workout) => ({
        calories: acc.calories + workout.calories,
        duration: acc.duration + workout.duration
      }), { calories: 0, duration: 0 });

      setTotalWorkouts(workouts.length);
      setCaloriesBurned(totals.calories);
      setTotalTime(totals.duration);
    } catch (error) {
      console.error('Error calculating totals:', error);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      const formattedName = emailName
        .split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setUserName(formattedName);
    }
    fetchStreakData();
    calculateTotals();
  }, []);

  useEffect(() => {
    fetchWorkoutDates();
  }, []);

  useEffect(() => {
    // Close sidebar on mobile by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleWeightUpdate = (event: CustomEvent<{ currentWeight: number; lastWeightUpdate: string }>) => {
      const user = auth.currentUser;
      if (user && userData && typeof userData === 'object') {
        // Update the user data in Firestore
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          'weightGoals.currentWeight': event.detail.currentWeight,
          'weightGoals.lastWeightUpdate': event.detail.lastWeightUpdate
        }).catch(error => {
          console.error('Error updating user data:', error);
        });
      }
    };

    // Add event listener
    window.addEventListener('weightUpdate' as any, handleWeightUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('weightUpdate' as any, handleWeightUpdate as EventListener);
    };
  }, [userData]);

  const menuItems: MenuItem[] = [
    { icon: <FaChartLine />, label: 'Dashboard', active: true },
    { icon: <FaDumbbell />, label: 'Workouts' },
    { icon: <FaUser />, label: 'Profile' },
    { icon: <FaCog />, label: 'Settings' }
  ];

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Format the time for display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}.${Math.floor(remainingMinutes/6)}` : `0.${Math.floor(minutes/6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          <h1 className="text-xl font-bold text-gray-800">NeuroFit</h1>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{userName}</h2>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                </div>
                <nav>
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      onClick={handleMenuClick}
                      whileHover={{ x: 5 }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 ${
                        item.active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.a>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-30 hidden md:block ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4">
          <div className={`flex items-center space-x-3 mb-8 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-800">{userName}</h2>
                <p className="text-sm text-gray-500">Member</p>
              </div>
            )}
          </div>
          <nav>
            {menuItems.map((item, index) => (
              <motion.a
                key={index}
                href="#"
                onClick={handleMenuClick}
                whileHover={{ x: 5 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span>{item.label}</span>}
              </motion.a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        } pt-16 pb-20 md:pt-0 md:pb-0`}
      >
        <main className="p-3 md:p-8">
          {/* Welcome Message - Mobile Only */}
          <div className="container mx-auto px-4 py-6">
            <div className="mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-heading tracking-tight drop-shadow-sm"
              >
                Welcome back, <span className="text-indigo-600 drop-shadow-md">{userName}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base text-gray-500 font-medium tracking-wide"
              >
                Track your fitness journey with personalized insights
              </motion.p>
            </div>

            {/* Quick Stats and Calendar Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6 mb-6"
            >
              {/* Stats Section - 3 columns */}
              <div className="lg:col-span-3 grid grid-cols-2 gap-3 md:gap-6">
                {/* First Row */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-xl text-white shadow-lg col-span-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                    <h3 className="font-medium">Workout Streak</h3>
                  </div>
                  <p className="text-2xl font-bold">{streak} days</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-white/80">
                    <span>Best: {highestStreak} days</span>
                    {lastWorkout && (
                      <span>Last: {format(lastWorkout, 'MMM d')}</span>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg col-span-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-medium">Calories Burned</h3>
                  </div>
                  <p className="text-2xl font-bold">{caloriesBurned.toLocaleString()}</p>
                  <p className="text-xs mt-1 text-white/80">Total burned</p>
                </motion.div>

                {/* Second Row */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl text-white shadow-lg col-span-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-medium">Workout Time</h3>
                  </div>
                  <p className="text-2xl font-bold">{formatTime(totalTime)} hrs</p>
                  <p className="text-xs mt-1 text-white/80">Total time</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white shadow-lg col-span-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="font-medium">Total Workouts</h3>
                  </div>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                  <p className="text-xs mt-1 text-white/80">All time</p>
                </motion.div>
              </div>

              {/* Calendar Section - 2 columns */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg p-4 relative overflow-hidden border border-gray-800"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,_31,_162,_0.15),transparent_50%)]" />
                </div>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10"
                    >
                      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Workout Calendar
                      </h3>
                      <div className="calendar-container">
                        <Calendar
                          onChange={(value) => {
                            if (value instanceof Date) {
                              setSelectedDate(value);
                            }
                          }}
                          value={selectedDate}
                          className="rounded-lg border-none shadow-lg"
                          tileClassName={({ date }) => {
                            const hasWorkout = workoutDates.some(
                              workoutDate => 
                                format(workoutDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                            );
                            return `${
                              hasWorkout 
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                                : 'hover:bg-gray-800'
                            } transition-all duration-200 rounded-full relative overflow-hidden group`
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <style jsx global>{`
                  .calendar-container .react-calendar {
                    border: none;
                    width: 100%;
                    background: transparent;
                    font-family: inherit;
                    color: #e5e7eb;
                  }
                  .calendar-container .react-calendar__tile {
                    padding: 0.75em 0.5em;
                    font-size: 0.875rem;
                    position: relative;
                    z-index: 1;
                    color: #e5e7eb;
                  }
                  .calendar-container .react-calendar__tile:enabled:hover,
                  .calendar-container .react-calendar__tile:enabled:focus {
                    background-color: rgba(139, 92, 246, 0.2);
                    color: #f3f4f6;
                  }
                  .calendar-container .react-calendar__tile--now {
                    background-color: rgba(139, 92, 246, 0.2);
                    border-radius: 9999px;
                    font-weight: bold;
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
                  }
                  .calendar-container .react-calendar__tile--active {
                    background-color: rgb(139, 92, 246) !important;
                    border-radius: 9999px;
                    color: white !important;
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
                  }
                  .calendar-container .react-calendar__navigation {
                    margin-bottom: 1rem;
                  }
                  .calendar-container .react-calendar__navigation button {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #e5e7eb;
                    padding: 0.5rem;
                    border-radius: 9999px;
                    transition: all 0.2s;
                    min-width: 44px;
                    background: transparent;
                  }
                  .calendar-container .react-calendar__navigation button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .calendar-container .react-calendar__navigation button:enabled:hover,
                  .calendar-container .react-calendar__navigation button:enabled:focus {
                    background-color: rgba(139, 92, 246, 0.2);
                    color: #f3f4f6;
                  }
                  .calendar-container .react-calendar__month-view__weekdays {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                  }
                  .calendar-container .react-calendar__month-view__weekdays__weekday {
                    padding: 0.5rem;
                    color: #9ca3af;
                  }
                  .calendar-container .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                    color: #9ca3af;
                  }
                  .calendar-container .react-calendar__tile--hasWorkout {
                    position: relative;
                  }
                  .calendar-container .react-calendar__tile--hasWorkout::after {
                    content: '';
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background-color: rgb(139, 92, 246);
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
                  }
                  .calendar-container .react-calendar__tile:disabled {
                    color: #4b5563;
                    background: transparent;
                  }
                  .calendar-container .react-calendar__month-view__days__day--weekend {
                    color: #fb7185;
                  }
                  .calendar-container .react-calendar__month-view__days__day--neighboringMonth {
                    color: #4b5563;
                  }
                `}</style>
              </motion.div>
            </motion.div>

            {/* Achievement Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6"
            >
              {/* Recent Achievement */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Achievement</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">New</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">7-Day Streak</h4>
                    <p className="text-sm text-gray-500">Keep up the momentum!</p>
                  </div>
                </div>
              </motion.div>

              {/* Next Goal */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Next Goal</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Burn 3000 Calories</h4>
                    <p className="text-sm text-gray-500">550 calories remaining</p>
                  </div>
                </div>
              </motion.div>

              {/* Weekly Summary */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Weekly Summary</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">This Week</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">4 Workouts</h4>
                    <p className="text-sm text-gray-500">2 more to reach goal</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-3 md:p-6 min-h-[400px] md:min-h-[500px]"
                style={{
                  background: 'linear-gradient(135deg, white 0%, #eef2ff 100%)'
                }}
              >
                <WeightTracker userData={userData} />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-3 md:p-6 min-h-[400px] md:min-h-[500px]"
                style={{
                  background: 'linear-gradient(135deg, white 0%, #f0fdf4 100%)'
                }}
              >
                <WorkoutTracker userData={userData} />
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center py-2 ${
                item.active ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;