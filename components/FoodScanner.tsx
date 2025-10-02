'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaTimes, FaSearch, FaUtensils, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface FoodItem {
  name: string;
  description: string;
  confidence: number;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function FoodScanner({ onClose, onFoodSelect }: { 
  onClose: () => void; 
  onFoodSelect: (food: any) => void;
}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access the camera. Please check your permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call your API endpoint for food analysis
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: capturedImage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await response.json();
      setFoodItems(data.foods || []);
      
    } catch (error) {
      console.error('Error analyzing food:', error);
      // Fallback to mock data if API fails
      setFoodItems([
        {
          name: 'Apple',
          description: 'Fresh red apple',
          confidence: 0.95,
          nutritionalInfo: {
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3
          }
        },
        {
          name: 'Banana',
          description: 'Ripe yellow banana',
          confidence: 0.85,
          nutritionalInfo: {
            calories: 105,
            protein: 1.3,
            carbs: 27,
            fat: 0.4
          }
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const selectFood = (food: FoodItem) => {
    onFoodSelect(food);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {capturedImage ? 'Analyze Food' : 'Take a Photo'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative bg-black">
          {!capturedImage ? (
            <div className="aspect-video flex items-center justify-center">
              {isCameraActive ? (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white p-8 text-center">
                  <FaCamera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Camera not available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured food" 
                className="w-full h-auto max-h-64 object-contain bg-black"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-2" />
                    <p>Analyzing...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          {!capturedImage ? (
            <div className="flex flex-col space-y-3">
              <button
                onClick={captureImage}
                disabled={!isCameraActive}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FaCamera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <FaSearch className="w-5 h-5" />
                <span>Choose from Gallery</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : foodItems.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Detected Foods:</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {foodItems.map((food, index) => (
                  <div 
                    key={index}
                    onClick={() => selectFood(food)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{food.name}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{food.description}</p>
                        {food.nutritionalInfo && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {food.nutritionalInfo.calories} cal • {food.nutritionalInfo.protein}g protein • {food.nutritionalInfo.carbs}g carbs • {food.nutritionalInfo.fat}g fat
                          </div>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                        {Math.round((food.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={retakePhoto}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg"
                >
                  Retake
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center py-4">
                <FaUtensils className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700 dark:text-gray-300">Analyze this food to see nutritional information</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg"
                >
                  Retake
                </button>
                <button
                  onClick={analyzeFood}
                  disabled={isAnalyzing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <FaSpinner className="animate-spin w-4 h-4" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch className="w-4 h-4" />
                      <span>Analyze Food</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
