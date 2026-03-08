'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch, FaBrain, FaHeartbeat,
  FaStethoscope, FaPhone, FaCalendarAlt, FaStar
} from 'react-icons/fa';
import { GiLungs } from 'react-icons/gi';
import { MdAccessTime, MdNotificationsNone } from 'react-icons/md';
import MainLayout from '@/app/components/Layout/MainLayout';
import { useAuth } from '@/app/context/AuthContext';
import { doctorsData } from '@/app/data/doctorsData';
import Link from 'next/link';

const categories = [
  { id: 1, name: 'Neurologist', icon: FaBrain, color: 'text-pink-500', bgColor: 'bg-pink-100' },
  { id: 2, name: 'Cardiologist', icon: FaHeartbeat, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { id: 3, name: 'Orthopedist', icon: FaStethoscope, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { id: 4, name: 'Pulmonologist', icon: GiLungs, color: 'text-blue-400', bgColor: 'bg-blue-50' },
];

export default function DoctorsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = doctorsData.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
        <div className="max-w-md mx-auto px-4 pb-4 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-gray-400 text-lg">Hello,</h1>
              <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                {user?.displayName || 'Siyam Ahamed!'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <MdNotificationsNone className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Doctor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar mb-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/pages/doctors/category/${category.name.toLowerCase().replace('ist', '')}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-3 min-w-[100px]"
                >
                  <div className={`${category.bgColor} dark:bg-opacity-20 p-5 rounded-2xl shadow-sm`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{category.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Upcoming Appointment */}
          <div className="mt-8 mb-8">
            <h3 className="text-gray-900 dark:text-white text-xl font-bold mb-4">Upcoming Appointment</h3>
            <Link href="/pages/doctors/dr-sameer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="bg-indigo-500 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 border border-white/30 backdrop-blur-md">
                    <img
                      src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlNl9hX3Bob3RvX29mX2FfbWlkZGxlX2FnZV9tYWxlX2luZGlhbl9kb2N0b3JfaXNvbF8wZTAzNGE0YS1iMWU1LTQxOTEtYmU0Zi1iYmE2NWJkMjNmMmEucG5n.png"
                      alt="Dr. Sameer Khan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Dr. Sameer Khan</h4>
                    <p className="text-white/80 text-sm italic">Orthopedic Consultation (Spine Specialist)</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-white/70" />
                    <span className="text-sm">Wed, 7 Sep 2024</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                    <MdAccessTime className="w-4 h-4 text-white/70" />
                    <span className="text-sm">10:30 - 11:30 AM</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Become a Doctor Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-200 dark:shadow-none"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Are you a Doctor?</h3>
              <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                Join our network of elite specialists and help athletes perform at their peak.
              </p>
              <Link 
                href="/pages/doctors/apply"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-blue-50 active:scale-95"
              >
                Become a Doctor
              </Link>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute right-10 top-0 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
          </motion.div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white text-xl font-bold">Recommended Doctors</h3>
              <Link href="/pages/doctors/category" className="text-indigo-500 font-semibold text-sm hover:underline">See All</Link>
            </div>
            <div className="space-y-4 pb-20">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
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
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <Link 
                          href={`/pages/doctors/${doctor.id}`}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                        >
                          View Profile
                        </Link>
                        <button className="w-9 h-9 flex items-center justify-center bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-600 transition-all">
                          <FaPhone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
