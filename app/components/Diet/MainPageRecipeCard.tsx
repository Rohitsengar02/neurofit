import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaUtensils, FaFire, FaComment, FaShare, FaBookmark, FaRegBookmark, FaUser, FaClipboardList } from 'react-icons/fa';
import { Meal } from '@/app/services/dietService';
import { toggleLikeMeal, toggleSaveMeal, recordShare, getUserStats } from '@/app/services/userStatsService';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MainPageRecipeCardProps {
  recipe: Meal;
  onComment: (recipe: Meal) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

const MainPageRecipeCard: React.FC<MainPageRecipeCardProps> = ({ recipe, onComment, isLiked: initialIsLiked = false, isSaved: initialIsSaved = false }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(recipe.likes || 0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserInteractions = async () => {
      if (!user) return;
      
      try {
        const stats = await getUserStats(user.uid);
        if (stats) {
          setIsSaved(stats.savedMeals.includes(recipe.id));
        }
      } catch (error) {
        console.error('Error loading user interactions:', error);
      }
    };

    loadUserInteractions();
  }, [user, recipe.id]);

  useEffect(() => {
    if (user && recipe.likes && Array.isArray(recipe.likes)) {
      setIsLiked(recipe.likes.includes(user.uid));
    }
  }, [user, recipe.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const newLikedState = await toggleLikeMeal(user.uid, recipe.id);
      setIsLiked(newLikedState);
      // Update the local like count immediately
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const newSavedState = await toggleSaveMeal(user.uid, recipe.id);
      setIsSaved(newSavedState);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: recipe.name,
          text: recipe.description,
          url: window.location.href
        });
        await recordShare(user.uid, recipe.id, 'web');
      } else {
        // Try clipboard API with fallback
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
          }
          await recordShare(user.uid, recipe.id, 'copy');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          // Final fallback - show the URL to the user
          alert(`Please copy this URL manually: ${window.location.href}`);
          await recordShare(user.uid, recipe.id, 'manual');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    onComment(recipe);
  };

  const handleClick = () => {
    router.push(`/diet/${recipe.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
    >
      {/* Save Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSave();
        }}
        disabled={!user || isLoading}
        className={`absolute top-4 right-4 p-2 rounded-full z-10 ${
          user ? 'bg-white/90 hover:bg-white shadow-md' : 'bg-gray-500/50 cursor-not-allowed'
        } transition-all duration-200`}
      >
        {isSaved ? (
          <FaBookmark className="w-5 h-5 text-blue-500" />
        ) : (
          <FaRegBookmark className="w-5 h-5 text-gray-600 hover:text-blue-500" />
        )}
      </button>

      {/* Recipe/Diet Image */}
      <div className="relative h-48 w-full">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {recipe.type === 'recipe' ? (
              <FaUtensils className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            ) : (
              <FaClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center mb-4">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {recipe.userImage ? (
              <Image
                src={recipe.userImage}
                alt={recipe.userName}
                fill
                loading="lazy"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900 dark:text-gray-100">{recipe.userName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{recipe.type === 'recipe' ? 'Recipe' : 'Diet Plan'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <span>{recipe.type === 'diet' ? '7 days' : recipe.prepTime}</span>
          </div>
          <div className="flex items-center">
            <FaUtensils className="mr-2" />
            <span>{recipe.servings} {recipe.type === 'diet' ? 'plan' : 'servings'}</span>
          </div>
          <div className="flex items-center">
            <FaFire className="mr-2" />
            <span>{recipe.totalCalories} cal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MainPageRecipeCard;
