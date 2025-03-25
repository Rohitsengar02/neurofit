'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaBolt, FaWeight, FaApple, FaFire, FaInfoCircle } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import gsap from 'gsap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FoodItem {
  name: string;
  description: string;
}

interface NutritionInfo {
  calories: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  fiber_g: number;
  sugar_g: number;
  vitamins: { name: string; amount: string }[];
  minerals: { name: string; amount: string }[];
  description: string;
  health_benefits: string[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
const UNITS = [
  { value: 'g', label: 'Grams', conversion: 1 },
  { value: 'oz', label: 'Ounces', conversion: 28.35 },
  { value: 'cup', label: 'Cups', conversion: 128 },
  { value: 'tbsp', label: 'Tablespoons', conversion: 15 },
  { value: 'tsp', label: 'Teaspoons', conversion: 5 },
  { value: 'serving', label: 'Serving', conversion: 100 }
];

const FoodInfoPage = () => {
  const router = useRouter();
  const [foodData, setFoodData] = useState<FoodItem | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [selectedMeal, setSelectedMeal] = useState<string>('breakfast');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Refs for GSAP animations
  const pageRef = useRef(null);
  const nutritionCardRef = useRef(null);
  const headerRef = useRef(null);
  const chartRef = useRef(null);

  const generateNutritionInfo = async (foodName: string) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Generate detailed nutrition information for ${foodName} per 100g serving.
      Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
      {
        "calories": number,
        "protein_g": number,
        "carbohydrates_total_g": number,
        "fat_total_g": number,
        "fiber_g": number,
        "sugar_g": number,
        "vitamins": [{"name": string, "amount": string}],
        "minerals": [{"name": string, "amount": string}],
        "description": string (2-3 sentences about the food),
        "health_benefits": [string] (3-4 key health benefits)
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text to remove any markdown formatting
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const nutritionData = JSON.parse(cleanJson);
        setNutritionInfo(nutritionData);
      } catch (parseError) {
        console.error('Error parsing nutrition data:', cleanJson);
        throw new Error('Failed to parse nutrition information');
      }
    } catch (error) {
      console.error('Error generating nutrition info:', error);
      setError('Failed to generate nutrition information. Please try again.');
    }
  };

  useEffect(() => {
    const loadFoodData = async () => {
      try {
        const storedFood = localStorage.getItem('selectedFood');
        if (!storedFood) {
          router.push('/nutrition');
          return;
        }
        const parsedFood = JSON.parse(storedFood);
        setFoodData(parsedFood);
        await generateNutritionInfo(parsedFood.name);
      } catch (error) {
        console.error('Error loading food data:', error);
        setError('Error loading food information');
      } finally {
        setIsLoading(false);
      }
    };

    loadFoodData();
  }, [router]);

  // GSAP Animations
  useEffect(() => {
    if (!isLoading && foodData && nutritionInfo) {
      // Header animation
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      // Nutrition card animation
      gsap.from(nutritionCardRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });

      // Chart animation
      gsap.from(chartRef.current, {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "elastic.out(1, 0.5)"
      });

      // Stagger animation for nutrition values
      gsap.from(".nutrition-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.5,
        ease: "power2.out"
      });
    }
  }, [isLoading, foodData, nutritionInfo]);

  const getConversionFactor = (selectedUnit: string) => {
    const unitInfo = UNITS.find(u => u.value === selectedUnit);
    return unitInfo ? unitInfo.conversion : 1;
  };

  const calculateNutrition = (value: number) => {
    const conversionFactor = getConversionFactor(unit);
    return (value * amount * conversionFactor) / 100;
  };

  const getPieChartData = () => {
    if (!nutritionInfo) return [];

    const total = nutritionInfo.protein_g + nutritionInfo.carbohydrates_total_g + nutritionInfo.fat_total_g;
    return [
      { name: 'Fat', value: (nutritionInfo.fat_total_g / total) * 100 },
      { name: 'Protein', value: (nutritionInfo.protein_g / total) * 100 },
      { name: 'Carbs', value: (nutritionInfo.carbohydrates_total_g / total) * 100 }
    ];
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!foodData || !nutritionInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="text-gray-600 mt-2">{error || 'Failed to load food information'}</p>
          <button
            onClick={() => router.push('/nutrition')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div ref={headerRef} className="mb-8">
          <button
            onClick={() => router.push('/nutrition')}
            className="flex items-center text-gray-600 hover:text-blue-500 transition-colors mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Search
          </button>

          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            {foodData.name}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaWeight className="mr-2 text-blue-500" />
                Serving Size
              </h2>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) setAmount(value);
                    }}
                    className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div ref={chartRef} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Macronutrient Distribution</h2>
              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getPieChartData()}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index]}
                          stroke={COLORS[index]}
                          strokeWidth={activeIndex === index ? 2 : 0}
                          className="transition-all duration-300"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaApple className="mr-2 text-green-500" />
                Add to Meal
              </h2>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
                Add to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
              </button>
              <button 
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 flex items-center justify-center"
                onClick={() => {
                  // Save functionality will be added later
                  alert('Food saved to favorites!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Save Food
              </button>
            </div>
          </div>

          <div ref={nutritionCardRef} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FaBolt className="mr-2 text-yellow-500" />
                Nutrition Facts
              </h2>

              <div className="space-y-4">
                <div className="nutrition-item flex justify-between items-center p-3 bg-orange-100 rounded-lg shadow-sm">
                  <span className="font-medium flex items-center">
                    <FaFire className="mr-2 text-orange-500" />
                    Calories
                  </span>
                  <span className="text-lg font-semibold">{calculateNutrition(nutritionInfo.calories).toFixed(1)} kcal</span>
                </div>

                {[
                  { label: 'Protein', value: nutritionInfo.protein_g, unit: 'g', color: 'bg-blue-100' },
                  { label: 'Carbs', value: nutritionInfo.carbohydrates_total_g, unit: 'g', color: 'bg-green-100' },
                  { label: 'Fat', value: nutritionInfo.fat_total_g, unit: 'g', color: 'bg-yellow-100' },
                  { label: 'Fiber', value: nutritionInfo.fiber_g, unit: 'g', color: 'bg-purple-100' },
                  { label: 'Sugar', value: nutritionInfo.sugar_g, unit: 'g', color: 'bg-pink-100' }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className={`nutrition-item flex justify-between items-center p-3 ${item.color} rounded-lg shadow-sm`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span>{calculateNutrition(item.value).toFixed(1)}{item.unit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Vitamins & Minerals
              </h3>

              <div className="space-y-6">
                {/* Vitamins Section */}
                <div>
                  <h4 className="text-lg font-medium mb-3 text-purple-600">Vitamins</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nutritionInfo.vitamins.map((vitamin, index) => (
                      <motion.div
                        key={index}
                        className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 bg-purple-100 rounded-full opacity-20"></div>
                        <div className="relative z-10">
                          <span className="font-semibold text-purple-800">{vitamin.name}</span>
                          <div className="mt-1 text-sm">
                            <span className="font-medium text-purple-600">{vitamin.amount}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Minerals Section */}
                <div>
                  <h4 className="text-lg font-medium mb-3 text-blue-600">Minerals</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nutritionInfo.minerals.map((mineral, index) => (
                      <motion.div
                        key={index}
                        className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 bg-blue-100 rounded-full opacity-20"></div>
                        <div className="relative z-10">
                          <span className="font-semibold text-blue-800">{mineral.name}</span>
                          <div className="mt-1 text-sm">
                            <span className="font-medium text-blue-600">{mineral.amount}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Daily Value Note */}
                <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">Note:</span> Daily values are based on a 2,000 calorie diet. Individual needs may vary.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-4">About {foodData.name}</h2>
              <p className="text-gray-700 mb-4">{nutritionInfo.description}</p>
              <h3 className="font-semibold text-gray-800 mb-2">Health Benefits:</h3>
              <ul className="list-disc list-inside space-y-1">
                {nutritionInfo.health_benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-600">{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodInfoPage;
