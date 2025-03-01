'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { FaWalking, FaMapMarkerAlt, FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';

// Dynamically import Map component with no SSR
const DynamicMap = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>
  ),
});

interface Location {
  lat: number;
  lng: number;
}

interface StepData {
  count: number;
  distance: number;
  calories: number;
  time: number;
}

const STEP_LENGTH = 0.7; // Average step length in meters
const CALORIES_PER_STEP = 0.04; // Average calories burned per step
const MOVEMENT_THRESHOLD = 0.5; // Threshold for movement detection

export default function StepsPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [path, setPath] = useState<Location[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [stepData, setStepData] = useState<StepData>({
    count: 0,
    distance: 0,
    calories: 0,
    time: 0,
  });

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocation = useRef<Location | null>(null);

  // Animated number display
  const animatedProps = useSpring({
    from: { count: 0 },
    to: { count: stepData.count },
    config: { duration: 1000 },
  });

  const calculateDistance = (steps: number): number => {
    return (steps * STEP_LENGTH) / 1000; // Convert to kilometers
  };

  const calculateCalories = (steps: number): number => {
    return steps * CALORIES_PER_STEP;
  };

  const calculateMovement = (loc1: Location, loc2: Location): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTracking = useCallback(async () => {
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Calculate movement and update steps if necessary
        if (lastLocation.current) {
          const movement = calculateMovement(lastLocation.current, newLocation);
          if (movement > MOVEMENT_THRESHOLD) {
            setStepData(prev => {
              const newSteps = prev.count + Math.floor(movement / STEP_LENGTH);
              return {
                count: newSteps,
                distance: calculateDistance(newSteps),
                calories: calculateCalories(newSteps),
                time: prev.time
              };
            });
          }
        }

        lastLocation.current = newLocation;
        setLocation(newLocation);
        setPath((prev) => [...prev, newLocation]);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Start timer
    timerRef.current = setInterval(() => {
      setStepData((prev) => ({ ...prev, time: prev.time + 1 }));
    }, 1000);

    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    lastLocation.current = null;
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 text-white" style={{ top: '60px', bottom: '70px' }}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <FaWalking className="text-2xl text-blue-400" />
            <span className="text-sm text-gray-400">Steps</span>
          </div>
          <animated.h3 className="text-2xl font-bold">
            {animatedProps.count.to((val) => Math.floor(val))}
          </animated.h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <FaMapMarkerAlt className="text-2xl text-green-400" />
            <span className="text-sm text-gray-400">Distance</span>
          </div>
          <h3 className="text-2xl font-bold">
            {stepData.distance.toFixed(2)} km
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <FaFlag className="text-2xl text-red-400" />
            <span className="text-sm text-gray-400">Calories</span>
          </div>
          <h3 className="text-2xl font-bold">
            {stepData.calories.toFixed(1)} kcal
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Player
              autoplay
              loop
              src="/animations/timer.json"
              style={{ width: '24px', height: '24px' }}
            />
            <span className="text-sm text-gray-400">Time</span>
          </div>
          <h3 className="text-2xl font-bold">{formatTime(stepData.time)}</h3>
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="relative mx-3" style={{ height: '45vh' }}>
        <div className="absolute inset-0 rounded-xl overflow-hidden border border-gray-700">
          <DynamicMap location={location} path={path} />
        </div>
      </div>

      {/* Control Button */}
      <div className="p-3 mt-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={isTracking ? 'stop' : 'start'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isTracking ? stopTracking : startTracking}
              className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isTracking ? (
                <>
                  <FaStop className="mr-2" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  Start Tracking
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
