'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import { auth } from './utils/firebase';
import { getUserData, saveUserData, UserData } from './utils/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AgeSelection from './components/OnboardingSteps/AgeSelection';
import BodyFatSelection from './components/OnboardingSteps/BodyFatSelection';
import BodyTypeSelection from './components/OnboardingSteps/BodyTypeSelection';
import DailyRoutine from './components/OnboardingSteps/DailyRoutine';
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();
  const totalSteps = 20;

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
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
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

  if (onboardingComplete && userData) {
    return <Dashboard userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {renderOnboardingStep()}
    </div>
  );
}