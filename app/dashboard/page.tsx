'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import WorkoutOverview from '../components/Dashboard/WorkoutOverview';
import ProgressStats from '../components/Dashboard/ProgressStats';
import NextWorkout from '../components/Dashboard/NextWorkout';
import WeeklyProgress from '../components/Dashboard/WeeklyProgress';

interface UserData {
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  frequency?: string;
  experience?: string;
  onboardingCompleted?: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          if (!data.onboardingCompleted) {
            router.push('/');
            return;
          }
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout Overview */}
          <WorkoutOverview userData={userData} />
          
          {/* Weekly Progress Chart */}
          <WeeklyProgress />
          
          {/* Progress Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressStats
              title="Weight Progress"
              value={userData?.weight || 0}
              unit="kg"
              change="+1.5"
              timeframe="This Month"
            />
            <ProgressStats
              title="Workouts Completed"
              value={12}
              unit="sessions"
              change="+3"
              timeframe="This Week"
            />
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Next Workout Card */}
          <NextWorkout />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6">
            <ProgressStats
              title="Current Streak"
              value={5}
              unit="days"
              change="+2"
              timeframe="Personal Best"
            />
            <ProgressStats
              title="Monthly Goal"
              value={75}
              unit="%"
              change="+15"
              timeframe="Progress"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
