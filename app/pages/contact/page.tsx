'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SuccessPopup } from '@/app/components/ui/SuccessPopup';

interface SuggestionForm {
  subject: string;
  message: string;
  type: 'suggestion' | 'contact';
}

export default function ContactPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState<{
    displayName: string;
    email: string;
    photoURL: string;
  } | null>(null);
  const [formData, setFormData] = useState<SuggestionForm>({
    subject: '',
    message: '',
    type: 'suggestion'
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to submit suggestions');
      router.push('/auth/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            displayName: data.displayName || user.displayName || 'Anonymous',
            email: data.email || user.email || '',
            photoURL: data.photoURL || user.photoURL || '/default-avatar.png'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'suggestions'), {
        userId: user.uid,
        name: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        status: 'pending',
        createdAt: new Date()
      });
      
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !userData) {
    return null; // Page will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={`Thanks for your ${formData.type}! We'll review it and get back to you soon.`}
      />
      
      <div className="max-w-4xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            We'd love to hear from you! Share your suggestions to help us improve.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-50 dark:bg-opacity-50"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={userData.photoURL}
                  alt={userData.displayName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userData.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {userData.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="What's this about?"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all resize-none"
                  placeholder="Share your thoughts with us..."
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4"
              >
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'suggestion' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    formData.type === 'suggestion'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <HiSparkles className={`w-5 h-5 ${
                    formData.type === 'suggestion' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'contact' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    formData.type === 'contact'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiMessageSquare className={`w-5 h-5 ${
                    formData.type === 'contact' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  Contact
                </button>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
