'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheck, FaTimes, FaMapMarkerAlt, FaVideo, FaFilter } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import { useAuth } from '@/app/context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus, Appointment } from '@/app/services/medicalService';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchApts() {
      if (user) {
        try {
          // In a real app, we'd use a doctor-specific ID. 
          // For this panel demo, we show appointments for current "doctor" user.
          const data = await getDoctorAppointments(user.uid);
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
    fetchApts();
  }, [user]);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'All') return true;
    
    const aptDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkDate = new Date(aptDate);
    checkDate.setHours(0, 0, 0, 0);

    if (activeTab === 'Today') return checkDate.getTime() === today.getTime();
    if (activeTab === 'Tomorrow') return checkDate.getTime() === tomorrow.getDate();
    return true;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Appointments</h1>
            </div>
            <button className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl">
              <FaFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Tabs */}
          <div className="bg-white dark:bg-gray-900 p-1.5 rounded-2xl flex items-center mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
            {['Today', 'Tomorrow', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                    : 'text-gray-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[2rem]"></div>
              ))
            ) : filtered.length > 0 ? (
              <AnimatePresence>
                {filtered.map((apt, index) => (
                  <motion.div 
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6 border-l-2 border-indigo-500/20"
                  >
                    {/* Timeline Bullet */}
                    <div className="absolute left-[-5px] top-6 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                          <FaClock className="w-3.5 h-3.5" />
                          {apt.slot}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase 
                          ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                            apt.status === 'pending' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {apt.status}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-500 text-xl">
                          {apt.userName ? apt.userName[0] : 'P'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{apt.userName}</h4>
                          <p className="text-xs text-gray-400 italic">
                            {new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {apt.status === 'pending' ? (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleStatusUpdate(apt.id!, 'cancelled')}
                            className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl font-bold text-xs transition-colors hover:bg-red-100 flex items-center justify-center gap-2"
                          >
                            <FaTimes className="w-3 h-3" />
                            Decline
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(apt.id!, 'confirmed')}
                            className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                          >
                            <FaCheck className="w-3 h-3" />
                            Accept
                          </button>
                        </div>
                      ) : apt.status === 'confirmed' ? (
                        <div className="flex gap-3">
                          <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                            <FaVideo className="w-3 h-3" />
                            Start Meeting
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 italic text-sm">No appointments found for {activeTab}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
