'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCommentDots, FaUser, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { useAuth } from '@/app/context/AuthContext';
import { listenToDoctorSessions, ChatSession } from '@/app/services/chatService';
import ChatWindow from '@/app/components/Medical/ChatWindow';

export default function DoctorChatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToDoctorSessions(user.uid, (data) => {
        setSessions(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const filteredSessions = sessions.filter(s => 
    s.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 pt-4">
        <div className="max-w-md mx-auto px-6">
          {!selectedSession ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => router.back()}
                  className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Patient Messages</h1>
              </div>

              {/* Search */}
              <div className="relative mb-8">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Chat List */}
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[2rem]"></div>
                  ))
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSession(session)}
                      className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 cursor-pointer hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl uppercase">
                        {session.userName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate">{session.userName}</h4>
                          <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                            {session.lastMessageTime?.toDate ? new Date(session.lastMessageTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate leading-none">
                          {session.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <FaCommentDots className="w-8 h-8" />
                    </div>
                    <p className="text-gray-400 italic text-sm">No active patient chats</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ChatWindow
                sessionId={selectedSession.id}
                currentUserId={user?.uid || ''}
                currentUserName={user?.displayName || 'Doctor'}
                receiverId={selectedSession.userId}
                receiverName={selectedSession.userName || 'Patient'}
                onBack={() => setSelectedSession(null)}
              />
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
