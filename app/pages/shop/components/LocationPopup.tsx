'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { address: string; city: string }) => void;
}

const cities = [
  { city: "Mumbai", state: "Maharashtra", address: "Mumbai, Maharashtra, India", image: "https://maps.googleapis.com/maps/api/staticmap?center=Mumbai,India&zoom=11&size=400x400&key=YOUR_API_KEY" },
  { city: "Delhi", state: "Delhi", address: "Delhi, India", image: "https://maps.googleapis.com/maps/api/staticmap?center=Delhi,India&zoom=11&size=400x400&key=YOUR_API_KEY" },
  { city: "Bangalore", state: "Karnataka", address: "Bangalore, Karnataka, India", image: "https://maps.googleapis.com/maps/api/staticmap?center=Bangalore,India&zoom=11&size=400x400&key=YOUR_API_KEY" },
  { city: "Hyderabad", state: "Telangana", address: "Hyderabad, Telangana, India", image: "https://maps.googleapis.com/maps/api/staticmap?center=Hyderabad,India&zoom=11&size=400x400&key=YOUR_API_KEY" },
  { city: "Chennai", state: "Tamil Nadu", address: "Chennai, Tamil Nadu, India", image: "https://maps.googleapis.com/maps/api/staticmap?center=Chennai,India&zoom=11&size=400x400&key=YOUR_API_KEY" }
];

const LocationPopup: React.FC<LocationPopupProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(cities);
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  // Update search results when query changes
  useEffect(() => {
    const filtered = cities.filter(city => 
      city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleSelectLocation = (city: typeof cities[0]) => {
    setSelectedCity(city);
  };

  const handleConfirm = () => {
    onSelectLocation({
      address: selectedCity.address,
      city: selectedCity.city
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select Location</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for your city..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brown-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row h-[400px]">
              {/* City List */}
              <div className="w-full md:w-1/2 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  {searchResults.map((city, index) => (
                    <motion.button
                      key={index}
                      className={`w-full p-3 flex items-center space-x-3 rounded-lg transition-colors ${
                        selectedCity.city === city.city 
                          ? 'bg-brown-50 dark:bg-brown-900/20 border border-brown-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSelectLocation(city)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FaMapMarkerAlt className={`${
                        selectedCity.city === city.city 
                          ? 'text-brown-500' 
                          : 'text-gray-400'
                      }`} />
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {city.city}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {city.state}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Map View */}
              <div className="w-full md:w-1/2 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="relative h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* Static Map Representation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-brown-100 dark:bg-brown-900/30 flex items-center justify-center mb-4">
                      <FaMapMarkerAlt className="text-3xl text-brown-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {selectedCity.city}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedCity.state}, India
                    </p>
                    <div className="mt-4 px-4 py-2 bg-brown-50 dark:bg-brown-900/20 rounded-lg">
                      <p className="text-sm text-brown-600 dark:text-brown-400">
                        Selected for delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-brown-500 hover:bg-brown-600 text-white rounded-lg transition-colors font-medium"
              >
                Confirm Location
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPopup;
