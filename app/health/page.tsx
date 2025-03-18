'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiMoon, FiTrendingUp } from 'react-icons/fi';
import { authorizeGoogleFit, fetchHealthData, type HealthData } from '../services/googleFit';
import MainLayout from '../components/Layout/MainLayout';

export default function HealthPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleFitConnection();
  }, []);

  const checkGoogleFitConnection = () => {
    const isAuthorized = window.gapi?.auth2?.getAuthInstance()?.isSignedIn.get();
    setIsConnected(!!isAuthorized);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting Google Fit authorization...');
      await authorizeGoogleFit();
      console.log('Successfully authorized with Google Fit');
      setIsConnected(true);
      await fetchAndUpdateHealthData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error connecting to Google Fit:', {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndUpdateHealthData = async () => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7); // Get last 7 days of data

      console.log('Fetching health data...', { start, end });
      const data = await fetchHealthData({ start, end });
      console.log('Successfully fetched health data:', data);
      setHealthData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health data';
      console.error('Error fetching health data:', {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(errorMessage);
      throw error; // Re-throw to be caught by handleConnect
    }
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    subtitle?: string
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-purple-500 text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg">Connecting to Google Fit...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isConnected) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-3xl font-bold mb-6">Connect to Google Fit</h1>
            <p className="text-gray-400 mb-8">
              Connect your Google Fit account to sync your health and fitness data
            </p>
            <button
              onClick={handleConnect}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Connect Google Fit
            </button>
            {error && (
              <p className="text-red-500 mt-4">{error}</p>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Health Overview</h1>
            <button
              onClick={fetchAndUpdateHealthData}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
            >
              Refresh Data
            </button>
          </div>

          {error ? (
            <div className="text-red-500 bg-red-500/10 p-4 rounded-lg mb-6">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthData && (
                <>
                  {renderMetricCard(
                    <FiActivity />,
                    'Daily Steps',
                    healthData.steps.toLocaleString(),
                    'Steps today'
                  )}
                  {renderMetricCard(
                    <FiHeart />,
                    'Heart Rate',
                    `${Math.round(healthData.heartRate.average)} BPM`,
                    `Range: ${Math.round(healthData.heartRate.min)} - ${Math.round(healthData.heartRate.max)} BPM`
                  )}
                  {renderMetricCard(
                    <FiMoon />,
                    'Sleep',
                    `${Math.round(healthData.sleep.duration)} hrs`,
                    healthData.sleep.quality
                  )}
                  {renderMetricCard(
                    <FiTrendingUp />,
                    'BMI',
                    healthData.bmi.toFixed(1),
                    `Weight: ${healthData.weight}kg`
                  )}
                </>
              )}
            </div>
          )}

          {healthData?.activities && healthData.activities.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Recent Activities</h2>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthData.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <h3 className="font-semibold mb-2">{activity.type}</h3>
                      <p className="text-gray-400">Duration: {activity.duration} mins</p>
                      <p className="text-gray-400">Calories: {activity.calories}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
