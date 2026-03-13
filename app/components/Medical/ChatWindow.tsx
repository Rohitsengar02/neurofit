'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaArrowLeft, FaSmile, FaImage } from 'react-icons/fa';
import { sendMessage, listenToMessages, ChatMessage } from '@/app/services/chatService';

interface ChatWindowProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  receiverId: string;
  receiverName: string;
  onBack?: () => void;
}

export default function ChatWindow({ 
  sessionId, 
  currentUserId, 
  currentUserName,
  receiverId, 
  receiverName,
  onBack 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = listenToMessages(sessionId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    await sendMessage(sessionId, currentUserId, currentUserName, receiverId, text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-100px)] bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <FaArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
          {receiverName[0]}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white leading-none">{receiverName}</h3>
          <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-wider">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm
                ${isMe 
                  ? 'bg-indigo-500 text-white rounded-tr-none shadow-indigo-200 dark:shadow-none' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-tl-none'}`}
              >
                {msg.text}
                <div className={`text-[8px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <button type="button" className="p-3 text-gray-400 hover:text-indigo-500 transition-colors">
          <FaSmile className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-6 pr-12 py-3 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500">
            <FaImage className="w-5 h-5" />
          </button>
        </div>
        <button
          type="submit"
          className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
