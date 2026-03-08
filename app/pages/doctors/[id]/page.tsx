'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaHeart, FaStar, FaUserFriends, 
  FaCalendarAlt, FaComments, FaMapMarkerAlt,
  FaAward, FaCheckCircle
} from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { doctorsData } from '@/app/data/doctorsData';
import Link from 'next/link';

export default function DoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const doctor = doctorsData.find(doc => doc.id === id);

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Detail</h1>
            <button className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-pink-500">
              <FaHeart className="w-5 h-5" />
            </button>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm mb-6">
            <div className="flex gap-6 mb-6">
              <div className="w-28 h-32 rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{doctor.name}</h2>
                  <FaCheckCircle className="text-blue-500 w-4 h-4" />
                </div>
                <p className="text-gray-400 text-sm mb-3">{doctor.specialty} | {doctor.hospital}</p>
                
                <div className="flex items-center gap-1 bg-yellow-400/10 w-fit px-3 py-1.5 rounded-xl">
                  <FaStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-500">{doctor.rating}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl text-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaUserFriends className="text-blue-500 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400">Patients</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{doctor.patients}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaAward className="text-orange-500 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400">Exp</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{doctor.experience.split(' ')[0]} yrs</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl text-center">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaComments className="text-pink-500 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400">Reviews</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{doctor.reviews}</p>
              </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About Doctor</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Schedule Info */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Working Time</h3>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="text-indigo-500" />
                <span className="text-sm">{doctor.availableDays.join(', ')} (08:00 AM - 08:00 PM)</span>
              </div>
            </div>

            {/* Book Button */}
            <Link
              href={`/pages/doctors/${doctor.id}/book`}
              className="w-full flex items-center justify-center gap-3 bg-indigo-500 py-4 rounded-[1.5rem] text-white font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-600 transition-all active:scale-95"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
