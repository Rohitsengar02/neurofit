'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSearch, FaHistory, FaPhone, FaComment, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';

const patients = [
  { id: 1, name: 'Siyam Ahamed', age: 24, gender: 'Male', lastVisit: '12 Sep 2024', status: 'Active', image: 'https://i.pravatar.cc/150?u=siyam' },
  { id: 2, name: 'Rahul Gupta', age: 29, gender: 'Male', lastVisit: '10 Sep 2024', status: 'Active', image: 'https://i.pravatar.cc/150?u=rahul' },
  { id: 3, name: 'Ananya Singh', age: 22, gender: 'Female', lastVisit: '05 Sep 2024', status: 'Recovered', image: 'https://i.pravatar.cc/150?u=ananya' },
  { id: 4, name: 'Arjun Verma', age: 31, gender: 'Male', lastVisit: '01 Sep 2024', status: 'Active', image: 'https://i.pravatar.cc/150?u=arjun' },
  { id: 5, name: 'Priya Shama', age: 26, gender: 'Female', lastVisit: '28 Aug 2024', status: 'Neutral', image: 'https://i.pravatar.cc/150?u=priya' },
];

export default function PatientListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Patients List</h1>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredPatients.map((p) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{p.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{p.gender}, {p.age}y</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className={`font-medium ${p.status === 'Active' ? 'text-blue-500' : 'text-green-500'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300">
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                  <button className="flex flex-col items-center gap-1.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <FaHistory className="text-blue-500 w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">History</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <FaPhone className="text-green-500 w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Call</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <FaComment className="text-purple-500 w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Chat</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
