'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
  DocumentData,
  limit,
  where,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { BsRobot, BsSun, BsMoon, BsTrash } from 'react-icons/bs';
import { MdOutlineAutoAwesome } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: any;
  language: string;
}

interface IWebkitWindow extends Window {
  webkitSpeechRecognition: any;
}

type SpeechRecognitionEvent = {
  results: {
    transcript: string;
    isFinal: boolean;
  }[][];
  resultIndex: number;
}

const VoiceAssistant = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoListen, setAutoListen] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Workouts', path: '/workouts' },
    { name: 'Progress', path: '/progress' },
    { name: 'Settings', path: '/settings' }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadMessages = async () => {
      if (user) {
        const messagesRef = collection(db, `users/${user.uid}/assistance`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const loadedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setMessages(loadedMessages as Message[]);
      }
    };

    loadMessages();
  }, [user]);

  useEffect(() => {
    if (user) {
      const messagesRef = collection(db, `users/${user.uid}/assistance`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setMessages(newMessages as Message[]);
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-900 dark:text-white text-lg">Loading Neuro AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to use Neuro AI Assistant</p>
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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const formatMessage = (text: string) => {
    // Clean up the text and ensure proper formatting
    return text
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n') // Add newlines after sentence endings
      .replace(/(\d+\.)\s*/g, '\n$1 ') // Add newline before numbered points
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/[*\-•]/g, '') // Remove any stray bullet points or symbols
      .trim();
  };

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/[*\-•:]/g, ' ') // Replace symbols with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/(\d+)\./g, 'number $1') // Convert "1." to "number 1"
      .trim();
  };

  const initSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as unknown as IWebkitWindow).webkitSpeechRecognition;

      if (SpeechRecognition) {
        // Clean up existing instance
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current.removeEventListener('result', () => { });
            recognitionRef.current.removeEventListener('end', () => { });
            recognitionRef.current.removeEventListener('error', () => { });
            recognitionRef.current = null;
            setIsListening(false);
          } catch (error) {
            console.error('Error cleaning up recognition:', error);
          }
        }

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;

        let currentTranscript = '';
        let lastSentTime = 0;
        let isProcessing = false;
        let isRecognitionActive = false;
        let noSpeechTimer: NodeJS.Timeout | null = null;
        let restartAttempts = 0;
        const MAX_RESTART_ATTEMPTS = 3;
        const RESTART_DELAY = 1000;
        const NO_SPEECH_TIMEOUT = 5000; // 5 seconds of no speech

        const resetNoSpeechTimer = () => {
          if (noSpeechTimer) {
            clearTimeout(noSpeechTimer);
          }
          noSpeechTimer = setTimeout(() => {
            if (isRecognitionActive && !isProcessing) {
              try {
                recognitionInstance.stop();
                isRecognitionActive = false;
                setTimeout(() => {
                  if (autoListen && !isProcessing) {
                    try {
                      recognitionInstance.start();
                      isRecognitionActive = true;
                    } catch (error) {
                      console.error('Error restarting after timeout:', error);
                    }
                  }
                }, 100);
              } catch (error) {
                console.error('Error handling no speech:', error);
              }
            }
          }, NO_SPEECH_TIMEOUT);
        };

        const handleStart = () => {
          console.log('Recognition started');
          setIsListening(true);
          isRecognitionActive = true;
          currentTranscript = '';
          isProcessing = false;
          restartAttempts = 0;
          resetNoSpeechTimer();
        };

        const handleError = async (event: any) => {
          console.log('Recognition error:', event.error);
          if (event.error === 'no-speech') {
            if (restartAttempts < MAX_RESTART_ATTEMPTS) {
              restartAttempts++;
              isRecognitionActive = false;
              await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));

              if (!isRecognitionActive && autoListen && !isProcessing) {
                try {
                  recognitionInstance.start();
                  isRecognitionActive = true;
                } catch (error) {
                  console.error('Error restarting after no speech:', error);
                }
              }
            } else {
              setIsListening(false);
              recognitionRef.current = null;
            }
          } else if (event.error === 'aborted' || event.error === 'network') {
            isRecognitionActive = false;
            if (autoListen && !isProcessing) {
              await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));
              if (!isRecognitionActive) {
                try {
                  recognitionInstance.start();
                  isRecognitionActive = true;
                  restartAttempts = 0;
                } catch (error) {
                  console.error('Error restarting after abort:', error);
                }
              }
            }
          }
        };

        const handleEnd = async () => {
          console.log('Recognition ended');
          if (noSpeechTimer) {
            clearTimeout(noSpeechTimer);
          }

          isRecognitionActive = false;

          if (autoListen && !isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 300));

            if (!isRecognitionActive && restartAttempts < MAX_RESTART_ATTEMPTS) {
              try {
                recognitionInstance.start();
                isRecognitionActive = true;
                restartAttempts = 0;
              } catch (error) {
                console.error('Error restarting in handleEnd:', error);
                if (++restartAttempts >= MAX_RESTART_ATTEMPTS) {
                  setIsListening(false);
                  recognitionRef.current = null;
                }
              }
            }
          } else {
            setIsListening(false);
          }
        };

        const handleResult = async (event: any) => {
          if (isProcessing) return;

          resetNoSpeechTimer();
          restartAttempts = 0;

          const result = event.results[event.results.length - 1];

          if (result.isFinal) {
            const transcript = result[0].transcript.trim();
            const currentTime = Date.now();

            if (transcript &&
              transcript !== currentTranscript &&
              currentTime - lastSentTime > 1000) {
              isProcessing = true;
              currentTranscript = transcript;
              lastSentTime = currentTime;

              try {
                setInputText(transcript);
                await handleSend(transcript);
              } catch (error) {
                console.error('Error processing transcript:', error);
              } finally {
                isProcessing = false;
                currentTranscript = '';
                setInputText('');
              }
            }
          } else {
            const interimTranscript = result[0].transcript;
            if (interimTranscript.trim()) {
              setInputText(interimTranscript);
            }
          }
        };

        recognitionInstance.onstart = handleStart;
        recognitionInstance.onerror = handleError;
        recognitionInstance.onend = handleEnd;
        recognitionInstance.onresult = handleResult;

        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;

        if (autoListen && !isRecognitionActive) {
          setTimeout(() => {
            try {
              recognitionInstance.start();
              isRecognitionActive = true;
            } catch (error) {
              console.error('Error starting recognition:', error);
            }
          }, 100);
        }
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
          setIsListening(false);
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    } else {
      initSpeechRecognition();
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || !user) return;

    setInputText('');
    setIsLoading(true);

    try {
      // Add user message
      const userMessageRef = await addDoc(collection(db, `users/${user.uid}/assistance`), {
        text: messageText,
        sender: 'user' as const,
        timestamp: serverTimestamp(),
        language: 'en'
      });

      // Get AI response
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: 'en',
          context: messages.slice(-5).map(msg => ({
            role: msg.sender,
            content: msg.text
          }))
        }),
      });

      let aiResponse = '';
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data.error, data.details);
        if (data.error === 'API key not configured') {
          aiResponse = "Sorry, the AI service is not properly configured. Please check the GEMINI_API_KEY environment variable.";
        } else {
          aiResponse = "Sorry, there was an error processing your request. Please try again later.";
        }
      } else if (!data.response) {
        console.error('Empty response from API');
        aiResponse = "Sorry, I couldn't generate a response at this time. Please try again.";
      } else {
        aiResponse = data.response;
      }

      // Add AI response
      const aiMessageRef = await addDoc(collection(db, `users/${user.uid}/assistance`), {
        text: aiResponse,
        sender: 'assistant' as const,
        timestamp: serverTimestamp(),
        language: 'en'
      });

      speak(aiResponse);

    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage = "Sorry, an error occurred while processing your request. Please check your connection and try again.";

      await addDoc(collection(db, `users/${user.uid}/assistance`), {
        text: errorMessage,
        sender: 'assistant' as const,
        timestamp: serverTimestamp(),
        language: 'en'
      });

    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean and split text into sentences
      const cleanText = cleanTextForSpeech(text);
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
      let currentIndex = 0;

      const speakNextSentence = () => {
        if (currentIndex < sentences.length) {
          const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
          utterance.lang = 'en-US';
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;

          // Load and set voice
          const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
              voice.name.toLowerCase().includes('google') &&
              voice.lang === 'en-US'
            ) || voices.find(voice =>
              voice.lang === 'en-US'
            ) || voices[0];

            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
          };

          if (window.speechSynthesis.getVoices().length) {
            loadVoices();
          } else {
            window.speechSynthesis.onvoiceschanged = loadVoices;
          }

          // Set speaking state to true when speech starts
          utterance.onstart = () => {
            setIsSpeaking(true);
          };

          // Handle end of sentence
          utterance.onend = () => {
            currentIndex++;
            speakNextSentence();
          };

          // Handle speech errors
          utterance.onerror = () => {
            console.error('Speech synthesis error');
            setIsSpeaking(false);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          // All sentences have been spoken
          setIsSpeaking(false);
        }
      };

      speakNextSentence();
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 pt-[15px]">
      {/* Chat Container with margins for navbar and bottom menu */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-[50px]"
        style={{
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} className="flex flex-col">
            <div className="flex justify-center mb-4">
              <div className="px-4 py-1 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full text-xs md:text-sm text-blue-800 dark:text-blue-200 font-medium shadow-sm border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                {date}
              </div>
            </div>
            {groupedMessages[date].map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } mb-4`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white'
                    } shadow-md backdrop-blur-sm border ${message.sender === 'user' ? 'border-blue-400/30' : 'border-gray-300/30 dark:border-gray-600/30'}`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
                    {formatMessage(message.text)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-md border border-gray-300/30 dark:border-gray-600/30 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative flex space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Neuro is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Control Bar */}
      <div className="fixed bottom-[10vh] md:bottom-0 left-0 right-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-gray-900/90 dark:to-indigo-950/90 backdrop-blur-md p-3 md:p-4 shadow-lg">
        {/* Input Area */}
        <div className="max-w-4xl mx-auto">
          {/* Input and Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full rounded-full px-4 py-2.5 md:py-3 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-sm md:text-base border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
              />
            </div>

            {/* Voice Control Button */}
            <button
              onClick={stopSpeech}
              className={`p-2 md:p-3 rounded-full ${isSpeaking ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] border ${isSpeaking ? 'border-red-400/30' : 'border-green-400/30'}`}
              title={isSpeaking ? 'Stop Voice' : 'Voice Active'}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={async () => {
                if (user && window.confirm('Are you sure you want to clear all chat messages?')) {
                  const batch = writeBatch(db);
                  const querySnapshot = await getDocs(
                    collection(db, `users/${user.uid}/assistance`)
                  );
                  querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                  });
                  await batch.commit();
                  setMessages([]);
                }
              }}
              className="p-2 md:p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] border border-red-400/30"
              title="Clear Chat History"
            >
              <BsTrash className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className="p-2 md:p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] border border-blue-400/30"
            >
              <IoSend className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
