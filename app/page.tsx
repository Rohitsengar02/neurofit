'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import { getUserData, saveUserData, UserData } from './utils/userService';
import AuthForm from './components/Auth/AuthForm';
import AgeSelection from './components/OnboardingSteps/AgeSelection';
import BodyFatSelection from './components/OnboardingSteps/BodyFatSelection';
import BodyTypeSelection from './components/OnboardingSteps/BodyTypeSelection';
import DailyRoutine from './components/OnboardingSteps/DailyRoutine';
import ExercisePreferences from './components/OnboardingSteps/ExercisePreferences';
import ExperienceLevel from './components/OnboardingSteps/ExperienceLevel';
import FitnessGoals from './components/OnboardingSteps/FitnessGoals';
import GenderSelection from './components/OnboardingSteps/GenderSelection';
import GoalSelection from './components/OnboardingSteps/GoalSelection';
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
import Dashboard from './components/Dashboard/Dashboard';

interface StepProps {
  onNext: (...args: any[]) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
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
  });
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();
  const totalSteps = 20;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const checkUserData = async () => {
          try {
            const data = await getUserData();
            if (data) {
              setUserData(data);
              setOnboardingComplete(true);
            }
            setLoading(false);
          } catch (error) {
            console.error('Error checking user data:', error);
            setLoading(false);
          }
        };

        checkUserData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoalSelection = async (goals: string[]) => {
    try {
      const updatedData = {
        ...userData,
        fitnessGoals: goals
      };
      await saveUserData(updatedData);
      setUserData(updatedData);
      setCurrentStep(6);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleExperienceLevel = async (level: string) => {
    try {
      const updatedData = {
        ...userData,
        experienceLevel: level
      };
      await saveUserData(updatedData);
      setUserData(updatedData);
      setCurrentStep(9);
    } catch (error) {
      console.error('Error saving experience level:', error);
    }
  };

  const handleWorkoutPreferences = async (data: {
    daysPerWeek: number;
    timePerWorkout: number;
    preferredTime: string;
  }) => {
    try {
      const updatedData = {
        ...userData,
        workoutPreferences: {
          ...userData.workoutPreferences,
          ...data
        }
      };
      await saveUserData(updatedData);
      setUserData(updatedData);
      setCurrentStep(14);
    } catch (error) {
      console.error('Error saving workout preferences:', error);
    }
  };

  const handleTrainingHistory = async (data: {
    previousExperience: string[];
    trainingDuration: string;
    consistency: string;
  }) => {
    try {
      const updatedData = {
        ...userData,
        trainingHistory: data
      };
      await saveUserData(updatedData);
      setUserData(updatedData);
      setOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving training history:', error);
    }
  };

  const handlePrevious = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const renderOnboardingStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full">
              <h1 className="text-3xl font-bold text-white text-center mb-8">
                Welcome to NeuroFit
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Let&apos;s start by creating your account or signing in
              </p>
              <AuthForm onSuccess={() => {
                setCurrentStep(2);
              }} />
            </div>
          </div>
        );
      case 2:
        return (
          <GenderSelection
            onNext={async ({ gender }: { gender: string }) => {
              try {
                const updatedData = {
                  ...userData,
                  personalInfo: { ...userData.personalInfo, gender }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(3);
              } catch (error) {
                console.error('Error saving gender:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(1)}
          />
        );
      case 3:
        return (
          <AgeSelection
            onNext={async ({ age }: { age: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  personalInfo: { ...userData.personalInfo, age }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(4);
              } catch (error) {
                console.error('Error saving age:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(2)}
          />
        );
      case 4:
        return (
          <BodyTypeSelection
            onNext={async ({ bodyType }: { bodyType: string}) => {
              try {
                const updatedData = {
                  ...userData,
                  personalInfo: { ...userData.personalInfo, bodyType }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(5);
              } catch (error) {
                console.error('Error saving body type:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(3)}
          />
        );
      case 5:
        return (
          <BodyFatSelection
            onNext={async ({ bodyFat }: { bodyFat: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  personalInfo: { ...userData.personalInfo, bodyFat }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(6);
              } catch (error) {
                console.error('Error saving body fat:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(4)}
          />
        );
      
      case 6:
        return (
          <FitnessGoals
            onNext={async (goals: string[]) => {
              try {
                const updatedData = {
                  ...userData,
                  fitnessGoals: goals
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(7);
              } catch (error) {
                console.error('Error saving fitness goals:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(5)}
          />
        );
      case 7:
        return (
          <WeightGoals
            onNext={async ({ currentWeight, targetWeight }: { currentWeight: number; targetWeight: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  weightGoals: { currentWeight, targetWeight }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(8);
              } catch (error) {
                console.error('Error saving weight goals:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(6)}
          />
        );
      case 8:
        return (
          <ExperienceLevel
            onNext={async (level: string) => {
              try {
                const updatedData = {
                  ...userData,
                  experienceLevel: level
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(9);
              } catch (error) {
                console.error('Error saving experience level:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(7)}
          />
        );
      case 9:
        return (
          <WeightliftingExperience
            onNext={async (experience: string) => {
              try {
                const updatedData = {
                  ...userData,
                  weightliftingExperience: experience
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(10);
              } catch (error) {
                console.error('Error saving weightlifting experience:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(8)}
          />
        );
      case 10:
        return (
          <WorkoutLocation
            onNext={async (location: string) => {
              try {
                const updatedData = {
                  ...userData,
                  workoutPreferences: {
                    ...userData.workoutPreferences,
                    location
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(11);
              } catch (error) {
                console.error('Error saving workout location:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(9)}
          />
        );
      case 11:
        return (
          <WorkoutFrequency
            onNext={async (frequency: string) => {
              try {
                const updatedData = {
                  ...userData,
                  workoutPreferences: {
                    ...userData.workoutPreferences,
                    frequency
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(12);
              } catch (error) {
                console.error('Error saving workout frequency:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(10)}
          />
        );
      case 12:
        return (
          <WorkoutDuration
            onNext={async (duration: number) => {
              try {
                const updatedData = {
                  ...userData,
                  workoutPreferences: {
                    ...userData.workoutPreferences,
                    duration: duration.toString()
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(13);
              } catch (error) {
                console.error('Error saving workout duration:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(11)}
          />
        );
      case 13:
        return (
          <WorkoutTimePreference
            onNext={async ({ preferredTime, daysPerWeek, timePerWorkout }: { preferredTime: string; daysPerWeek: number; timePerWorkout: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  workoutPreferences: {
                    ...userData.workoutPreferences,
                    preferredTime,
                    daysPerWeek,
                    timePerWorkout
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(14);
              } catch (error) {
                console.error('Error saving workout preferences:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(12)}
          />
        );
      case 14:
        return (
          <WeeklySchedule
            onNext={async ({ days, sessionsPerWeek }: { days: string[]; sessionsPerWeek: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  weeklySchedule: days,
                  workoutPreferences: {
                    ...userData.workoutPreferences,
                    daysPerWeek: sessionsPerWeek
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(15);
              } catch (error) {
                console.error('Error saving weekly schedule:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(13)}
          />
        );
      case 15:
        return (
          <DailyRoutine
            onNext={async ({ wakeTime, sleepTime, mealsPerDay, workHours }: { 
              wakeTime: string; 
              sleepTime: string; 
              mealsPerDay: number;
              workHours: number;
            }) => {
              try {
                const updatedData = {
                  ...userData,
                  dailyRoutine: { 
                    wakeUpTime: wakeTime, 
                    sleepTime, 
                    mealtimes: Array(mealsPerDay).fill(''), // Initialize empty mealtime slots
                    workHours
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(16);
              } catch (error) {
                console.error('Error saving daily routine:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(14)}
          />
        );
      case 16:
        return (
          <ExercisePreferences
            onNext={async (preferences: string[]) => {
              try {
                // Split the preferences into preferred and avoid exercises
                // Assume preferences with '-' prefix are exercises to avoid
                const preferredExercises = preferences.filter(p => !p.startsWith('-'));
                const avoidExercises = preferences
                  .filter(p => p.startsWith('-'))
                  .map(p => p.substring(1));

                const updatedData = {
                  ...userData,
                  exercisePreferences: { preferredExercises, avoidExercises }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(17);
              } catch (error) {
                console.error('Error saving exercise preferences:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(15)}
          />
        );
      case 17:
        return (
          <HealthConditions
            onNext={async ({ conditions, medications, injuries }: { 
              conditions: string[]; 
              medications: boolean;
              injuries: string[];
            }) => {
              try {
                const updatedData = {
                  ...userData,
                  healthConditions: { 
                    conditions, 
                    medications: medications ? ['Taking medications'] : [], 
                    injuries 
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(18);
              } catch (error) {
                console.error('Error saving health conditions:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(16)}
          />
        );
      case 18:
        return (
          <Measurements
            onNext={async ({ height, weight }: { height: number; weight: number }) => {
              try {
                const updatedData = {
                  ...userData,
                  measurements: {
                    height,
                    weight,
                    chest: userData.measurements?.chest || 0,
                    waist: userData.measurements?.waist || 0,
                    hips: userData.measurements?.hips || 0,
                    arms: userData.measurements?.arms || 0,
                    legs: userData.measurements?.legs || 0
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(19);
              } catch (error) {
                console.error('Error saving measurements:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(17)}
          />
        );
      case 19:
        return (
          <StressLevel
            onNext={async ({ stressLevel, stressors }: { stressLevel: number; stressors: string[] }) => {
              try {
                const updatedData = {
                  ...userData,
                  stressLevel: { 
                    level: stressLevel.toString(), // Convert number to string for storage
                    stressors 
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setCurrentStep(20);
              } catch (error) {
                console.error('Error saving stress level:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(18)}
          />
        );
      case 20:
        return (
          <TrainingHistory
            onNext={async ({ previousExperience, trainingDuration, consistency }: {
              previousExperience: string[];
              trainingDuration: string;
              consistency: string;
            }) => {
              try {
                const updatedData = {
                  ...userData,
                  trainingHistory: {
                    previousExperience,
                    trainingDuration,
                    consistency
                  }
                };
                await saveUserData(updatedData);
                setUserData(updatedData);
                setOnboardingComplete(true);
              } catch (error) {
                console.error('Error saving training history:', error);
              }
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => handlePrevious(19)}
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

  if (!userData) {
    return <AuthForm />;
  }

  // Show dashboard if onboarding is complete
  if (onboardingComplete && userData) {
    return <Dashboard userData={userData} />;
  }

  // Show onboarding steps if not complete
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {renderOnboardingStep()}
    </div>
  );
}