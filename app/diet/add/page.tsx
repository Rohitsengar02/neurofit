'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaLeaf, FaArrowLeft, FaImage, FaClock, FaUsers, FaBolt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { addMeal, MealData } from '../../services/dietService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { generateNutritionFacts, analyzeDietPlan, type NutritionInfo } from '../../services/nutritionService';
import { generateRecipe, generateDietPlan } from '../../services/geminiService';
import { toast } from 'react-hot-toast';

const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
};

const searchImages = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};

type MealType = 'recipe' | 'diet' | null;
type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealOption {
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlanSection {
  options: MealOption[];
}

interface MealPlan {
  breakfast: MealPlanSection;
  lunch: MealPlanSection;
  dinner: MealPlanSection;
  snacks: MealPlanSection;
}

interface FormData {
  name: string;
  description: string;
  image: File | null;
  imagePreview: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  restrictions: string[];
  nutrition: NutritionInfo;
  mealTime: MealTime;
  goals: string[];
  mealPlan: MealPlan;
}

const defaultNutrition: NutritionInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0
};

const defaultMealPlan: MealPlan = {
  breakfast: { options: [] },
  lunch: { options: [] },
  dinner: { options: [] },
  snacks: { options: [] }
};

interface GeneratedMealOption {
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface GeneratedMealPlan {
  breakfast?: {
    options: GeneratedMealOption[];
  };
  lunch?: {
    options: GeneratedMealOption[];
  };
  dinner?: {
    options: GeneratedMealOption[];
  };
  snacks?: {
    options: GeneratedMealOption[];
  };
}

interface GeneratedDietPlan {
  name: string;
  description: string;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  restrictions?: string[];
  goals?: string[];
  mealPlan: GeneratedMealPlan;
}

export default function AddMealPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<MealType>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualNutrition, setIsManualNutrition] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    image: null,
    imagePreview: '',
    servings: 1,
    ingredients: [''],
    instructions: [''],
    duration: '',
    difficulty: 'easy',
    cuisine: '',
    restrictions: [''],
    nutrition: { ...defaultNutrition },
    mealTime: 'breakfast',
    goals: [''],
    mealPlan: { ...defaultMealPlan }
  });

  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleArrayInput = (
    field: 'ingredients' | 'instructions' | 'goals' | 'restrictions',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'ingredients' | 'instructions' | 'goals' | 'restrictions') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (
    field: 'ingredients' | 'instructions' | 'goals' | 'restrictions',
    index: number
  ) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  useEffect(() => {
    if (selectedType === 'recipe' && formData.ingredients.length > 0 && formData.ingredients[0]) {
      analyzeNutrition();
    }
  }, [formData.ingredients]);

  const analyzeNutrition = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeDietPlan([{
        type: formData.mealTime,
        name: formData.name,
        ingredients: formData.ingredients.filter(i => i),
        servings: formData.servings
      }]);

      if (result.success && result.data) {
        setNutritionInfo(result.data.nutritionBreakdown);
      } else {
        alert(result.error || 'Failed to analyze nutrition');
      }
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      alert('Failed to analyze nutrition. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMealPlanChange = (
    type: keyof MealPlan,
    index: number,
    value: string
  ) => {
    const newMealPlan = { ...formData.mealPlan };
    newMealPlan[type].options[index].name = value;
    setFormData({ ...formData, mealPlan: newMealPlan });
  };

  const addMealToType = (type: keyof MealPlan) => {
    const newMealPlan = { ...formData.mealPlan };
    newMealPlan[type].options.push({
      name: '',
      description: '',
      ingredients: [],
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0
      }
    });
    setFormData({ ...formData, mealPlan: newMealPlan });
  };

  const removeMealFromType = (type: keyof MealPlan, index: number) => {
    const newMealPlan = { ...formData.mealPlan };
    newMealPlan[type].options = newMealPlan[type].options.filter((_, i) => i !== index);
    setFormData({ ...formData, mealPlan: newMealPlan });
  };

  const handleGenerateNutrition = async () => {
    if (selectedType === 'recipe') {
      setIsGenerating(true);
      try {
        const result = await generateNutritionFacts({
          name: formData.name,
          ingredients: formData.ingredients.filter(i => i),
          servings: formData.servings,
          instructions: formData.instructions.filter(i => i)
        });

        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            nutrition: { ...defaultNutrition, ...result.data }
          }));
          
          // Generate image from the recipe using the imagePrompt
          if (result.data.imagePrompt) {
            setIsGeneratingImage(true);
            toast.loading('Generating recipe image...', { id: 'generating-image' });
            
            try {
              const imageUrl = await generateImageFromPrompt(result.data.imagePrompt);
              if (imageUrl) {
                // Convert the URL to a file object for the form
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'recipe-image.jpg', { type: 'image/jpeg' });
                
                setFormData(prev => ({
                  ...prev,
                  image: file,
                  imagePreview: imageUrl
                }));
                
                toast.success('Recipe image generated!', { id: 'generating-image' });
              } else {
                toast.error('Could not generate recipe image', { id: 'generating-image' });
              }
            } catch (imageError) {
              console.error('Error generating image:', imageError);
              toast.error('Failed to generate recipe image', { id: 'generating-image' });
            } finally {
              setIsGeneratingImage(false);
            }
          }
        } else {
          toast.error(result.error || 'Failed to generate nutrition facts');
        }
      } catch (error) {
        console.error('Error generating nutrition facts:', error);
        toast.error('Failed to generate nutrition facts. Please try again or enter manually.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleNutritionChange = (field: keyof NutritionInfo, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: numValue
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!user) {
      toast.error('Please sign in to add a meal');
      return;
    }

    if (!selectedType) {
      toast.error('Please select a type (Recipe or Diet Plan)');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a name for your meal');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description for your meal');
      return;
    }

    if (selectedType === 'recipe' && formData.ingredients.filter(i => i.trim()).length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      // Upload image to Cloudinary if provided
      let imageUrl = '';
      if (formData.image) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', formData.image);
          imageFormData.append('upload_preset', 'neurofit');
          imageFormData.append('cloud_name', 'dubhzug5i');

          const response = await fetch(`https://api.cloudinary.com/v1_1/dubhzug5i/image/upload`, {
            method: 'POST',
            body: imageFormData
          });

          const data = await response.json();
          if (data.secure_url) {
            imageUrl = data.secure_url;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Continuing without image...');
        }
      }

      // Prepare base meal data
      const baseMealData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        userId: user.uid,
        userName: `users/${user.uid}/displayName`,
        userImage: `users/${user.uid}/photoURL`,
        type: selectedType,
        nutrition: (() => {
          // Create a copy of nutrition data without any extra fields
          // that aren't part of the NutritionInfo type
          const nutritionData = { ...formData.nutrition };
          
          // Remove imagePrompt if it exists (using type assertion since TypeScript doesn't know about it)
          if ('imagePrompt' in nutritionData) {
            delete (nutritionData as any).imagePrompt;
          }
          
          return nutritionData || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cholesterol: 0
          };
        })(),
        duration: formData.duration || '',
        goals: formData.goals.filter(g => g.trim()),
        restrictions: formData.restrictions.filter(r => r.trim()),
        mealTime: formData.mealTime
      };

      // Add type-specific data
      const mealData: MealData = selectedType === 'recipe' 
        ? {
            ...baseMealData,
            prepTime: formData.duration || '',
            servings: formData.servings.toString(),
            ingredients: formData.ingredients.filter(i => i.trim()),
            instructions: formData.instructions.filter(i => i.trim()),
            totalCalories: formData.nutrition.calories,
            mealPlan: null // Use null instead of undefined for Firestore
          }
        : {
            ...baseMealData,
            prepTime: '',
            servings: '',
            ingredients: [],
            instructions: [],
            totalCalories: Object.values(formData.mealPlan).reduce(
              (sum: number, section: MealPlanSection) => 
                sum + section.options.reduce((mealSum: number, opt: MealOption) => mealSum + opt.calories, 0), 
              0
            ),
            mealPlan: {
              breakfast: {
                meals: formData.mealPlan.breakfast.options.map(opt => opt.name),
                calories: formData.mealPlan.breakfast.options.reduce((sum: number, opt: MealOption) => sum + opt.calories, 0)
              },
              lunch: {
                meals: formData.mealPlan.lunch.options.map(opt => opt.name),
                calories: formData.mealPlan.lunch.options.reduce((sum: number, opt: MealOption) => sum + opt.calories, 0)
              },
              dinner: {
                meals: formData.mealPlan.dinner.options.map(opt => opt.name),
                calories: formData.mealPlan.dinner.options.reduce((sum: number, opt: MealOption) => sum + opt.calories, 0)
              },
              snacks: {
                meals: formData.mealPlan.snacks.options.map(opt => opt.name),
                calories: formData.mealPlan.snacks.options.reduce((sum: number, opt: MealOption) => sum + opt.calories, 0)
              }
            }
          };

      // Clean up any undefined values before saving
      const cleanMealData = Object.fromEntries(
        Object.entries(mealData).filter(([_, value]) => value !== undefined)
      ) as MealData;

      // Save to Firebase
      try {
        console.log('Saving meal data:', { selectedType, cleanMealData }); // Debug log
        const mealId = await addMeal(selectedType, cleanMealData);
        console.log('Meal saved with ID:', mealId); // Debug log
        toast.success('Meal saved successfully!');
        router.push('/diet/my-meals');
      } catch (error) {
        console.error('Error saving to Firebase:', error);
        toast.error('Failed to save meal. Please try again.');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      if (selectedType === 'recipe') {
        const result = await generateRecipe(prompt);
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            ...result.data
          }));
          handleGenerateNutrition();
        } else {
          alert(result.error || 'Failed to generate recipe');
        }
      } else if (selectedType === 'diet') {
        const result = await generateDietPlan(prompt);
        if (result.success && result.data) {
          const data = result.data;
          
          // Generate image from the diet plan using the imagePrompt
          if (data.imagePrompt) {
            setIsGeneratingImage(true);
            toast.loading('Generating diet plan image...', { id: 'generating-image' });
            
            try {
              const imageUrl = await generateImageFromPrompt(data.imagePrompt);
              if (imageUrl) {
                // Convert the URL to a file object for the form
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'diet-plan-image.jpg', { type: 'image/jpeg' });
                
                // Update form data with the image and other diet plan data
                setFormData(prev => ({
                  ...prev,
                  name: data.name,
                  description: data.description,
                  image: file,
                  imagePreview: imageUrl,
                  duration: data.duration || '',
                  difficulty: data.difficulty || 'medium',
                  restrictions: data.restrictions || [],
                  goals: data.goals || [],
                  mealPlan: {
                    breakfast: {
                      options: (data.mealPlan?.breakfast?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    lunch: {
                      options: (data.mealPlan?.lunch?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    dinner: {
                      options: (data.mealPlan?.dinner?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    snacks: {
                      options: (data.mealPlan?.snacks?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    }
                  }
                }));
                
                toast.success('Diet plan image generated!', { id: 'generating-image' });
              } else {
                toast.error('Could not generate diet plan image', { id: 'generating-image' });
                
                // Still update the form data even if image generation fails
                setFormData(prev => ({
                  ...prev,
                  name: data.name,
                  description: data.description,
                  duration: data.duration || '',
                  difficulty: data.difficulty || 'medium',
                  restrictions: data.restrictions || [],
                  goals: data.goals || [],
                  mealPlan: {
                    breakfast: {
                      options: (data.mealPlan?.breakfast?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    lunch: {
                      options: (data.mealPlan?.lunch?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    dinner: {
                      options: (data.mealPlan?.dinner?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    },
                    snacks: {
                      options: (data.mealPlan?.snacks?.options || []).map(meal => ({
                        name: (meal as any).name || '',
                        description: (meal as any).description || '',
                        ingredients: (meal as any).ingredients || [],
                        calories: (meal as any).calories || 0,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                      }))
                    }
                  }
                }));
              }
            } catch (imageError) {
              console.error('Error generating image:', imageError);
              toast.error('Failed to generate diet plan image', { id: 'generating-image' });
              
              // Still update the form data even if image generation fails
              setFormData(prev => ({
                ...prev,
                name: data.name,
                description: data.description,
                duration: data.duration || '',
                difficulty: data.difficulty || 'medium',
                restrictions: data.restrictions || [],
                goals: data.goals || [],
                mealPlan: {
                  breakfast: {
                    options: (data.mealPlan?.breakfast?.options || []).map(meal => ({
                      name: (meal as any).name || '',
                      description: (meal as any).description || '',
                      ingredients: (meal as any).ingredients || [],
                      calories: (meal as any).calories || 0,
                      macros: { protein: 0, carbs: 0, fat: 0 }
                    }))
                  },
                  lunch: {
                    options: (data.mealPlan?.lunch?.options || []).map(meal => ({
                      name: (meal as any).name || '',
                      description: (meal as any).description || '',
                      ingredients: (meal as any).ingredients || [],
                      calories: (meal as any).calories || 0,
                      macros: { protein: 0, carbs: 0, fat: 0 }
                    }))
                  },
                  dinner: {
                    options: (data.mealPlan?.dinner?.options || []).map(meal => ({
                      name: (meal as any).name || '',
                      description: (meal as any).description || '',
                      ingredients: (meal as any).ingredients || [],
                      calories: (meal as any).calories || 0,
                      macros: { protein: 0, carbs: 0, fat: 0 }
                    }))
                  },
                  snacks: {
                    options: (data.mealPlan?.snacks?.options || []).map(meal => ({
                      name: (meal as any).name || '',
                      description: (meal as any).description || '',
                      ingredients: (meal as any).ingredients || [],
                      calories: (meal as any).calories || 0,
                      macros: { protein: 0, carbs: 0, fat: 0 }
                    }))
                  }
                }
              }));
            } finally {
              setIsGeneratingImage(false);
            }
          } else {
            // No image prompt available, just update the form data
            setFormData(prev => ({
              ...prev,
              name: data.name,
              description: data.description,
              duration: data.duration || '',
              difficulty: data.difficulty || 'medium',
              restrictions: data.restrictions || [],
              goals: data.goals || [],
              mealPlan: {
                breakfast: {
                  options: (data.mealPlan?.breakfast?.options || []).map(meal => ({
                    name: (meal as any).name || '',
                    description: (meal as any).description || '',
                    ingredients: (meal as any).ingredients || [],
                    calories: (meal as any).calories || 0,
                    macros: { protein: 0, carbs: 0, fat: 0 }
                  }))
                },
                lunch: {
                  options: (data.mealPlan?.lunch?.options || []).map(meal => ({
                    name: (meal as any).name || '',
                    description: (meal as any).description || '',
                    ingredients: (meal as any).ingredients || [],
                    calories: (meal as any).calories || 0,
                    macros: { protein: 0, carbs: 0, fat: 0 }
                  }))
                },
                dinner: {
                  options: (data.mealPlan?.dinner?.options || []).map(meal => ({
                    name: (meal as any).name || '',
                    description: (meal as any).description || '',
                    ingredients: (meal as any).ingredients || [],
                    calories: (meal as any).calories || 0,
                    macros: { protein: 0, carbs: 0, fat: 0 }
                  }))
                },
                snacks: {
                  options: (data.mealPlan?.snacks?.options || []).map(meal => ({
                    name: (meal as any).name || '',
                    description: (meal as any).description || '',
                    ingredients: (meal as any).ingredients || [],
                    calories: (meal as any).calories || 0,
                    macros: { protein: 0, carbs: 0, fat: 0 }
                  }))
                }
              }
            }));
          }
        } else {
          toast.error(result.error || 'Failed to generate diet plan');
        }
      }

      // Always close the prompt modal and reset prompt regardless of success/failure
      setShowPromptModal(false);
      setPrompt('');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
      
      // Also close the prompt modal on error
      setShowPromptModal(false);
      setPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Meal
            </h1>
          </div>

          {/* Type Selection */}
          {!selectedType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType('recipe')}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 
                         border-transparent hover:border-blue-500 transition-all"
              >
                <FaUtensils className="w-12 h-12 text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Add Recipe
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your favorite recipes with detailed instructions and ingredients
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType('diet')}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 
                         border-transparent hover:border-green-500 transition-all"
              >
                <FaLeaf className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Add Diet Plan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Create a structured diet plan with goals and meal schedules
                </p>
              </motion.button>
            </div>
          )}

          {/* Form */}
          {selectedType && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPromptModal(true)}
                className="w-full mb-8 p-4 rounded-xl bg-purple-500 text-white 
                       hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaBolt className="h-6 w-6" />
                Generate with AI
              </motion.button>

              {/* Image Upload */}
              <div className="mb-8">
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                  {formData.imagePreview ? (
                    <Image
                      src={formData.imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaImage className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Generating image...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white 
                             rounded-lg hover:bg-blue-600 cursor-pointer"
                  >
                    <FaImage className="w-5 h-5 mr-2" />
                    Upload Image
                  </label>
                  
                  {selectedType === 'recipe' && formData.name && formData.ingredients.some(i => i) && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prompt = `Appetizing photo of ${formData.name} dish with ${formData.ingredients.filter(i => i).slice(0, 3).join(', ')}`;
                          setIsGeneratingImage(true);
                          toast.loading('Generating recipe image...', { id: 'generating-image' });
                          generateImageFromPrompt(prompt)
                            .then(imageUrl => {
                              if (imageUrl) {
                                fetch(imageUrl)
                                  .then(response => response.blob())
                                  .then(blob => {
                                    const file = new File([blob], 'recipe-image.jpg', { type: 'image/jpeg' });
                                    setFormData(prev => ({ ...prev, image: file, imagePreview: imageUrl }));
                                    toast.success('Recipe image generated!', { id: 'generating-image' });
                                  });
                              } else {
                                toast.error('Could not generate recipe image', { id: 'generating-image' });
                              }
                            })
                            .catch(error => {
                              console.error('Error generating image:', error);
                              toast.error('Failed to generate recipe image', { id: 'generating-image' });
                            })
                            .finally(() => setIsGeneratingImage(false));
                        }}
                        className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer mr-2"
                        disabled={isGeneratingImage}
                      >
                        <FaBolt className="w-5 h-5 mr-2" />
                        Generate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const query = formData.name || 'healthy food';
                          setSearchQuery(query);
                          setShowSearchModal(true);
                          setIsSearching(true);
                          searchImages(query).then(results => {
                            setSearchResults(results);
                            setIsSearching(false);
                          });
                        }}
                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                      >
                        <FaImage className="w-5 h-5 mr-2" />
                        Search Image
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selectedType === 'recipe' ? 'Prep Time (minutes)' : 'Duration (days)'}
                    </label>
                    <input
                      type="number"
                      value={selectedType === 'recipe' ? formData.duration : formData.duration}
                      onChange={(e) => setFormData({
                        ...formData,
                        duration: e.target.value
                      })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Servings
                    </label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({
                        ...formData,
                        servings: parseInt(e.target.value)
                      })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Recipe-specific fields */}
                {selectedType === 'recipe' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ingredients
                      </label>
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => handleArrayInput('ingredients', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 
                                     dark:border-gray-600 bg-white dark:bg-gray-800 
                                     text-gray-900 dark:text-white mr-2"
                            placeholder={`Ingredient ${index + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('ingredients', index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('ingredients')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        + Add Ingredient
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instructions
                      </label>
                      {formData.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={instruction}
                            onChange={(e) => handleArrayInput('instructions', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 
                                     dark:border-gray-600 bg-white dark:bg-gray-800 
                                     text-gray-900 dark:text-white mr-2"
                            placeholder={`Step ${index + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('instructions', index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('instructions')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        + Add Step
                      </button>
                    </div>

                    {/* Nutrition Information */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Nutrition Information
                      </h3>
                      
                      {!isManualNutrition && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerateNutrition}
                          disabled={isGenerating || !formData.ingredients[0]}
                          className={`w-full mb-4 p-4 rounded-xl bg-blue-500 text-white 
                                   hover:bg-blue-600 transition-colors ${
                                     (isGenerating || !formData.ingredients[0]) ? 'opacity-50 cursor-not-allowed' : ''
                                   }`}
                        >
                          {isGenerating ? 'Generating...' : 'Generate Nutrition Facts with AI'}
                        </motion.button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsManualNutrition(!isManualNutrition)}
                        className="mb-4 text-blue-500 hover:text-blue-600"
                      >
                        {isManualNutrition ? 'Use AI Generation' : 'Enter Manually'}
                      </button>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(Object.entries(formData.nutrition) as [string, number][]).
                          // Filter out the imagePrompt field from the nutrition display
                          filter(([key]) => key !== 'imagePrompt' && 
                                 ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'cholesterol'].includes(key)).
                          map(([key, value]) => (
                          <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <label className="text-sm text-gray-500 dark:text-gray-400 capitalize block mb-1">
                              {key}
                            </label>
                            {isManualNutrition ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => handleNutritionChange(key as keyof NutritionInfo, e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 
                                         dark:border-gray-600 bg-white dark:bg-gray-800 
                                         text-gray-900 dark:text-white"
                                min="0"
                                step="0.1"
                              />
                            ) : (
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {Math.round(value * 10) / 10}
                                {key === 'calories' ? '' : key === 'sodium' || key === 'cholesterol' ? 'mg' : 'g'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Diet-specific fields */}
                {selectedType === 'diet' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Goals
                      </label>
                      {formData.goals.map((goal, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={goal}
                            onChange={(e) => handleArrayInput('goals', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 
                                     dark:border-gray-600 bg-white dark:bg-gray-800 
                                     text-gray-900 dark:text-white mr-2"
                            placeholder={`Goal ${index + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('goals', index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('goals')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        + Add Goal
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Restrictions
                      </label>
                      {formData.restrictions.map((restriction, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={restriction}
                            onChange={(e) => handleArrayInput('restrictions', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 
                                     dark:border-gray-600 bg-white dark:bg-gray-800 
                                     text-gray-900 dark:text-white mr-2"
                            placeholder={`Restriction ${index + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('restrictions', index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('restrictions')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        + Add Restriction
                      </button>
                    </div>

                    {/* Meal Plan */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Meal Plan
                      </h3>

                      {Object.keys(formData.mealPlan).map((type) => (
                        <div key={type} className="mb-6">
                          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 capitalize mb-2">
                            {type}
                          </h4>
                          {formData.mealPlan[type as keyof MealPlan].options.map((meal, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => handleMealPlanChange(type as keyof MealPlan, index, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 
                                         dark:border-gray-600 bg-white dark:bg-gray-800 
                                         text-gray-900 dark:text-white mr-2"
                                placeholder={`Add ${type} meal`}
                              />
                              <button
                                type="button"
                                onClick={() => removeMealFromType(type as keyof MealPlan, index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addMealToType(type as keyof MealPlan)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            + Add {type} meal
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setSelectedType(null)}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedType}
                    className={`px-6 py-2 rounded-lg ${
                      loading || !selectedType
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Prompt Modal */}
          {showPromptModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Generate {selectedType === 'recipe' ? 'Recipe' : 'Diet Plan'} with AI
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Describe what you want to generate and Gemini AI will create it for you.
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={selectedType === 'recipe' 
                    ? "E.g., A healthy vegetarian pasta recipe with spinach and mushrooms..."
                    : "E.g., A high-protein breakfast plan for muscle gain..."}
                  className="w-full h-32 px-4 py-2 rounded-lg border border-gray-300 
                           dark:border-gray-600 bg-white dark:bg-gray-800 
                           text-gray-900 dark:text-white resize-none mb-4"
                />
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowPromptModal(false);
                      setPrompt('');
                    }}
                    className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !prompt}
                    className={`px-4 py-2 rounded-lg bg-purple-500 text-white 
                             hover:bg-purple-600 transition-colors flex items-center gap-2
                             ${(isGenerating || !prompt) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Image Search Modal */}
          {showSearchModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Search Food Images
                  </h3>
                  <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaArrowLeft className="w-5 h-5 mr-1" />
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (setIsSearching(true), searchImages(searchQuery).then(res => { setSearchResults(res); setIsSearching(false); }))}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Search for images..."
                  />
                  <button
                    onClick={() => {
                      setIsSearching(true);
                      searchImages(searchQuery).then(results => {
                        setSearchResults(results);
                        setIsSearching(false);
                      });
                    }}
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Search
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {isSearching ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.map((img: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            fetch(img.url)
                              .then(res => res.blob())
                              .then(blob => {
                                const file = new File([blob], 'food-image.jpg', { type: 'image/jpeg' });
                                setFormData(prev => ({
                                  ...prev,
                                  image: file,
                                  imagePreview: img.url
                                }));
                                setShowSearchModal(false);
                                toast.success('Image selected!');
                              })
                              .catch(err => {
                                console.error('Error selecting image:', err);
                                toast.error('Failed to load selected image');
                              });
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 ring-blue-500 transition-all"
                        >
                          <img src={img.thumbnail || img.url} alt={img.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-1 text-[10px] text-white truncate">
                            {img.title}
                          </div>
                        </div>
                      ))}
                      {searchResults.length === 0 && !isSearching && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                          No images found. Try a different search term.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
