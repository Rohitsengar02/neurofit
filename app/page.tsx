'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/DashboardMobile';
import MainLayout from './components/Layout/MainLayout';
import { auth } from './utils/firebase';
import { getUserData, saveUserData, UserData } from './utils/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Import all onboarding components
import AgeSelection from './components/OnboardingSteps/AgeSelection';
import BodyFatSelection from './components/OnboardingSteps/BodyFatSelection';
import BodyTypeSelection from './components/OnboardingSteps/BodyTypeSelection';
import DailyRoutine from './components/OnboardingSteps/DailyRoutine';
import ProfileSetup from './components/OnboardingSteps/ProfileSetup';
import ExercisePreferences from './components/OnboardingSteps/ExercisePreferences';
import ExperienceLevel from './components/OnboardingSteps/ExperienceLevel';
import FitnessGoals from './components/OnboardingSteps/FitnessGoals';
import GenderSelection from './components/OnboardingSteps/GenderSelection';
import HealthConditions from './components/OnboardingSteps/HealthConditions';
import Measurements from './components/OnboardingSteps/Measurements';
import StressLevel from './components/OnboardingSteps/StressLevel';
import TrainingHistory from './components/OnboardingSteps/TrainingHistory';
import WeeklySchedule from './components/OnboardingSteps/WeeklySchedule';
import WeightGoals from './components/OnboardingSteps/WeightGoals';
import WeightliftingExperience from './components/OnboardingSteps/WeightliftingExperience';
import WorkoutDuration from './components/OnboardingSteps/WorkoutDuration';
import WorkoutFrequency from './components/OnboardingSteps/WorkoutFrequency';
import WorkoutLocation from './components/OnboardingSteps/WorkoutLocation';
import WorkoutTimePreference from './components/OnboardingSteps/WorkoutTimePreference';

const initialUserData: UserData = {
  personalInfo: {
    name: '',
    age: 0,
    gender: '',
    bodyType: '',
    bodyFat: 0
  },
  fitnessGoals: [],
  weightGoals: {
    currentWeight: 0,
    targetWeight: 0
  },
  experienceLevel: '',
  weightliftingExperience: '',
  workoutPreferences: {
    daysPerWeek: 0,
    timePerWorkout: 0,
    preferredTime: '',
    location: '',
    frequency: '',
    duration: ''
  },
  weeklySchedule: [],
  dailyRoutine: {
    wakeUpTime: '',
    sleepTime: '',
    mealtimes: [],
    workHours: 0
  },
  exercisePreferences: {
    preferredExercises: [],
    avoidExercises: []
  },
  healthConditions: {
    conditions: [],
    medications: [],
    injuries: []
  },
  measurements: {
    height: 0,
    weight: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    legs: 0
  },
  stressLevel: {
    level: '',
    stressors: []
  },
  trainingHistory: {
    previousExperience: [],
    trainingDuration: '',
    consistency: ''
  },
  currentStep: 0
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const router = useRouter();
  const totalSteps = 21;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await getUserData();
          if (data && data.currentStep === totalSteps) {
            setUserData(data);
            setOnboardingComplete(true);
            setShowAuth(false);
          } else {
            const nextStep = data ? (data.currentStep || 1) : 1;
            setCurrentStep(nextStep);
            setUserData(data || initialUserData);
            setOnboardingComplete(false);
            setShowAuth(false);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setCurrentStep(1);
          setShowAuth(false);
        }
      } else {
        setCurrentStep(0);
        setUserData(initialUserData);
        setOnboardingComplete(false);
        setShowAuth(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNext = async (stepData: any) => {
    try {
      const updatedData = {
        ...userData,
        ...stepData,
        currentStep: currentStep + 1
      };
      await saveUserData(updatedData);
      setUserData(updatedData);

      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const finalData = {
          ...updatedData,
          currentStep: totalSteps
        };
        await saveUserData(finalData);
        setUserData(finalData);
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderOnboardingStep = () => {
    const commonProps = {
      currentStep,
      totalSteps,
      onPrevious: handlePrevious,
      userData
    };

    switch (currentStep) {
      case 0:
        return (
          <AuthForm onSuccess={() => {
            setCurrentStep(1);
            setShowAuth(false);
          }} />
        );
      case 1:
        return (
          <ProfileSetup
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(1)}
            commonProps={{ initial: { opacity: 0 }, animate: { opacity: 1 } }}
          />
        );
      case 2:
        return <AgeSelection {...commonProps} onNext={async (data) => handleNext({ personalInfo: { ...userData.personalInfo, age: data.age } })} />;
      case 3:
        return <GenderSelection {...commonProps} onNext={async (data) => handleNext({ personalInfo: { ...userData.personalInfo, gender: data.gender } })} />;
      case 4:
        return <BodyTypeSelection {...commonProps} onNext={async (data) => handleNext({ personalInfo: { ...userData.personalInfo, bodyType: data.bodyType } })} />;
      case 5:
        return <BodyFatSelection {...commonProps} onNext={async (data) => handleNext({ personalInfo: { ...userData.personalInfo, bodyFat: data.bodyFat } })} />;
      case 6:
        return <FitnessGoals {...commonProps} onNext={async (goals) => handleNext({ fitnessGoals: goals })} />;
      case 7:
        return <WeightGoals {...commonProps} onNext={async (data) => handleNext({ weightGoals: data })} />;
      case 8:
        return <ExperienceLevel {...commonProps} onNext={async (level) => handleNext({ experienceLevel: level })} />;
      case 9:
        return <WeightliftingExperience {...commonProps} onNext={async (exp) => handleNext({ weightliftingExperience: exp })} />;
      case 10:
        return <WorkoutLocation {...commonProps} onNext={async (loc) => handleNext({ workoutPreferences: { ...userData.workoutPreferences, location: loc } })} />;
      case 11:
        return <WorkoutFrequency {...commonProps} onNext={async (freq) => handleNext({ workoutPreferences: { ...userData.workoutPreferences, frequency: freq } })} />;
      case 12:
        return <WorkoutDuration {...commonProps} onNext={async (dur) => handleNext({ workoutPreferences: { ...userData.workoutPreferences, duration: dur.toString() } })} />;
      case 13:
        return <WorkoutTimePreference {...commonProps} onNext={async (data) => handleNext({ workoutPreferences: { ...userData.workoutPreferences, ...data } })} />;
      case 14:
        return <WeeklySchedule {...commonProps} onNext={async (data) => handleNext({ weeklySchedule: data.days, workoutPreferences: { ...userData.workoutPreferences, daysPerWeek: data.sessionsPerWeek } })} />;
      case 15:
        return <DailyRoutine {...commonProps} onNext={async (data) => handleNext({ dailyRoutine: { wakeUpTime: data.wakeTime, sleepTime: data.sleepTime, mealtimes: [], workHours: data.workHours } })} />;
      case 16:
        return <ExercisePreferences {...commonProps} onNext={async (pref) => handleNext({ exercisePreferences: { preferredExercises: pref.filter(p => !p.startsWith('-')), avoidExercises: pref.filter(p => p.startsWith('-')).map(p => p.substring(1)) } })} />;
      case 17:
        return <HealthConditions {...commonProps} onNext={async (data) => handleNext({ healthConditions: { conditions: data.conditions, medications: data.medications ? ['Taking medications'] : [], injuries: data.injuries } })} />;
      case 18:
        return <Measurements {...commonProps} onNext={async (data) => handleNext({ measurements: { ...userData.measurements, ...data } })} />;
      case 19:
        return <StressLevel {...commonProps} onNext={async (data) => handleNext({ stressLevel: { level: data.stressLevel.toString(), stressors: data.stressors } })} />;
      case 20:
        return <TrainingHistory {...commonProps} onNext={async (data) => handleNext({ trainingHistory: data })} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse">NeuroFit Loading...</p>
      </div>
    );
  }

  if (!auth.currentUser || showAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <AuthForm onSuccess={() => {
          setShowAuth(false);
          setCurrentStep(1);
        }} />
      </div>
    );
  }

  if (onboardingComplete && auth.currentUser) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </motion.div>
    );
  }

  if (auth.currentUser && !onboardingComplete) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderOnboardingStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </MainLayout>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Welcome to NeuroFit
          </h1>
          <AuthForm onSuccess={() => {
            setCurrentStep(1);
            setUserData(prev => ({
              ...prev,
              currentStep: 1
            }));
            setShowAuth(false);
          }} />
        </div>
      </div>
    );
  }
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderOnboardingStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}