'use client';

import { useState } from 'react';
import { auth } from '@/app/utils/firebase';
import { motion } from 'framer-motion';
import { saveUserData, getUserData, UserData } from '@/app/utils/userService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  onSuccess?: () => void;
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
  },
  currentStep: 0
};

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login - no OTP needed for login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user.uid);
        
        // Check if user data exists
        const userData = await getUserData();
        console.log('User data after login:', userData);
        
        if (userData) {
          console.log('Existing user, proceeding to dashboard');
          onSuccess?.();
        } else {
          console.log('No user data found, starting onboarding');
          // Save initial data and start onboarding
          await saveUserData(initialUserData);
          onSuccess?.();
        }
      } else {
        // For sign up, we need to register the user directly
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Signup successful:', userCredential.user.uid);
        
        // Create initial user data in Firestore
        await saveUserData(initialUserData);
        console.log('Initial user data saved');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const authError = error as AuthError;
      let errorMessage = 'An error occurred during authentication';
      
      switch (authError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message || authError.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', userCredential.user.uid);
      
      // Check if user data exists
      const userData = await getUserData();
      console.log('User data after Google sign in:', userData);
      
      if (userData) {
        console.log('Existing Google user, redirecting to dashboard');
      } else {
        console.log('New Google user, saving initial data');
        // Save initial data for new users
        await saveUserData(initialUserData);
      }
      
      // Call onSuccess callback to handle redirect
      onSuccess?.();
      
      // If onSuccess is not provided, manually redirect
      if (!onSuccess) {
        router.push('/pages/home');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError('An error occurred during Google sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10 px-4 m-0"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-4"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back!' : 'Join NeuroFit'}
            </h2>
            <p className="text-blue-100">
              {isLogin
                ? 'Sign in to continue your fitness journey'
                : 'Create an account to start your fitness journey'}
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </motion.div>

            {error && (
              <motion.div 
                className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </motion.button>

            <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white/70">
                      Or
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center px-4 py-3 border border-white/20 rounded-xl text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>

            <motion.div 
              className="text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23FFFFFF' stroke-width='0.25'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}