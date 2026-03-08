'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserInjured, FaCalendarCheck, FaClock, FaChartLine, 
  FaUserFriends, FaRegStar, FaBell, FaSearch, FaEllipsisV
} from 'react-icons/fa';
import MainLayout from '@/app/components/Layout/MainLayout';
import Link from 'next/link';

const stats = [
  { id: 1, label: 'Today Patients', value: '12', trend: '+2', icon: FaUserInjured, color: 'bg-blue-100 text-blue-600' },
  { id: 2, label: 'Appointments', value: '45', trend: '+5', icon: FaCalendarCheck, color: 'bg-purple-100 text-purple-600' },
  { id: 3, label: 'Avg. Rating', value: '4.9', trend: '-0.1', icon: FaRegStar, color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, label: 'Total Earnings', value: '$2.4k', trend: '+12%', icon: FaChartLine, color: 'bg-green-100 text-green-600' },
];

import { useAuth } from '@/app/context/AuthContext';
import { getDoctorAppointments, Appointment } from '@/app/services/medicalService';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          // For demo/dev, we use the user's UID. In production, this would be a verified doctorId.
          const data = await getDoctorAppointments(user.uid);
          setAppointments(data);
        } catch (error) {
          console.error('Error fetching doctor data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  const upcomingPatients = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').slice(0, 3);
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 p-0.5">
                <img src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlNl9hX3Bob3RvX29mX2FfbWlkZGxlX2FnZV9tYWxlX2luZGlhbl9kb2N0b3JfaXNvbF8wZTAzNGE0YS1iMWU1LTQxOTEtYmU0Zi1iYmE2NWJkMjNmMmEucG5n.png" className="w-full h-full object-cover rounded-full" alt="Doctor" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">Dr. Sameer Khan</h1>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-500">
                <FaBell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search patients, dates..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((stat) => (
              <motion.div 
                key={stat.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-gray-400 text-xs font-medium mb-1">{stat.label}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</span>
                  <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Appointments */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Patients</h2>
              <button className="text-indigo-500 text-sm font-bold">View Schedule</button>
            </div>
            <div className="space-y-4">
              {upcomingPatients.length > 0 ? (
                upcomingPatients.map((apt) => (
                  <motion.div 
                    key={apt.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-500">
                      {apt.userName ? apt.userName[0] : 'P'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{apt.userName}</h4>
                      <p className="text-xs text-gray-400">{apt.doctorSpecialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-xs mb-1">
                        <FaClock className="w-3 h-3" />
                        {apt.slot}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase
                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-400 text-sm">No upcoming patients</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Center */}
          <div className="grid grid-cols-2 gap-4 pb-10">
            <Link 
              href="/pages/doctor-panel/patients"
              className="bg-indigo-500 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col items-center gap-3 transition-transform hover:scale-[1.02]"
            >
              <FaUserFriends className="w-6 h-6" />
              <span className="font-bold text-sm">Patient List</span>
            </Link>
            <Link 
              href="/pages/doctor-panel/profile"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-[2rem] shadow-sm flex flex-col items-center gap-3 border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.02]"
            >
              <FaEllipsisV className="w-6 h-6" />
              <span className="font-bold text-sm">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
