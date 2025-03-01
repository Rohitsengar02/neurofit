'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/app/firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { FiHome, FiBriefcase, FiMapPin, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const AddressPage = () => {
  const [user] = useAuthState(auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    type: 'home',
    name: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    const addressesRef = collection(db, `users/${user.uid}/addresses`);
    const snapshot = await getDocs(addressesRef);
    const addressList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Address[];
    setAddresses(addressList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      await addDoc(addressesRef, formData);
      toast.success('Address added successfully!');
      setIsFormOpen(false);
      setFormData({
        type: 'home',
        name: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/addresses/${addressId}`));
      toast.success('Address deleted successfully!');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return;
    try {
      // First, remove default from all addresses
      const promises = addresses.map(addr => {
        if (addr.isDefault) {
          return updateDoc(doc(db, `users/${user.uid}/addresses/${addr.id}`), {
            isDefault: false
          });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);

      // Set the new default address
      await updateDoc(doc(db, `users/${user.uid}/addresses/${addressId}`), {
        isDefault: true
      });
      toast.success('Default address updated!');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-4 sm:px-6 lg:px-8 mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Add Address Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FiMapPin className="w-5 h-5" />
          <span>{isFormOpen ? 'Cancel' : 'Add New Address'}</span>
        </motion.button>

        {/* Address Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 space-y-4"
            >
              {/* Address Type Selection */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['home', 'office', 'other'].map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, type: type as 'home' | 'office' | 'other' })}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      formData.type === type
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } transition-all duration-200`}
                  >
                    {type === 'home' && <FiHome className="w-5 h-5 mr-2" />}
                    {type === 'office' && <FiBriefcase className="w-5 h-5 mr-2" />}
                    {type === 'other' && <FiMapPin className="w-5 h-5 mr-2" />}
                    <span className="capitalize">{type}</span>
                  </motion.button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />

              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                  pattern="[0-9]{6}"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                  Set as default address
                </label>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 px-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Address
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Address List */}
        <div className="space-y-4 mb-20">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {address.type === 'home' && <FiHome className="w-5 h-5 text-purple-600" />}
                  {address.type === 'office' && <FiBriefcase className="w-5 h-5 text-purple-600" />}
                  {address.type === 'other' && <FiMapPin className="w-5 h-5 text-purple-600" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {address.type} Address
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{address.name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDefaultAddress(address.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                    >
                      <FiCheck className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <div className="mt-4 text-gray-600 dark:text-gray-300">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="mt-2">Phone: {address.phoneNumber}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
