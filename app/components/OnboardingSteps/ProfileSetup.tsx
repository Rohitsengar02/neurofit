'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, writeBatch, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { FiUpload, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ProfileSetupProps {
  onNext: () => void;
  onBack: () => void;
  commonProps?: any;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onNext, onBack, commonProps }) => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const auth = getAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: auth.currentUser?.email || '',
  });
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500000) { // 500KB limit
        setError('Image size should be less than 500KB');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No user found');
      }

      let base64Image = '';

      // Convert image to base64 if selected
      if (profileImage) {
        try {
          const reader = new FileReader();
          base64Image = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(profileImage);
          });
        } catch (error) {
          console.error('Error converting image:', error);
          setError('Failed to process image. Please try again.');
          return;
        }
      }

      const db = getFirestore();
      const batch = writeBatch(db);

      // Save to userdata collection
      const userProfileRef = doc(db, 'userdata', user.uid);
      const profileData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          email: user.email,
          ...(base64Image && { profileImage: base64Image }),
          updatedAt: new Date().toISOString()
        },
        onboardingCompleted: true
      };
      batch.set(userProfileRef, profileData, { merge: true });

      // Save to users collection
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        ...(base64Image && { photoURL: base64Image }),
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };
      batch.set(userRef, userData, { merge: true });

      // Commit both updates
      await batch.commit();
      
      // Wait for onNext to complete onboarding process
      await onNext();
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to home/dashboard
      router.push('/');
      router.refresh(); // Force a refresh to update the UI
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...commonProps}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FiUser className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors"
              >
                <FiUpload className="w-4 h-4 text-white" />
              </label>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload your profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onBack}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-zinc-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a20bdb]"
            >
              Back
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#a20bdb] hover:bg-[#8c09bd] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a20bdb] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Continue'}
            </motion.button>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center mt-2">{error}</p>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileSetup;
