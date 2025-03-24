'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface Message extends DocumentData {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Define types for speech recognition
type SpeechRecognitionEvent = {
  results: {
    transcript: string;
    isFinal: boolean;
  }[][];
};

type SpeechRecognitionType = {
  new (): {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  };
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

gsap.registerPlugin(ScrollTrigger);

const VoiceAssistant = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollInitialized, setIsScrollInitialized] = useState(false);

  // Initialize locomotive scroll with proper cleanup
  useEffect(() => {
    if (!isScrollInitialized && typeof window !== 'undefined') {
      import('locomotive-scroll').then(({ default: LocomotiveScroll }) => {
        const scroll = new LocomotiveScroll({
          el: document.querySelector('[data-scroll-container]') as HTMLElement,
          smooth: true,
          smartphone: {
            smooth: true
          }
        });

        setIsScrollInitialized(true);

        return () => {
          scroll.destroy();
        };
      });
    }
  }, [isScrollInitialized]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const welcomeMessage = "Hello, I am Rudra, your personal fitness and health assistant. How can I help you today?";
      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.lang = 'hi-IN'; // Hindi voice
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Firebase message listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/assistance`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to Date
      })) as Message[];
      setMessages(newMessages);

      // Scroll to bottom when new messages arrive
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Hindi recognition

    recognition.onresult = (event: any) => {
      const results = event.results;
      let finalTranscript = '';

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setInputText(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-900 dark:text-white text-lg">Loading Rudra AI...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to use Rudra AI Assistant</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    setIsLoading(true);
    const userMessage = {
      text: inputText,
      sender: 'user' as const,
      timestamp: new Date()
    };

    try {
      // Add user message to Firebase
      await addDoc(collection(db, `users/${user.uid}/assistance`), userMessage);

      // Call Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from Gemini API');
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('No response from Gemini API');
      }

      // Add assistant response to Firebase
      await addDoc(collection(db, `users/${user.uid}/assistance`), {
        text: data.response,
        sender: 'assistant' as const,
        timestamp: new Date()
      });

      // Speak the response
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      await addDoc(collection(db, `users/${user.uid}/assistance`), {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant' as const,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const endConversation = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, `users/${user.uid}/assistance`));
      const snapshot = await getDocs(q);
      
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
      setMessages([]);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white" data-scroll-container>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white/50 dark:bg-black/50 backdrop-blur-lg z-50 p-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rudra AI Assistant</h1>
          <button
            onClick={endConversation}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            End Chat
          </button>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="max-w-4xl mx-auto pt-24 pb-32 px-4 min-h-[calc(100vh-8rem)] overflow-y-auto"
        data-scroll
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                }`}
              >
                <p className={message.sender === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                  {message.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/50 dark:bg-black/50 backdrop-blur-lg p-4 mb-16 md:mb-0"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-4 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceAssistant;
