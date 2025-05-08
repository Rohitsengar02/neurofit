'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiUpload, FiPlus, FiX, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';
import * as subscriptionService from '../services/subscriptionService';

const CreateCommunityPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [trainer, setTrainer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    aboutUs: '',
    categories: [''],
    tags: [],
    isPrivate: false
  });
  
  const [subscriptionTiers, setSubscriptionTiers] = useState([
    {
      name: 'Basic',
      price: '9.99',
      description: 'Access to live sessions and community feed',
      features: ['Live group sessions', 'Community feed access']
    }
  ]);
  
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Gallery images
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch trainer profile
  useEffect(() => {
    const fetchTrainerProfile = async () => {
      if (!user) {
        router.push('/login?redirect=/community/trainer/create');
        return;
      }
      
      try {
        const trainerData = await communityService.getTrainerByUserId(user.uid);
        
        if (!trainerData) {
          // No trainer profile found, redirect to application page
          router.push('/community/trainer/apply');
          return;
        }
        
        setTrainer(trainerData);
      } catch (error) {
        console.error('Error fetching trainer profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainerProfile();
  }, [user]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle category changes
  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    
    setFormData({
      ...formData,
      categories: newCategories
    });
  };
  
  // Add new category field
  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, '']
    });
  };
  
  // Remove category field
  const removeCategory = (index: number) => {
    if (formData.categories.length <= 1) return;
    
    const newCategories = [...formData.categories];
    newCategories.splice(index, 1);
    
    setFormData({
      ...formData,
      categories: newCategories
    });
  };
  
  // Handle subscription tier changes
  const handleTierChange = (index: number, field: string, value: string) => {
    const newTiers = [...subscriptionTiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
    
    setSubscriptionTiers(newTiers);
  };
  
  // Handle tier feature changes
  const handleTierFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
    const newTiers = [...subscriptionTiers];
    const newFeatures = [...newTiers[tierIndex].features];
    newFeatures[featureIndex] = value;
    
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: newFeatures
    };
    
    setSubscriptionTiers(newTiers);
  };
  
  // Add new tier feature
  const addTierFeature = (tierIndex: number) => {
    const newTiers = [...subscriptionTiers];
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: [...newTiers[tierIndex].features, '']
    };
    
    setSubscriptionTiers(newTiers);
  };
  
  // Remove tier feature
  const removeTierFeature = (tierIndex: number, featureIndex: number) => {
    if (subscriptionTiers[tierIndex].features.length <= 1) return;
    
    const newTiers = [...subscriptionTiers];
    const newFeatures = [...newTiers[tierIndex].features];
    newFeatures.splice(featureIndex, 1);
    
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      features: newFeatures
    };
    
    setSubscriptionTiers(newTiers);
  };
  
  // Add new subscription tier
  const addSubscriptionTier = () => {
    setSubscriptionTiers([
      ...subscriptionTiers,
      {
        name: `Tier ${subscriptionTiers.length + 1}`,
        price: '19.99',
        description: 'Premium access to all content',
        features: ['All basic features', 'Premium content access']
      }
    ]);
  };
  
  // Remove subscription tier
  const removeSubscriptionTier = (index: number) => {
    if (subscriptionTiers.length <= 1) return;
    
    const newTiers = [...subscriptionTiers];
    newTiers.splice(index, 1);
    
    setSubscriptionTiers(newTiers);
  };
  
  // Handle logo image upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          logoImage: 'Image size must be less than 5MB'
        });
        return;
      }
      
      setLogoImage(file);
      setLogoImagePreview(URL.createObjectURL(file));
      
      if (errors.logoImage) {
        setErrors({
          ...errors,
          logoImage: ''
        });
      }
    }
  };
  
  // Handle cover image upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          coverImage: 'Image size must be less than 5MB'
        });
        return;
      }
      
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      
      if (errors.coverImage) {
        setErrors({
          ...errors,
          coverImage: ''
        });
      }
    }
  };
  
  // Trigger file input click
  const triggerLogoInput = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };
  
  const triggerCoverInput = () => {
    if (coverInputRef.current) {
      coverInputRef.current.click();
    }
  };
  
  // Trigger gallery file input click
  const triggerGalleryInput = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };
  
  // Handle gallery images upload
  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages: File[] = [];
    const newPreviews: string[] = [];
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setErrors({
          ...errors,
          galleryImages: 'Please upload only image files.'
        });
        return;
      }
      
      // Size check (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          galleryImages: 'Images must be less than 5MB.'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === Array.from(files).length) {
          setGalleryImagePreviews([...galleryImagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newImages.push(file);
    });
    
    setGalleryImages([...galleryImages, ...newImages]);
    
    // Clear error if it exists
    if (errors.galleryImages) {
      setErrors({
        ...errors,
        galleryImages: ''
      });
    }
  };
  
  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setGalleryImages(newImages);
    
    const newPreviews = [...galleryImagePreviews];
    newPreviews.splice(index, 1);
    setGalleryImagePreviews(newPreviews);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    const validCategories = formData.categories.filter(c => c.trim().length > 0);
    if (validCategories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }
    
    if (!logoImage) {
      newErrors.logoImage = 'Logo image is required';
    }
    
    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    // Validate subscription tiers
    let tierErrors = false;
    subscriptionTiers.forEach((tier, index) => {
      if (!tier.name.trim() || !tier.price.trim() || !tier.description.trim()) {
        tierErrors = true;
      }
      
      const validFeatures = tier.features.filter(f => f.trim().length > 0);
      if (validFeatures.length === 0) {
        tierErrors = true;
      }
    });
    
    if (tierErrors) {
      newErrors.tiers = 'All subscription tier fields are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !trainer) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty categories
      const validCategories = formData.categories.filter(c => c.trim().length > 0);
      
      // Create community with basic info
      const community = await communityService.createCommunity(trainer.id, {
        name: formData.name,
        description: formData.description,
        categories: validCategories,
        tags: [],
        isPrivate: formData.isPrivate,
        logoImage: '', // Will be updated after upload
        coverImage: '', // Will be updated after upload
      });
      
      // Update community with extended info (aboutUs field)
      await communityService.updateCommunity(community.id, {
        aboutUs: formData.aboutUs,
      });
      
      // Upload images
      if (logoImage) {
        const logoFile = new File([logoImage], logoImage.name, { type: logoImage.type });
        await communityService.uploadCommunityImage(community.id, 'logo', logoFile);
      }
      
      if (coverImage) {
        const coverFile = new File([coverImage], coverImage.name, { type: coverImage.type });
        await communityService.uploadCommunityImage(community.id, 'cover', coverFile);
      }
      
      // Upload gallery images
      if (galleryImages.length > 0) {
        // Create an array to store the gallery image URLs
        const galleryImageUrls: string[] = [];
        
        // Upload each gallery image
        for (let i = 0; i < galleryImages.length; i++) {
          const galleryFile = new File([galleryImages[i]], galleryImages[i].name, { type: galleryImages[i].type });
          // Use the new gallery image upload method
          const imageUrl = await communityService.uploadGalleryImage(community.id, galleryFile);
          if (imageUrl) {
            galleryImageUrls.push(imageUrl);
          }
        }
        
        // Update community with gallery image references
        await communityService.updateCommunity(community.id, {
          galleryImages: galleryImageUrls
        });
      }
      
      // Create subscription tiers
      for (const tier of subscriptionTiers) {
        await subscriptionService.createTier(community.id, {
          name: tier.name,
          price: parseFloat(tier.price),
          description: tier.description,
          features: tier.features.filter(f => f.trim().length > 0),
          includedInHigherTiers: true
        });
      }
      
      // Redirect to trainer dashboard
      router.push('/community/trainer/dashboard');
    } catch (error) {
      console.error('Error creating community:', error);
      setErrors({
        ...errors,
        submit: 'Failed to create community. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user || !trainer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not a Trainer Yet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to apply to become a trainer before creating a community.
          </p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={() => router.push('/community/trainer/apply')}
          >
            Apply Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Community
            </h1>
            <p className="text-blue-100">
              Set up your fitness community and start growing your audience
            </p>
          </div>
          
          {/* Form */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Community Details */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Community Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Logo Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo Image *
                      </label>
                      <div 
                        className={`w-32 h-32 rounded-xl border-2 ${
                          errors.logoImage 
                            ? 'border-red-300 dark:border-red-700' 
                            : 'border-gray-300 dark:border-gray-600'
                        } flex items-center justify-center overflow-hidden relative cursor-pointer`}
                        onClick={triggerLogoInput}
                      >
                        {logoImagePreview ? (
                          <Image
                            src={logoImagePreview}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <FiUpload className="text-gray-400 text-2xl" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Square image recommended. Max 5MB.
                      </p>
                      {errors.logoImage && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                          {errors.logoImage}
                        </p>
                      )}
                    </div>
                    
                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cover Image *
                      </label>
                      <div 
                        className={`w-full h-32 rounded-xl border-2 ${
                          errors.coverImage 
                            ? 'border-red-300 dark:border-red-700' 
                            : 'border-gray-300 dark:border-gray-600'
                        } flex items-center justify-center overflow-hidden relative cursor-pointer`}
                        onClick={triggerCoverInput}
                      >
                        {coverImagePreview ? (
                          <Image
                            src={coverImagePreview}
                            alt="Cover preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <FiUpload className="text-gray-400 text-2xl" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={coverInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Wide image recommended (1200×400). Max 5MB.
                      </p>
                      {errors.coverImage && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                          {errors.coverImage}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Gallery Images */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gallery Images
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Add up to 10 images to showcase your community
                      </span>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative">
                      {galleryImagePreviews.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {galleryImagePreviews.map((preview, index) => (
                              <div key={index} className="relative rounded-lg overflow-hidden h-32">
                                <Image 
                                  src={preview} 
                                  alt={`Gallery image ${index + 1}`} 
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                                  onClick={() => removeGalleryImage(index)}
                                >
                                  <FiX />
                                </button>
                              </div>
                            ))}
                            
                            {galleryImagePreviews.length < 10 && (
                              <button
                                type="button"
                                onClick={triggerGalleryInput}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 h-32 rounded-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                              >
                                <FiPlus className="text-gray-500 dark:text-gray-400" size={24} />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mx-auto flex flex-col items-center justify-center py-4"
                          onClick={triggerGalleryInput}
                        >
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                            <FiUpload className="text-gray-500 dark:text-gray-400" size={24} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Upload Gallery Images
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            You can upload multiple images at once
                          </span>
                        </button>
                      )}
                      
                      <input
                        type="file"
                        ref={galleryInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                      />
                    </div>
                    
                    {errors.galleryImages && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {errors.galleryImages}
                      </p>
                    )}
                  </div>
                  
                  {/* Name */}
                  <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Community Name *
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
                      placeholder="e.g., Fitness Revolution, Yoga with Sarah"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.description 
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Describe your community, what members can expect, and what makes it unique"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Minimum 50 characters
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length} characters
                      </p>
                    </div>
                    {errors.description && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  
                  {/* About Us */}
                  <div className="mb-6">
                    <label htmlFor="aboutUs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      About Us
                    </label>
                    <textarea
                      id="aboutUs"
                      name="aboutUs"
                      value={formData.aboutUs}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.aboutUs 
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Tell potential members about your community in detail. Share your team's background, values, and what makes your community unique."
                    />
                    {errors.aboutUs && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {errors.aboutUs}
                      </p>
                    )}
                  </div>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Categories *
                      </label>
                      <button
                        type="button"
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                        onClick={addCategory}
                      >
                        + Add Category
                      </button>
                    </div>
                    
                    {formData.categories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => handleCategoryChange(index, e.target.value)}
                          className={`flex-grow px-4 py-3 rounded-lg border ${
                            errors.categories 
                              ? 'border-red-300 dark:border-red-700' 
                              : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="e.g., Strength Training, Yoga, HIIT, Nutrition"
                        />
                        {formData.categories.length > 1 && (
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => removeCategory(index)}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {errors.categories && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {errors.categories}
                      </p>
                    )}
                  </div>
                  
                  {/* Privacy */}
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Make this community private (only visible to members)
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Tiers */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Subscription Tiers
                    </h2>
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                      onClick={addSubscriptionTier}
                    >
                      + Add Tier
                    </button>
                  </div>
                  
                  {errors.tiers && (
                    <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                      {errors.tiers}
                    </p>
                  )}
                  
                  <div className="space-y-6">
                    {subscriptionTiers.map((tier, tierIndex) => (
                      <div 
                        key={tierIndex}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Tier {tierIndex + 1}
                          </h3>
                          {subscriptionTiers.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 dark:text-red-400 text-sm font-medium"
                              onClick={() => removeSubscriptionTier(tierIndex)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Tier Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tier Name
                            </label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => handleTierChange(tierIndex, 'name', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Basic, Premium, Elite"
                            />
                          </div>
                          
                          {/* Tier Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Monthly Price ($)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiDollarSign className="text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={tier.price}
                                onChange={(e) => handleTierChange(tierIndex, 'price', e.target.value)}
                                className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="9.99"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Tier Description */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            value={tier.description}
                            onChange={(e) => handleTierChange(tierIndex, 'description', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief description of this tier"
                          />
                        </div>
                        
                        {/* Tier Features */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Features
                            </label>
                            <button
                              type="button"
                              className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                              onClick={() => addTierFeature(tierIndex)}
                            >
                              + Add Feature
                            </button>
                          </div>
                          
                          {tier.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleTierFeatureChange(tierIndex, featureIndex, e.target.value)}
                                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Access to live sessions, Personal training"
                              />
                              {tier.features.length > 1 && (
                                <button
                                  type="button"
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                  onClick={() => removeTierFeature(tierIndex, featureIndex)}
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div>
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
                    {isSubmitting ? 'Creating Community...' : 'Create Community'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
