'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaFileMedical, FaUserMd, 
  FaCloudUploadAlt, FaCheckCircle, FaExclamationCircle,
  FaEnvelope, FaLock, FaUser, FaStethoscope, FaGraduationCap
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { auth, db } from '@/app/firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';

export default function DoctorApplyPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    experience: '',
    licenseNumber: '',
    hospital: 'NeuroFit Medical Center',
    bio: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        name: currentUser.displayName || prev.name
      }));
    }
  }, [currentUser]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let uid = currentUser?.uid;

      if (!uid) {
        // 1. Create User if not logged in
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        uid = userCredential.user.uid;
        // Update Profile
        await updateProfile(userCredential.user, { displayName: formData.name });
      }

      // 2. Create Doctor Application AND Auto-Approve for Demo/User Flow
      const appRef = doc(db, 'doctor_applications', uid);
      await setDoc(appRef, {
        userId: uid,
        name: formData.name,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        bio: formData.bio,
        status: 'approved', // Auto-approved as requested for dashboard access
        submittedAt: Timestamp.now()
      });

      // 3. Create/Update User Data entry
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        email: formData.email,
        displayName: formData.name,
        role: 'doctor',
        createdAt: Timestamp.now()
      }, { merge: true });

      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/pages/doctor-panel');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => step === 3 ? router.push('/pages/doctors') : (step > 1 ? setStep(step - 1) : router.back())}
              className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'register' ? 'Join as Doctor' : 'Doctor Sign In'}
            </h1>
          </div>

          {step < 3 && (
            <div className="flex bg-white dark:bg-gray-900 p-1 rounded-2xl mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'register' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400'
                }`}
              >
                Become a Doctor
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'login' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'register' && step === 1 && (
              <motion.div
                key="register-step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Full Name (Dr. Name)"
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="Doctor Email"
                      className={`w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white ${currentUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                      value={formData.email}
                      readOnly={!!currentUser}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  {!currentUser && (
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="password" 
                        placeholder="Create Password"
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="relative">
                    <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white appearance-none"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    >
                      <option value="">Select Specialty</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Sports Medicine">Sports Medicine</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Next Step
                </button>
              </motion.div>
            )}

            {activeTab === 'register' && step === 2 && (
              <motion.div
                key="register-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="License ID (e.g. MC-12345)"
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    />
                  </div>
                  <textarea 
                    rows={4}
                    placeholder="Brief professional bio..."
                    className="w-full px-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none text-sm"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button
                  disabled={loading}
                  onClick={handleRegister}
                  className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3"
                >
                  {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              </motion.div>
            )}

            {activeTab === 'login' && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="password" 
                      placeholder="Password"
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button
                  disabled={loading}
                  onClick={handleLogin}
                  className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3"
                >
                  {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <FaCheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Registration Success!</h2>
                <p className="text-gray-400 text-center mb-8 px-4">
                  Welcome to the platform, <span className="text-indigo-500 font-bold">{formData.name}</span>! You can now manage your patients and appointments.
                </p>
                <button
                  onClick={() => router.push('/pages/doctor-panel')}
                  className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-100 mb-4"
                >
                  Go to Doctor Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}
