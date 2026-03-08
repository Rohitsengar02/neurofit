'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheck, FaTimes, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';

import { useAuth } from '@/app/context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus, Appointment } from '@/app/services/medicalService';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Today');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchApts() {
      if (user) {
        try {
          const data = await getDoctorAppointments(user.uid);
          setAppointments(data);
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
    const dateStr = new Date(a.date).toLocaleDateString();
    const todayStr = new Date().toLocaleDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();

    if (activeTab === 'Today') return dateStr === todayStr;
    if (activeTab === 'Tomorrow') return dateStr === tomorrowStr;
    return true;
  });

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          </div>

          {/* Custom Tabs */}
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl flex items-center mb-8 shadow-sm">
            {['Today', 'Tomorrow', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' 
                    : 'text-gray-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-6">
            {filtered.length > 0 ? (
              filtered.map((apt) => (
                <motion.div 
                  key={apt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative pl-6 border-l-2 border-indigo-500/30"
                >
                  {/* Timeline Bullet */}
                  <div className="absolute left-[-5px] top-6 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                        <FaClock className="w-3.5 h-3.5" />
                        {apt.slot}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-600`}>
                        {apt.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-500">
                        {apt.userName ? apt.userName[0] : 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{apt.userName}</h4>
                        <p className="text-xs text-gray-400 italic">Patient ID: #NF-{apt.id?.slice(-4)}</p>
                      </div>
                    </div>

                    {apt.status === 'pending' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleStatusUpdate(apt.id!, 'cancelled')}
                          className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs transition-colors hover:bg-red-100 flex items-center justify-center gap-2"
                        >
                          <FaTimes className="w-3 h-3" />
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(apt.id!, 'confirmed')}
                          className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                          <FaCheck className="w-3 h-3" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 italic text-sm">No appointments for {activeTab}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
