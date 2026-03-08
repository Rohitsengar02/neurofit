'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaFileMedical, FaUserMd, FaCloudUploadAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';

import { useAuth } from '@/app/context/AuthContext';
import { submitDoctorApplication } from '@/app/services/medicalService';

export default function DoctorApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    licenseNumber: '',
    hospital: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to apply');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitDoctorApplication({
        userId: user.uid,
        name: formData.name,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        bio: formData.bio
      });
      setStep(3);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => step === 3 ? router.push('/pages/doctors') : (step > 1 ? setStep(step - 1) : router.back())}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Apply as Doctor</h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="form1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 border border-blue-100 dark:border-blue-800">
                  <FaExclamationCircle className="text-blue-500 w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your application will be reviewed by our medical board within 24-48 hours.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Dr. John Doe"
                      className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Specialty</label>
                    <select 
                      className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    >
                      <option value="">Select Specialty</option>
                      <option value="neurology">Neurology</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="general">General Physician</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Medical License ID</label>
                    <input 
                      type="text" 
                      placeholder="MC-123456789"
                      className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
                >
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="form2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload Documents</h3>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaCloudUploadAlt className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Upload Medical Certificate</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Brief Bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 text-center flex items-center justify-center gap-3"
                >
                  {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Submitting...' : 'Submit Application'}
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Application Submitted!</h2>
                <p className="text-gray-400 text-center mb-8 px-4">
                  Thank you, <span className="text-blue-500 font-bold">{formData.name}</span>! Our team will review your credentials and get back to you via email.
                </p>
                <button
                  onClick={() => router.push('/pages/doctor-panel')}
                  className="w-full bg-blue-600 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-100 mb-3"
                >
                  Go to Doctor Dashboard
                </button>
                <button
                  onClick={() => router.push('/pages/doctors')}
                  className="w-full bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg"
                >
                  Return to Portal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}
