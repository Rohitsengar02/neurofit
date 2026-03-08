'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaFilter, FaStar, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { doctorsData } from '@/app/data/doctorsData';
import Link from 'next/link';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  
  const filteredDoctors = doctorsData.filter(doc => 
    doc.specialty.toLowerCase() === category.toLowerCase()
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {category}s
            </h1>
            <button className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200">
              <FaFilter className="w-5 h-5" />
            </button>
          </div>

          {/* Doctors List */}
          <div className="space-y-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <motion.div 
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={doctor.image} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-gray-900 dark:text-white font-bold text-lg">{doctor.name}</h4>
                          <p className="text-gray-400 text-sm mb-1">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                          <FaStar className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-500">{doctor.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-3 italic">{doctor.experience}</p>
                      
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/pages/doctors/${doctor.id}`}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                        >
                          View Details
                        </Link>
                        <button className="w-9 h-9 flex items-center justify-center bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-600 transition-all">
                          <FaPhone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-300 dark:text-gray-700 mb-4 flex justify-center">
                  <span className="text-6xl text-gray-200 dark:text-gray-800">🔍</span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">No Doctors Found</h3>
                <p className="text-gray-400">We couldn't find any {category}s available right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
