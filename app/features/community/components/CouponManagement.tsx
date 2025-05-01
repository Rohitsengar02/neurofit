'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiCopy, FiCheck, FiX, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import * as couponService from '../services/couponService';
import { Coupon } from '../utils/types';

interface CouponManagementProps {
  communityId: string;
}

const CouponManagement: React.FC<CouponManagementProps> = ({ communityId }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const couponData = await couponService.getCouponsByCommunityId(communityId);
        setCoupons(couponData);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoupons();
  }, [communityId]);
  
  // Handle copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };
  
  // Handle delete coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(couponId);
        setCoupons(coupons.filter(coupon => coupon.id !== couponId));
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };
  
  // Handle edit coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowCreateModal(true);
  };
  
  // Handle deactivate coupon
  const handleDeactivateCoupon = async (couponId: string) => {
    try {
      await couponService.deactivateCoupon(couponId);
      setCoupons(coupons.map(coupon => 
        coupon.id === couponId ? { ...coupon, isActive: false } : coupon
      ));
    } catch (error) {
      console.error('Error deactivating coupon:', error);
    }
  };
  
  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No expiration';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Discount Coupons
        </h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          onClick={() => {
            setEditingCoupon(null);
            setShowCreateModal(true);
          }}
        >
          <FiPlus className="mr-2" />
          Create Coupon
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-10">
          <FiAlertCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Coupons Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create discount coupons to attract more members to your community.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => {
              setEditingCoupon(null);
              setShowCreateModal(true);
            }}
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {coupon.code}
                      </span>
                      <button
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code ? <FiCheck className="text-green-500" /> : <FiCopy />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {coupon.discountPercentage}% off
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">
                      {coupon.usedCount} / {coupon.maxUses > 0 ? coupon.maxUses : '∞'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiCalendar className="mr-1" />
                      <span>{formatDate(coupon.expiresAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                      onClick={() => handleEditCoupon(coupon)}
                    >
                      <FiEdit />
                    </button>
                    {coupon.isActive && (
                      <button
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 mr-3"
                        onClick={() => handleDeactivateCoupon(coupon.id)}
                      >
                        <FiX />
                      </button>
                    )}
                    <button
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showCreateModal && (
        <CouponFormModal 
          communityId={communityId}
          coupon={editingCoupon}
          onClose={() => setShowCreateModal(false)}
          onSave={(newCoupon) => {
            if (editingCoupon) {
              // Update existing coupon in the list
              setCoupons(coupons.map(c => c.id === newCoupon.id ? newCoupon : c));
            } else {
              // Add new coupon to the list
              setCoupons([...coupons, newCoupon]);
            }
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

interface CouponFormModalProps {
  communityId: string;
  coupon: Coupon | null;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({ communityId, coupon, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discountPercentage: coupon?.discountPercentage.toString() || '10',
    maxUses: coupon?.maxUses.toString() || '0',
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt.seconds * 1000).toISOString().split('T')[0] : ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Generate random code
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setFormData({
      ...formData,
      code: result
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }
    
    const discountPercentage = parseInt(formData.discountPercentage);
    if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
      newErrors.discountPercentage = 'Discount must be between 1 and 100';
    }
    
    const maxUses = parseInt(formData.maxUses);
    if (isNaN(maxUses) || maxUses < 0) {
      newErrors.maxUses = 'Max uses must be 0 or more (0 for unlimited)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discountPercentage: parseInt(formData.discountPercentage),
        maxUses: parseInt(formData.maxUses),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
      };
      
      let savedCoupon;
      
      if (coupon) {
        // Update existing coupon
        await couponService.updateCoupon(coupon.id, couponData);
        savedCoupon = {
          ...coupon,
          ...couponData,
          expiresAt: couponData.expiresAt ? { seconds: couponData.expiresAt.getTime() / 1000 } : null
        };
      } else {
        // Create new coupon
        savedCoupon = await couponService.createCoupon(communityId, {
          code: couponData.code,
          discountPercentage: couponData.discountPercentage,
          maxUses: couponData.maxUses,
          communityId: communityId,
          expiresAt: couponData.expiresAt ? { seconds: couponData.expiresAt.getTime() / 1000 } : null
        });
      }
      
      onSave(savedCoupon as Coupon);
    } catch (error) {
      console.error('Error saving coupon:', error);
      setErrors({
        submit: 'Failed to save coupon. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {coupon ? 'Edit Coupon' : 'Create Coupon'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Coupon Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coupon Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`flex-grow px-4 py-2 rounded-l-lg border ${
                    errors.code 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase`}
                  placeholder="e.g., SUMMER25"
                  maxLength={15}
                />
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={generateRandomCode}
                >
                  Generate
                </button>
              </div>
              {errors.code && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {errors.code}
                </p>
              )}
            </div>
            
            {/* Discount Percentage */}
            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.discountPercentage 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="10"
                  min="1"
                  max="100"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {errors.discountPercentage && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {errors.discountPercentage}
                </p>
              )}
            </div>
            
            {/* Max Uses */}
            <div>
              <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Uses (0 for unlimited)
              </label>
              <input
                type="number"
                id="maxUses"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.maxUses 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0"
                min="0"
              />
              {errors.maxUses && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {errors.maxUses}
                </p>
              )}
            </div>
            
            {/* Expiration Date */}
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date (optional)
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
                {errors.submit}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CouponManagement;
