'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBookmark, FaPlus, FaList, FaRegBookmark, FaArrowRight } from 'react-icons/fa';
import RecipeCard from '../components/Diet/RecipeCard';
import MainPageRecipeCard from '../components/Diet/MainPageRecipeCard';
import RecipeModal from '../components/Diet/RecipeModal';
import { useRouter } from 'next/navigation';
import { Meal } from '../services/dietService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addComment } from '../services/userStatsService';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'lucide-react';

const sampleImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
];

export default function DietPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [diets, setDiets] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users first
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = Object.fromEntries(
          usersSnapshot.docs.map(doc => [
            doc.id,
            {
              id: doc.id,
              name: doc.data().displayName || 'Anonymous User',
              image: doc.data().photoURL || null
            }
          ])
        );
        setUsers(Object.values(usersData));

        // Fetch recipes and diets
        const recipesRef = collection(db, 'recipes');
        const dietsRef = collection(db, 'diets');

        const [recipesSnapshot, dietsSnapshot] = await Promise.all([
          getDocs(recipesRef),
          getDocs(dietsRef)
        ]);

        // Merge recipe data with user data
        const recipesData = recipesSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const user = usersData[data.userId] || {
            name: 'Anonymous User',
            image: null
          };
          return {
            ...data,
            id: doc.id,
            type: 'recipe',
            userName: user.name,
            userImage: user.image,
            image: data.imageUrl || sampleImages[index % sampleImages.length],
          } as Meal;
        });

        // Merge diet data with user data
        const dietsData = dietsSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const user = usersData[data.userId] || {
            name: 'Anonymous User',
            image: null
          };
          return {
            ...data,
            id: doc.id,
            type: 'diet',
            userName: user.name,
            userImage: user.image,
            image: data.imageUrl || sampleImages[(index + 3) % sampleImages.length],
          } as Meal;
        });

        setRecipes(recipesData);
        setDiets(dietsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter recipes and diets based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDiets = diets.filter(diet =>
    diet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only show users who have created meals
  const activeUsers = users.filter(user => 
    [...recipes, ...diets].some(meal => meal.userId === user.id)
  );

  const handleRecipeClick = (recipe: Meal) => {
    setSelectedRecipe(recipe);
  };

  const handleDietClick = (diet: Meal) => {
    setSelectedRecipe(diet);
  };

  const handleComment = async (recipe: Meal) => {
    setSelectedRecipe(recipe);
    setShowCommentModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
     

      {/* Featured Creators */}
      {activeUsers.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Featured Creators
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/diet/creators')}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              View All
            </motion.button>
          </div>
          <div className="flex overflow-x-auto space-x-6 pb-2 scrollbar-hide">
            {/* Add Recipe Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/diet/add')}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
                            flex items-center justify-center text-white text-2xl shadow-lg
                            hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                +
              </div>
              <p className="text-center mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                Add Recipe
              </p>
            </motion.div>

            {/* User Stories */}
            {activeUsers.slice(0, 6).map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-500/20 shadow-lg">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 
                                  dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <span className="text-base font-bold text-gray-500 dark:text-gray-400">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                               border-2 border-white dark:border-gray-800"></div>
                </div>
                <p className="text-center mt-1 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[64px]">
                  {user.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Recipes */}
      <div className="mb-12 ">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Popular Recipes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.slice(0, 6).map((recipe) => (
            <MainPageRecipeCard
              key={recipe.id}
              recipe={recipe}
              onComment={handleComment}
              isLiked={false}
              isSaved={false}
            />
          ))}
        </div>
      </div>

      {/* Featured Diet Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Diet Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diets.slice(0, 6).map((diet) => (
            <MainPageRecipeCard
              key={diet.id}
              recipe={diet}
              onComment={handleComment}
              isLiked={false}
              isSaved={false}
            />
          ))}
        </div>
      </div>

      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-12 right-8 flex flex-col items-end space-y-4 mb-8">
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* View All Recipes Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => router.push('/diet/recipes')}
                className="bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
              >
                <FaList className="w-5 h-5" />
                <span className="text-sm">View All Recipes</span>
              </motion.button>

              {/* Saved Items Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => router.push('/saved')}
                className="bg-purple-500 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 hover:bg-purple-600 transition-colors"
              >
                <FaBookmark className="w-5 h-5" />
                <span className="text-sm">Saved Items</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors ${isMenuOpen ? 'rotate-45' : ''}`}
          style={{ transition: 'transform 0.2s' }}
        >
          <FaPlus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe && !showCommentModal}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Comment Modal */}
      {showCommentModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Add Comment</h3>
            <textarea
              ref={commentInputRef}
              className="w-full h-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your comment..."
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  if (commentInputRef.current) {
                    commentInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!user || !selectedRecipe || !commentInputRef.current?.value.trim()) return;
                  
                  setIsSubmitting(true);
                  try {
                    await addComment(user.uid, selectedRecipe.id, commentInputRef.current.value.trim());
                    setShowCommentModal(false);
                    if (commentInputRef.current) {
                      commentInputRef.current.value = '';
                    }
                    
                    // Refresh the recipe data
                    const updatedRecipes = [...recipes];
                    const recipeIndex = updatedRecipes.findIndex(r => r.id === selectedRecipe.id);
                    if (recipeIndex !== -1) {
                      updatedRecipes[recipeIndex] = {
                        ...updatedRecipes[recipeIndex],
                        comments: [...(updatedRecipes[recipeIndex].comments || []), {
                          id: Math.random().toString(),
                          userId: user.uid,
                          userName: user.displayName || 'User',
                          userImage: user.photoURL || '',
                          content: commentInputRef.current.value.trim(),
                          createdAt: new Date(),
                          likes: 0
                        }]
                      };
                      setRecipes(updatedRecipes);
                    }
                  } catch (error) {
                    console.error('Error adding comment:', error);
                    alert('Failed to add comment. Please try again.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
