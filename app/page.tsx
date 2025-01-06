'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import { getUserData, saveUserData, UserData } from './utils/userService';
import AuthForm from './components/Auth/AuthForm';
import GoalSelection from './components/OnboardingSteps/GoalSelection';
import WeightGoals from './components/OnboardingSteps/WeightGoals';
import ExperienceLevel from './components/OnboardingSteps/ExperienceLevel';
import WorkoutTimePreference from './components/OnboardingSteps/WorkoutTimePreference';
import TrainingHistory from './components/OnboardingSteps/TrainingHistory';
import Dashboard from './components/Dashboard/Dashboard';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();
  const totalSteps = 5;

  const [userData, setUserData] = useState<UserData>({
    personalInfo: {
      name: '',
      age: 0,
      gender: ''
    },
    fitnessGoals: [],
    weightGoals: {
      currentWeight: 0,
      targetWeight: 0
    },
    experienceLevel: '',
    workoutPreferences: {
      daysPerWeek: 0,
      timePerWorkout: 0,
      preferredTime: ''
    },
    trainingHistory: {
      previousExperience: [],
      trainingDuration: '',
      consistency: ''
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const existingData = await getUserData();
          if (existingData) {
            setHasCompletedOnboarding(true);
            setUserData(existingData);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      } else {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoalSelection = async (goals: string[]) => {
    const updatedData = {
      ...userData,
      fitnessGoals: goals
    };
    setUserData(updatedData);
    await saveUserData(updatedData);
    setCurrentStep(2);
  };

  const handleWeightGoals = async (weightData: { currentWeight: number; targetWeight: number }) => {
    const updatedData = {
      ...userData,
      weightGoals: weightData
    };
    setUserData(updatedData);
    await saveUserData(updatedData);
    setCurrentStep(3);
  };

  const handleExperienceLevel = async (level: string) => {
    const updatedData = {
      ...userData,
      experienceLevel: level
    };
    setUserData(updatedData);
    await saveUserData(updatedData);
    setCurrentStep(4);
  };

  const handleWorkoutPreferences = async (preferences: {
    daysPerWeek: number;
    timePerWorkout: number;
    preferredTime: string;
  }) => {
    const updatedData = {
      ...userData,
      workoutPreferences: preferences
    };
    setUserData(updatedData);
    await saveUserData(updatedData);
    setCurrentStep(5);
  };

  const handleTrainingHistory = async (history: {
    previousExperience: string[];
    trainingDuration: string;
    consistency: string;
  }) => {
    const updatedData = {
      ...userData,
      trainingHistory: history
    };
    
    try {
      await saveUserData(updatedData);
      setUserData(updatedData);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (hasCompletedOnboarding) {
    return <Dashboard />;
  }

  const renderOnboardingStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GoalSelection
            onNext={handleGoalSelection}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      case 2:
        return (
          <WeightGoals
            onNext={handleWeightGoals}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <ExperienceLevel
            onNext={handleExperienceLevel}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <WorkoutTimePreference
            onNext={handleWorkoutPreferences}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <TrainingHistory
            onNext={handleTrainingHistory}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => setCurrentStep(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {renderOnboardingStep()}
    </main>
  );
}