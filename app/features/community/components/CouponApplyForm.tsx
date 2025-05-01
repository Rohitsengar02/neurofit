'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import * as couponService from '../services/couponService';

interface CouponApplyFormProps {
  communityId: string;
  userId: string;
  onApplyCoupon: (discountPercentage: number, couponCode: string) => void;
}

const CouponApplyForm: React.FC<CouponApplyFormProps> = ({ communityId, userId, onApplyCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    discountPercentage?: number;
  } | null>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value.toUpperCase());
    // Reset validation when input changes
    setValidationResult(null);
  };
  
  // Handle validate coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await couponService.validateCoupon(couponCode, communityId, userId);
      
      if (result.valid && result.coupon) {
        setValidationResult({
          valid: true,
          message: `${result.coupon.discountPercentage}% discount applied!`,
          discountPercentage: result.coupon.discountPercentage
        });
        
        // Notify parent component
        onApplyCoupon(result.coupon.discountPercentage, result.coupon.code);
      } else {
        setValidationResult({
          valid: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setValidationResult({
        valid: false,
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Handle key press (Enter)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidateCoupon();
    }
  };
  
  // Clear coupon
  const handleClearCoupon = () => {
    setCouponCode('');
    setValidationResult(null);
    onApplyCoupon(0, '');
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center mb-2">
        <FiTag className="text-gray-500 dark:text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Have a discount coupon?
        </span>
      </div>
      
      <div className="flex">
        <div className="relative flex-grow">
          <input
            type="text"
            value={couponCode}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            className={`w-full px-4 py-2 rounded-l-lg border ${
              validationResult 
                ? validationResult.valid 
                  ? 'border-green-300 dark:border-green-700 focus:ring-green-500' 
                  : 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 uppercase`}
            disabled={isValidating || (validationResult?.valid || false)}
          />
          
          {validationResult?.valid && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <FiCheck className="text-green-500" />
            </div>
          )}
        </div>
        
        {validationResult?.valid ? (
          <button
            type="button"
            onClick={handleClearCoupon}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiX />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleValidateCoupon}
            disabled={!couponCode.trim() || isValidating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? <FiLoader className="animate-spin" /> : 'Apply'}
          </button>
        )}
      </div>
      
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${
            validationResult.valid 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {validationResult.message}
        </motion.div>
      )}
    </div>
  );
};

export default CouponApplyForm;
