'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiUpload, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';

const TrainerApplicationPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialties: [''],
    experience: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      website: ''
    }
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [socialKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle specialty changes
  const handleSpecialtyChange = (index: number, value: string) => {
    const newSpecialties = [...formData.specialties];
    newSpecialties[index] = value;
    
    setFormData({
      ...formData,
      specialties: newSpecialties
    });
  };
  
  // Add new specialty field
  const addSpecialty = () => {
    setFormData({
      ...formData,
      specialties: [...formData.specialties, '']
    });
  };
  
  // Remove specialty field
  const removeSpecialty = (index: number) => {
    if (formData.specialties.length <= 1) return;
    
    const newSpecialties = [...formData.specialties];
    newSpecialties.splice(index, 1);
    
    setFormData({
      ...formData,
      specialties: newSpecialties
    });
  };
  
  // Handle profile image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: 'Image size must be less than 5MB'
        });
        return;
      }
      
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      
      if (errors.profileImage) {
        setErrors({
          ...errors,
          profileImage: ''
        });
      }
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 100) {
      newErrors.bio = 'Bio should be at least 100 characters';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }
    
    const validSpecialties = formData.specialties.filter(s => s.trim().length > 0);
    if (validSpecialties.length === 0) {
      newErrors.specialties = 'At least one specialty is required';
    }
    
    if (!profileImage) {
      newErrors.profileImage = 'Profile image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login?redirect=/community/trainer/apply');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty specialties
      const validSpecialties = formData.specialties.filter(s => s.trim().length > 0);
      
      // Create trainer profile
      const trainer = await communityService.createTrainer(user.uid, {
        name: formData.name,
        bio: formData.bio,
        specialties: validSpecialties,
        experience: formData.experience,
        profileImage: '', // Will be updated after upload
        socialLinks: {
          instagram: formData.socialLinks.instagram || undefined,
          twitter: formData.socialLinks.twitter || undefined,
          youtube: formData.socialLinks.youtube || undefined,
          website: formData.socialLinks.website || undefined
        }
      });
      
      // Upload profile image
      if (profileImage) {
        await communityService.uploadTrainerProfileImage(trainer.id, profileImage);
      }
      
      setSubmitSuccess(true);
      
      // Redirect to trainer dashboard after 2 seconds
      setTimeout(() => {
        router.push('/community/trainer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating trainer profile:', error);
      setErrors({
        ...errors,
        submit: 'Failed to create trainer profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to sign in to apply as a trainer. Please sign in or create an account to continue.
          </p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={() => router.push('/login?redirect=/community/trainer/apply')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Application Submitted!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your trainer application has been submitted successfully. We'll review your application and get back to you soon.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8">
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              variants={itemVariants}
            >
              Become a Trainer
            </motion.h1>
            <motion.p 
              className="text-blue-100"
              variants={itemVariants}
            >
              Share your expertise, build your community, and grow your fitness business
            </motion.p>
          </div>
          
          {/* Form */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Profile Image */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Image *
                  </label>
                  <div className="flex items-center space-x-6">
                    <div 
                      className={`w-32 h-32 rounded-xl border-2 ${
                        errors.profileImage 
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                      } flex items-center justify-center overflow-hidden relative`}
                    >
                      {profileImagePreview ? (
                        <Image
                          src={profileImagePreview}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <FiUpload className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                        onClick={triggerFileInput}
                      >
                        Upload Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        JPG, PNG or GIF. Max 5MB.
                      </p>
                      {errors.profileImage && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                          {errors.profileImage}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* Name */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {errors.name}
                    </p>
                  )}
                </motion.div>
                
                {/* Bio */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.bio 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Tell us about yourself, your fitness philosophy, and what makes your training unique (minimum 100 characters)"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Minimum 100 characters
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.bio.length} characters
                    </p>
                  </div>
                  {errors.bio && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {errors.bio}
                    </p>
                  )}
                </motion.div>
                
                {/* Specialties */}
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Specialties *
                    </label>
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                      onClick={addSpecialty}
                    >
                      + Add Another
                    </button>
                  </div>
                  
                  {formData.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                        className={`flex-grow px-4 py-3 rounded-lg border ${
                          errors.specialties 
                            ? 'border-red-300 dark:border-red-700' 
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="e.g., Strength Training, Yoga, Nutrition"
                      />
                      {formData.specialties.length > 1 && (
                        <button
                          type="button"
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          onClick={() => removeSpecialty(index)}
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {errors.specialties && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {errors.specialties}
                    </p>
                  )}
                </motion.div>
                
                {/* Experience */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.experience 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select your experience level</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                  {errors.experience && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {errors.experience}
                    </p>
                  )}
                </motion.div>
                
                {/* Social Links */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Social Media Links (Optional)
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        id="instagram"
                        name="socialLinks.instagram"
                        value={formData.socialLinks.instagram}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://instagram.com/yourusername"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter
                      </label>
                      <input
                        type="text"
                        id="twitter"
                        name="socialLinks.twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        YouTube
                      </label>
                      <input
                        type="text"
                        id="youtube"
                        name="socialLinks.youtube"
                        value={formData.socialLinks.youtube}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://youtube.com/c/yourchannel"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        id="website"
                        name="socialLinks.website"
                        value={formData.socialLinks.website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* Terms and Conditions */}
                <motion.div variants={itemVariants} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <FiInfo className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        By submitting this application, you agree to our <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Community Guidelines</a>. Your application will be reviewed by our team, and you'll be notified once approved.
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  {errors.submit && (
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                      {errors.submit}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </motion.div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrainerApplicationPage;
