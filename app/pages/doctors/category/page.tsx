'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBrain, FaHeartbeat, FaStethoscope } from 'react-icons/fa';
import { GiLungs } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import Link from 'next/link';

const allCategories = [
  { id: 1, name: 'Neurologist', icon: FaBrain, color: 'text-pink-500', bgColor: 'bg-pink-100', count: 12 },
  { id: 2, name: 'Cardiologist', icon: FaHeartbeat, color: 'text-blue-500', bgColor: 'bg-blue-100', count: 8 },
  { id: 3, name: 'Orthopedist', icon: FaStethoscope, color: 'text-orange-500', bgColor: 'bg-orange-100', count: 15 },
  { id: 4, name: 'Pulmonologist', icon: GiLungs, color: 'text-blue-400', bgColor: 'bg-blue-50', count: 5 },
  { id: 5, name: 'Dentist', icon: FaStethoscope, color: 'text-teal-500', bgColor: 'bg-teal-100', count: 20 },
  { id: 6, name: 'Eye Specialist', icon: FaStethoscope, color: 'text-purple-500', bgColor: 'bg-purple-100', count: 7 },
];

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Categories</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/pages/doctors/category/${category.name.toLowerCase().replace('ist', '')}`}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center"
                >
                  <div className={`${category.bgColor} dark:bg-opacity-20 p-5 rounded-3xl mb-4`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{category.name}</h3>
                  <p className="text-gray-400 text-xs">{category.count} Doctors</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
