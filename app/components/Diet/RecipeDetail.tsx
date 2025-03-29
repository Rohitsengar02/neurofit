'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { FaUser, FaClock, FaUtensils, FaHeart, FaBookmark, FaComment } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';

const DEFAULT_AVATAR = '/images/default-avatar.jpg';
const DEFAULT_RECIPE_IMAGE = '/images/default-recipe.jpg';

interface ExtendedMeal {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  userImage?: string;
  userName?: string;
  type?: 'recipe' | 'diet';
  prepTime?: string;
  servings?: string;
  ingredients?: string[];
  instructions?: string[];
  nutrition?: {
    [key: string]: string | number;
  };
  likes?: number;
  comments?: any[];
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function RecipeDetail({ id }: { id: string }) {
  const [item, setItem] = useState<ExtendedMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Try to fetch from recipes first
        let docRef = doc(db, 'recipes', id);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // If not found in recipes, try diets
          docRef = doc(db, 'diets', id);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem({
            ...data,
            id: docSnap.id,
            imageUrl: data.imageUrl || DEFAULT_RECIPE_IMAGE,
            userImage: data.userImage || DEFAULT_AVATAR
          } as ExtendedMeal);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">Item not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h1>
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <span>{item.prepTime || '30 mins'}</span>
          </div>
          <div className="flex items-center">
            <FaUtensils className="mr-2" />
            <span>{item.servings || '4 servings'}</span>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FaUtensils className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* Author Section */}
      <div className="flex items-center mb-8">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {item.userImage ? (
            <Image
              src={item.userImage}
              alt={item.userName || 'Author'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-900 dark:text-white">{item.userName || 'Anonymous'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
      </div>

      {/* Ingredients */}
      {item.ingredients && item.ingredients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {item.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {item.instructions && item.instructions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
            {item.instructions.map((instruction, index) => (
              <li key={index} className="leading-relaxed">{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Nutrition Info */}
      {item.nutrition && Object.keys(item.nutrition).length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nutrition Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(item.nutrition).map(([key, value]) => (
              <div key={key} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex space-x-4">
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
          <FaHeart className="text-red-500" />
          <span>{item.likes || 0} Likes</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
          <FaBookmark className="text-blue-500" />
          <span>Save</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
          <FaComment className="text-green-500" />
          <span>{item.comments?.length || 0} Comments</span>
        </button>
      </div>
    </div>
  );
}
