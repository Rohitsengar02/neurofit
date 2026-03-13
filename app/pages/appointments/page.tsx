'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { useAuth } from '@/app/context/AuthContext';
import { getUserAppointments, Appointment } from '@/app/services/medicalService';

export default function UserAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyApts() {
      if (user) {
        try {
          const data = await getUserAppointments(user.uid);
          // Sorting by date (descending)
          const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setAppointments(sorted);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchMyApts();
  }, [user]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[2rem]"></div>
              ))
            ) : appointments.length > 0 ? (
              <AnimatePresence>
                {appointments.map((apt, index) => (
                  <motion.div 
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-500 text-2xl">
                          {apt.doctorName[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{apt.doctorName}</h4>
                          <p className="text-indigo-500 text-sm font-medium">{apt.doctorSpecialty}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider
                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                          apt.status === 'pending' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
                          'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {apt.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex items-center gap-3">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Date</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                            {new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex items-center gap-3">
                        <FaClock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Time</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{apt.slot}</p>
                        </div>
                      </div>
                    </div>

                    {apt.status === 'confirmed' && (
                      <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-600 transition-colors">
                        <FaVideo className="w-4 h-4" />
                        Join Consultation
                      </button>
                    )}
                    
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-24">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCalendarAlt className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Appointments Yet</h3>
                <p className="text-gray-400 text-sm max-w-[200px] mx-auto mb-8">
                  You haven't booked any medical consultations yet.
                </p>
                <button 
                  onClick={() => router.push('/pages/doctors')}
                  className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  Find a Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
