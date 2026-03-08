'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle, 
  FaCreditCard, FaPaypal, FaApplePay 
} from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/app/components/Layout/MainLayout';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { bookAppointment } from '@/app/services/medicalService';
import { doctorsData } from '@/app/data/doctorsData';

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const doctor = doctorsData.find(doc => doc.id === id);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!doctor) return <div>Doctor not found</div>;

  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      full: date
    };
  });

  const handleBooking = async () => {
    if (!user) {
      setError('Please log in to book an appointment');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await bookAppointment({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Anonymous',
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: days[selectedDate!].full.toISOString(),
        slot: selectedSlot!,
        status: 'pending',
        paymentMethod: paymentMethod,
        fee: doctor.fee
      });
      setStep(3);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-4">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => step === 3 ? router.push('/pages/doctors') : (step > 1 ? setStep(step - 1) : router.back())}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-700 dark:text-gray-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === 1 && 'Select Schedule'}
              {step === 2 && 'Confirm Payment'}
              {step === 3 && 'Booking Success'}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Date Selection */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6">
                  {days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(idx)}
                      className={`min-w-[70px] py-4 rounded-3xl flex flex-col items-center gap-1 transition-all
                        ${selectedDate === idx 
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' 
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="text-xs uppercase opacity-70">{day.dayName}</span>
                      <span className="text-lg font-bold">{day.date}</span>
                    </button>
                  ))}
                </div>

                {/* Slot Selection */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Time Slot</h3>
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 ml-1">Morning</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {doctor.slots.morning.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 rounded-2xl text-sm font-medium transition-all
                            ${selectedSlot === slot 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 ml-1">Afternoon</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {doctor.slots.afternoon.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 rounded-2xl text-sm font-medium transition-all
                            ${selectedSlot === slot 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={selectedDate === null || !selectedSlot}
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-500 py-4 rounded-[1.5rem] text-white font-bold text-lg disabled:opacity-50 transition-all hover:bg-indigo-600 active:scale-95 shadow-xl shadow-indigo-200"
                >
                  Confirm Schedule
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Booking Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6">
                  <div className="flex gap-4 items-center mb-6">
                    <img src={doctor.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{doctor.name}</h4>
                      <p className="text-gray-400 text-sm">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="font-bold text-gray-900 dark:text-white">{days[selectedDate!].dayName}, {days[selectedDate!].date} Sep</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white font-bold">Total Cost</span>
                      <span className="text-indigo-500 font-bold">${doctor.fee}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
                <div className="space-y-3 mb-8">
                  {[
                    { id: 'card', name: 'Credit Card', icon: FaCreditCard, color: 'text-blue-500' },
                    { id: 'paytm', name: 'Paytm', icon: () => <span className="font-black text-xs text-blue-600">Paytm</span>, color: '' },
                    { id: 'phonepe', name: 'PhonePe', icon: () => <span className="font-black text-xs text-purple-600">PhonePe</span>, color: '' },
                    { id: 'paypal', name: 'PayPal', icon: FaPaypal, color: 'text-indigo-400' },
                    { id: 'apple', name: 'Apple Pay', icon: FaApplePay, color: 'text-gray-900 dark:text-white' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2
                        ${paymentMethod === method.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500' 
                          : 'bg-white dark:bg-gray-800 border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700/50`}>
                          {method.id === 'paytm' ? (
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.png" className="w-8 h-auto" />
                          ) : method.id === 'phonepe' ? (
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/PhonePe_Logo.png" className="w-6 h-auto" />
                          ) : (
                            <method.icon className={`w-6 h-6 ${method.color}`} />
                          )}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{method.name}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${paymentMethod === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-200 dark:border-gray-700'}`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  onClick={handleBooking}
                  className="w-full bg-indigo-500 py-4 rounded-[1.5rem] text-white font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Processing...' : 'Pay & Confirm'}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <FaCheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
                <p className="text-gray-400 text-center mb-8">
                  Your appointment with <span className="text-indigo-500 font-bold">{doctor.name}</span> has been confirmed.
                </p>
                <button
                  onClick={() => router.push('/pages/doctors')}
                  className="w-full bg-indigo-500 py-4 rounded-[1.5rem] text-white font-bold text-lg shadow-xl shadow-indigo-200"
                >
                  Back to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}
