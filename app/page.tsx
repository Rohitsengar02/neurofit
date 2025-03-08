'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import MainLayout from './components/Layout/MainLayout';
import { auth } from './utils/firebase';
import { getUserData, saveUserData, UserData } from './utils/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Import Landing Page Sections
import HeroSection from './components/Landing/HeroSection';
import FeaturesSection from './components/Landing/FeaturesSection';
import ProgramsSection from './components/Landing/ProgramsSection';
import TestimonialsSection from './components/Landing/TestimonialsSection';
import PricingSection from './components/Landing/PricingSection';
import ContactSection from './components/Landing/ContactSection';
import NavBar from './components/Landing/NavBar';

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
import Navbar from './components/Navigation/Navbar';

interface StepProps {
  onNext: (...args: any[]) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

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
    mealtimes: []
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
  }
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();
  const totalSteps = 21;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('User is authenticated:', user.uid);
          const data = await getUserData();
          console.log('Fetched user data:', data);
          if (data) {
            setUserData(data);
            setOnboardingComplete(true);
            console.log('User has completed onboarding');
          } else {
            setCurrentStep(1);
            setUserData(initialUserData);
            console.log('User needs to complete onboarding');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        console.log('No authenticated user');
        setCurrentStep(0);
        setUserData(initialUserData);
        setOnboardingComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Programs', href: '#programs' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' }
  ];

  const updateUserData = async (newData: Partial<UserData>) => {
    try {
      const updatedData = {
        ...userData,
        ...newData
      };
      setUserData(updatedData);
      await saveUserData(updatedData);
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  const handleNext = async (stepData: any) => {
    try {
      await updateUserData(stepData);
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Onboarding complete, showing dashboard');
        setOnboardingComplete(true);
        const updatedData = await getUserData();
        if (updatedData) {
          setUserData(updatedData);
        }
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

  const handleBack = () => {
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
          <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full">
              <h1 className="text-3xl font-bold text-white text-center mb-8">
                Welcome to NeuroFit
              </h1>
              <AuthForm onSuccess={() => setCurrentStep(1)} />
            </div>
          </div>
        );
      case 1:
        return (
          <AgeSelection
            {...commonProps}
            onNext={async (data: { age: number }) => {
              await handleNext({
                personalInfo: { ...userData.personalInfo, age: data.age }
              });
            }}
          />
        );
      case 2:
        return (
          <GenderSelection
            {...commonProps}
            onNext={async (data: { gender: string }) => {
              await handleNext({
                personalInfo: { ...userData.personalInfo, gender: data.gender }
              });
            }}
          />
        );
      case 3:
        return (
          <BodyTypeSelection
            {...commonProps}
            onNext={async (data: { bodyType: string }) => {
              await handleNext({
                personalInfo: { ...userData.personalInfo, bodyType: data.bodyType }
              });
            }}
          />
        );
      case 4:
        return (
          <BodyFatSelection
            {...commonProps}
            onNext={async (data: { bodyFat: number }) => {
              await handleNext({
                personalInfo: { ...userData.personalInfo, bodyFat: data.bodyFat }
              });
            }}
          />
        );
      case 5:
        return (
          <FitnessGoals
            {...commonProps}
            onNext={async (goals: string[]) => {
              await handleNext({
                fitnessGoals: goals
              });
            }}
          />
        );
      case 6:
        return (
          <WeightGoals
            {...commonProps}
            onNext={async ({ currentWeight, targetWeight }: { currentWeight: number; targetWeight: number }) => {
              await handleNext({
                weightGoals: { currentWeight, targetWeight }
              });
            }}
          />
        );
      case 7:
        return (
          <ExperienceLevel
            {...commonProps}
            onNext={async (level: string) => {
              await handleNext({
                experienceLevel: level
              });
            }}
          />
        );
      case 8:
        return (
          <WeightliftingExperience
            {...commonProps}
            onNext={async (experience: string) => {
              await handleNext({
                weightliftingExperience: experience
              });
            }}
          />
        );
      case 9:
        return (
          <WorkoutLocation
            {...commonProps}
            onNext={async (location: string) => {
              await handleNext({
                workoutPreferences: { ...userData.workoutPreferences, location }
              });
            }}
          />
        );
      case 10:
        return (
          <WorkoutFrequency
            {...commonProps}
            onNext={async (frequency: string) => {
              await handleNext({
                workoutPreferences: { ...userData.workoutPreferences, frequency }
              });
            }}
          />
        );
      case 11:
        return (
          <WorkoutDuration
            {...commonProps}
            onNext={async (duration: number) => {
              await handleNext({
                workoutPreferences: { ...userData.workoutPreferences, duration: duration.toString() }
              });
            }}
          />
        );
      case 12:
        return (
          <WorkoutTimePreference
            {...commonProps}
            onNext={async ({ preferredTime, daysPerWeek, timePerWorkout }: { preferredTime: string; daysPerWeek: number; timePerWorkout: number }) => {
              await handleNext({
                workoutPreferences: { ...userData.workoutPreferences, preferredTime, daysPerWeek, timePerWorkout }
              });
            }}
          />
        );
      case 13:
        return (
          <WeeklySchedule
            {...commonProps}
            onNext={async ({ days, sessionsPerWeek }: { days: string[]; sessionsPerWeek: number }) => {
              await handleNext({
                weeklySchedule: days,
                workoutPreferences: { ...userData.workoutPreferences, daysPerWeek: sessionsPerWeek }
              });
            }}
          />
        );
      case 14:
        return (
          <DailyRoutine
            {...commonProps}
            onNext={async ({ wakeTime, sleepTime, mealsPerDay, workHours }: { 
              wakeTime: string; 
              sleepTime: string; 
              mealsPerDay: number;
              workHours: number;
            }) => {
              await handleNext({
                dailyRoutine: { 
                  wakeUpTime: wakeTime, 
                  sleepTime, 
                  mealtimes: Array(mealsPerDay).fill(''), // Initialize empty mealtime slots
                  workHours
                }
              });
            }}
          />
        );
      case 15:
        return (
          <ExercisePreferences
            {...commonProps}
            onNext={async (preferences: string[]) => {
              // Split the preferences into preferred and avoid exercises
              // Assume preferences with '-' prefix are exercises to avoid
              const preferredExercises = preferences.filter(p => !p.startsWith('-'));
              const avoidExercises = preferences
                .filter(p => p.startsWith('-'))
                .map(p => p.substring(1));

              await handleNext({
                exercisePreferences: { preferredExercises, avoidExercises }
              });
            }}
          />
        );
      case 16:
        return (
          <HealthConditions
            {...commonProps}
            onNext={async ({ conditions, medications, injuries }: { 
              conditions: string[]; 
              medications: boolean;
              injuries: string[];
            }) => {
              await handleNext({
                healthConditions: { 
                  conditions, 
                  medications: medications ? ['Taking medications'] : [], 
                  injuries 
                }
              });
            }}
          />
        );
      case 17:
        return (
          <Measurements
            {...commonProps}
            onNext={async ({ height, weight }: { height: number; weight: number }) => {
              await handleNext({
                measurements: {
                  height,
                  weight,
                  chest: userData.measurements?.chest || 0,
                  waist: userData.measurements?.waist || 0,
                  hips: userData.measurements?.hips || 0,
                  arms: userData.measurements?.arms || 0,
                  legs: userData.measurements?.legs || 0
                }
              });
            }}
          />
        );
      case 18:
        return (
          <StressLevel
            {...commonProps}
            onNext={async ({ stressLevel, stressors }: { stressLevel: number; stressors: string[] }) => {
              await handleNext({
                stressLevel: { 
                  level: stressLevel.toString(), // Convert number to string for storage
                  stressors 
                }
              });
            }}
          />
        );
      case 19:
        return (
          <TrainingHistory
            {...commonProps}
            onNext={async ({ previousExperience, trainingDuration, consistency }: {
              previousExperience: string[];
              trainingDuration: string;
              consistency: string;
            }) => {
              await handleNext({
                trainingHistory: {
                  previousExperience,
                  trainingDuration,
                  consistency
                }
              });
            }}
          />
        );
      case 20:
        return (
          <ProfileSetup
            onNext={() => {
              setCurrentStep(currentStep + 1);
              setUserData(prev => ({
                ...prev,
                currentStep: currentStep + 1
              }));
            }}
            onBack={() => {
              setCurrentStep(currentStep - 1);
              setUserData(prev => ({
                ...prev,
                currentStep: currentStep - 1
              }));
            }}
            commonProps={{
              initial: { opacity: 0, x: 50 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -50 },
              transition: { duration: 0.3 }
            }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (onboardingComplete && userData && auth.currentUser) {
    console.log('Rendering dashboard with user data:', userData);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </motion.div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Welcome to NeuroFit
          </h1>
          <AuthForm onSuccess={() => setCurrentStep(1)} />
        </div>
      </div>
    );
  }

  if (auth.currentUser && !onboardingComplete) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white">
          {renderOnboardingStep()}
        </div>
      </MainLayout>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-900">
      {/* Navigation Bar */}
     
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
              NeuroFit
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowAuth(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-300 text-center"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Landing Page Sections */}
      <HeroSection onGetStarted={() => setShowAuth(true)} />
      <FeaturesSection />
      <ProgramsSection />
      
      <TestimonialsSection />
      <PricingSection  />
    
    </main>
  );
}