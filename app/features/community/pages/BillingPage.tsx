'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiCreditCard, FiLock, FiArrowLeft, FiCheck, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import * as subscriptionService from '../services/subscriptionService';
import * as couponService from '../services/couponService';

interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const BillingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentCommunity, currentCommunityTiers } = useCommunity();
  
  // Get communityId and tierId from URL params
  const communityId = searchParams.get('communityId');
  const tierId = searchParams.get('tierId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !communityId || !user) return;
    
    try {
      const couponResult = await couponService.validateCoupon(communityId, user.uid, couponCode);
      
      if (couponResult && couponResult.valid && couponResult.coupon) {
        setAppliedCoupon({
          code: couponCode,
          discountPercentage: couponResult.coupon.discountPercentage,
        });
        setCouponError('');
      } else {
        setCouponError('Invalid or expired coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
      setAppliedCoupon(null);
    }
  };

  // Process payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !communityId || !selectedTier) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, you would process payment with a payment gateway
      // Here we're simulating payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create membership after successful payment
      await subscriptionService.createMembership(
        user.uid,
        communityId,
        selectedTier.id,
        1, // 1 month duration
        appliedCoupon?.code
      );
      
      setPaymentComplete(true);
      
      // Redirect after successful payment
      setTimeout(() => {
        router.push(`/community/${communityId}`);
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load selected tier data
  useEffect(() => {
    if (!communityId || !tierId || !currentCommunityTiers) {
      router.push('/community');
      return;
    }
    
    const tier = currentCommunityTiers.find(t => t.id === tierId);
    
    if (!tier) {
      router.push(`/community/${communityId}`);
      return;
    }
    
    setSelectedTier(tier);
    setIsLoading(false);
  }, [communityId, tierId, currentCommunityTiers, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate amounts
  const planPrice = selectedTier?.price || 0;
  const discountAmount = appliedCoupon 
    ? (planPrice * (appliedCoupon.discountPercentage / 100)) 
    : 0;
  const subtotal = planPrice;
  const total = planPrice - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          
          <div className="flex items-center">
            <FiLock className="text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Secure Checkout</span>
          </div>
        </div>
        
        {paymentComplete ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-green-600 dark:text-green-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for joining {currentCommunity?.name}. You now have full access to all community features.
            </p>
            <button
              onClick={() => router.push(`/community/${communityId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Community
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Payment Information
                </h2>
                
                {/* Payment Method Tabs */}
                <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
                  <button
                    className={`px-4 py-3 font-medium text-sm border-b-2 ${paymentMethod === 'card' 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    Credit/Debit Card
                  </button>
                  <button
                    className={`px-4 py-3 font-medium text-sm border-b-2 ${paymentMethod === 'upi' 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    UPI Payment
                  </button>
                </div>
                
                {paymentMethod === 'card' ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                          className="w-full py-3 px-4 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <FiCreditCard className="text-gray-400 absolute left-4 top-3.5" />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardHolder"
                        value={formData.cardHolder}
                        onChange={handleInputChange}
                        placeholder="John Smith"
                        required
                        className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          required
                          className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-6">
                      <input
                        type="checkbox"
                        id="saveCard"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Save card for future payments
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>Complete Payment</>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-4">
                    <div className="flex justify-center mb-6">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                        <div className="mb-4">
                          <Image 
                            src="/upi-qr-placeholder.png" 
                            alt="UPI QR Code"
                            width={200}
                            height={200}
                            className="mx-auto"
                          />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Scan the QR code with your UPI app</p>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">neurofit@ybl</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        UPI Transaction ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter UPI transaction ID"
                        className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? 'Verifying...' : 'Verify Payment'}
                    </button>
                  </div>
                )}
                
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <FiLock className="mr-2" />
                  <span>Your payment information is encrypted and secure.</span>
                </div>
              </motion.div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedTier?.name}</span>
                    <span className="text-gray-900 dark:text-white">${selectedTier?.price}/mo</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTier?.description}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {selectedTier?.features.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex text-sm">
                        <FiCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FiCheck className="text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                          {appliedCoupon.code} ({appliedCoupon.discountPercentage}% off)
                        </span>
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-grow py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-r-lg transition-colors text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{couponError}</p>
                  )}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount ({appliedCoupon.discountPercentage}%)</span>
                      <span className="text-green-600 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <span className="font-medium text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}/mo</span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  By completing your purchase, you agree to the <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a> and authorize us to charge your payment method on a recurring monthly basis. You can cancel anytime.
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
