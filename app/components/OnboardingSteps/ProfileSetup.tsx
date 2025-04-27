'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, writeBatch, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { FiUpload, FiUser, FiMail, FiPhone, FiImage } from 'react-icons/fi';
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
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
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
  
  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) {
      setError('Please enter a description for your avatar');
      return;
    }
    
    setGeneratingAvatar(true);
    setError('');
    
    try {
      // Use the existing working generate-image API instead
      // Enhanced prompt for better avatar generation
      const enhancedPrompt = `high quality, detailed avatar portrait of a person ${avatarPrompt}, digital art, profile picture, fitness app avatar, professional looking, centered composition, face clearly visible`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });
      
      const data = await response.json();
      
      if (data.imageUrl) {
        // For the generate-image API, we get the direct URL
        const imageUrl = data.imageUrl;
        
        try {
          // Convert the URL to a File object
          const fetchRes = await fetch(imageUrl);
          const blob = await fetchRes.blob();
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          
          setProfileImage(file);
          setPreviewUrl(imageUrl);
          setShowAvatarPrompt(false);
          setAvatarPrompt('');
        } catch (fetchError) {
          console.error('Error fetching image:', fetchError);
          throw new Error('Failed to process the generated image');
        }
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Failed to generate avatar');
      }
    } catch (error: any) {
      console.error('Error generating avatar:', error);
      setError(error.message || 'Failed to generate avatar. Please try again.');
    } finally {
      setGeneratingAvatar(false);
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
          phoneNumber: formData.phoneNumber, // Ensuring phone number is saved
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
        phoneNumber: formData.phoneNumber, // Adding phone number to users collection as well
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
          {/* Profile Image Upload - Enhanced Version */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-300"></div>
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <FiUser className="text-purple-500 dark:text-purple-400" size={50} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg opacity-80"></div>
                <label 
                  htmlFor="profile-upload" 
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-white font-medium z-10"
                >
                  <FiUpload size={16} />
                  <span>Upload</span>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </motion.div>
              
              <motion.button 
                type="button" 
                onClick={() => setShowAvatarPrompt(true)}
                className="relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg opacity-80"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium z-10">
                  <FiImage size={16} />
                  <span>AI Avatar</span>
                </div>
              </motion.button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Upload your photo or generate an AI avatar
            </p>
          </div>
          
          {/* AI Avatar Generator Modal */}
          {showAvatarPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Generate AI Avatar
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Describe how you want your avatar to look. For example: "a fitness trainer with short brown hair and blue eyes" or "professional athlete with a headband".
                </p>
                <textarea
                  value={avatarPrompt}
                  onChange={(e) => setAvatarPrompt(e.target.value)}
                  placeholder="Describe your avatar..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none mb-4"
                  rows={3}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPrompt(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={generatingAvatar}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    disabled={generatingAvatar}
                  >
                    {generatingAvatar ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate Avatar'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

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
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200"
                />
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll use this for account recovery and important notifications
              </p>
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
