'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { FiEdit2, FiCamera, FiSave, FiX } from 'react-icons/fi';
import {
  FaUserAlt,
  FaRulerVertical,
  FaWeight,
  FaDumbbell,
  FaBirthdayCake,
  FaVenusMars,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaMoon,
  FaUtensils,
  FaRunning,
  FaHeart,
  FaBan,
  FaHeartbeat,
  FaNotesMedical,
  FaPills,
  FaBandAid,
  FaBrain,
  FaChartLine,
  FaExclamationTriangle,
  FaFlag,
  FaSun,
} from 'react-icons/fa';
import { IoFitness, IoNutrition } from 'react-icons/io5';
import { MdFitnessCenter, MdEmail, MdLocationOn } from 'react-icons/md';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { UserData } from '../../utils/userService';

interface UserProfile {
  email?: string;
  uid?: string;
  photoURL?: string;
  createdAt?: string;
  lastUpdated?: string;
}

type EditableSection = 'personalInfo' | 'measurements' | 'weightGoals' | 'workoutPreferences';

interface EditFormData {
  personalInfo?: Partial<UserData['personalInfo']>;
  measurements?: Partial<UserData['measurements']>;
  weightGoals?: Partial<UserData['weightGoals']>;
  workoutPreferences?: Partial<UserData['workoutPreferences']>;
}

const ProfilePage = () => {
  const auth = getAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        // Get user profile data
        const userProfileRef = doc(db, `users/${auth.currentUser.uid}/userData`, 'profile');
        const userProfileSnap = await getDoc(userProfileRef);
        
        if (userProfileSnap.exists()) {
          const profileData = userProfileSnap.data() as UserData;
          setUserData(profileData);
          
          // Get basic user data
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUser({
              ...userSnap.data(),
              photoURL: userSnap.data().photoURL || '/default-avatar.png'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      toast.loading('Uploading image...');
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      const result = await uploadToCloudinary(file);
      const photoURL = result.url;
      
      // Update user document with new photo URL
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL });
      
      setUser((prev: UserProfile | null) => prev ? { ...prev, photoURL } : { photoURL });
      toast.dismiss();
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl('');
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userData) return;

    try {
      toast.loading('Updating profile...');
      
      // Update userData collection
      const userDataRef = doc(db, `users/${auth.currentUser.uid}/userData`, 'profile');
      await updateDoc(userDataRef, {
        ...userData,
        lastUpdated: new Date().toISOString()
      });

      setEditing(false);
      toast.dismiss();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss();
      toast.error('Failed to update profile');
    }
  };

  const handleEditClick = (section: EditableSection) => {
    setEditingSection(section);
    if (userData) {
      // Initialize edit form with current section data
      switch (section) {
        case 'personalInfo':
          setEditForm({ personalInfo: { ...userData.personalInfo } });
          break;
        case 'measurements':
          setEditForm({ measurements: { ...userData.measurements } });
          break;
        case 'weightGoals':
          setEditForm({ weightGoals: { ...userData.weightGoals } });
          break;
        case 'workoutPreferences':
          setEditForm({ workoutPreferences: { ...userData.workoutPreferences } });
          break;
        default:
          setEditForm({});
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section: EditableSection, field: string) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setEditForm(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const handleUpdateSection = async () => {
    if (!auth.currentUser || !editingSection || !userData) return;

    try {
      toast.loading('Updating profile...');
      
      // Create update object with only the edited section
      const updates = {
        ...userData,
        [editingSection]: {
          ...(userData[editingSection]),
          ...(editForm[editingSection] || {})
        }
      };

      // Update userData collection
      const userDataRef = doc(db, `users/${auth.currentUser.uid}/userData`, 'profile');
      await updateDoc(userDataRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      setUserData(updates);
      setEditingSection(null);
      setEditForm({});
      
      toast.dismiss();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss();
      toast.error('Failed to update profile');
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="absolute -bottom-16 w-full flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-zinc-800 overflow-hidden bg-white dark:bg-zinc-800">
                  <Image
                    src={user?.photoURL || '/default-avatar.png'}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                  <FiCamera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="pt-20 pb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {userData.personalInfo.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.email}</p>
            <div className="flex justify-center gap-4">
              <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                <span className="text-purple-600 dark:text-purple-400">{userData.experienceLevel}</span>
              </div>
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <span className="text-blue-600 dark:text-blue-400">{userData.workoutPreferences.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <FaUserAlt className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                </div>
                <button
                  onClick={() => handleEditClick('personalInfo')}
                  className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {editingSection === 'personalInfo' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.personalInfo?.name || ''}
                        onChange={(e) => handleInputChange(e, 'personalInfo', 'name')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Age</label>
                      <input
                        type="number"
                        value={editForm.personalInfo?.age || ''}
                        onChange={(e) => handleInputChange(e, 'personalInfo', 'age')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Gender</label>
                      <select
                        value={editForm.personalInfo?.gender || ''}
                        onChange={(e) => handleInputChange(e, 'personalInfo', 'gender')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setEditForm({});
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateSection}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg hover:shadow-purple-500/25"
                      >
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-3">
                        <FaBirthdayCake className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Age</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{userData.personalInfo.age} years</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-3">
                        <FaVenusMars className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Gender</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{userData.personalInfo.gender}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <IoFitness className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Body Type</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{userData.personalInfo.bodyType}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Physical Measurements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <FaRulerVertical className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Body Measurements</h3>
                </div>
                <button
                  onClick={() => handleEditClick('measurements')}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {editingSection === 'measurements' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={editForm.measurements?.height || ''}
                        onChange={(e) => handleInputChange(e, 'measurements', 'height')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={editForm.measurements?.weight || ''}
                        onChange={(e) => handleInputChange(e, 'measurements', 'weight')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setEditForm({});
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateSection}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/25"
                      >
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-6"
                  >
                    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                      <FaRulerVertical className="w-6 h-6 text-blue-500 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Height</span>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{userData.measurements.height} cm</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                      <FaWeight className="w-6 h-6 text-blue-500 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{userData.measurements.weight} kg</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                      <FaDumbbell className="w-6 h-6 text-blue-500 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Body Fat</span>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{userData.personalInfo.bodyFat}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Fitness Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <FaFlag className="w-5 h-5 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fitness Goals</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {userData.fitnessGoals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm font-medium"
                  >
                    {goal}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Weight Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <FaWeight className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight Goals</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Weight</span>
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {userData.weightGoals.currentWeight}
                    <span className="text-sm ml-1">kg</span>
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Target Weight</span>
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {userData.weightGoals.targetWeight}
                    <span className="text-sm ml-1">kg</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workout Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <FaDumbbell className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Preferences</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarAlt className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Days per Week</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.workoutPreferences.daysPerWeek} days
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaClock className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Time per Workout</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.workoutPreferences.timePerWorkout} min
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaSun className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Preferred Time</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.workoutPreferences.preferredTime}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaMapMarkerAlt className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.workoutPreferences.location}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaStar className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Experience Level</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.experienceLevel}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaDumbbell className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Weightlifting Exp.</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.weightliftingExperience}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Routine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FaClock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Routine</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaSun className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Wake Up Time</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.dailyRoutine.wakeUpTime}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaMoon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sleep Time</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userData.dailyRoutine.sleepTime}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FaUtensils className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Meal Times</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.dailyRoutine.mealtimes.map((time, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Exercise Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                    <FaRunning className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exercise Preferences</h3>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaHeart className="w-5 h-5 text-pink-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Preferred Exercises</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.exercisePreferences.preferredExercises.map((exercise, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-xl text-sm font-medium"
                      >
                        {exercise}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaBan className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Exercises to Avoid</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.exercisePreferences.avoidExercises.map((exercise, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium"
                      >
                        {exercise}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Health Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <FaHeartbeat className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Information</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaNotesMedical className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Medical Conditions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.healthConditions.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaPills className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Medications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.healthConditions.medications.map((medication, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium"
                      >
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaBandAid className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Injuries</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.healthConditions.injuries.map((injury, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl text-sm font-medium"
                      >
                        {injury}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stress Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <FaBrain className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stress Management</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaChartLine className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stress Level</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {userData.stressLevel.level}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaExclamationTriangle className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stressors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userData.stressLevel.stressors.map((stressor, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-xl text-sm font-medium"
                      >
                        {stressor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
