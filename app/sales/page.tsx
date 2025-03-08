'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PlanDetails {
  price: number;
  features: string[];
}

type PricingPlans = {
  'Basic Plan': PlanDetails;
  'Pro Plan': PlanDetails;
  'Premium Plan': PlanDetails;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '/images/payment/phonepe.png',
    description: 'Pay securely using PhonePe UPI'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '/images/payment/paytm.png',
    description: 'Quick payment via Paytm wallet or UPI'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: '/images/payment/googlepay.png',
    description: 'Fast and secure payment with Google Pay'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '/images/payment/paypal.png',
    description: 'International payments via PayPal'
  }
];

const pricingPlans: PricingPlans = {
  'Basic Plan': {
    price: 499,
    features: ['Access to basic features', 'Community support', 'Email support']
  },
  'Pro Plan': {
    price: 799,
    features: ['All Basic Plan features', 'Advanced analytics', 'Priority support']
  },
  'Premium Plan': {
    price: 999,
    features: ['All Pro Plan features', 'Personalized training', '24/7 support']
  }
};

type PlanType = keyof typeof pricingPlans;

const SalesPage = () => {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | ''>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const plan = searchParams.get('plan') as PlanType | null;
    if (plan && plan in pricingPlans) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handlePayment = async (paymentMethod: string) => {
    setLoading(true);
    setSelectedPayment(paymentMethod);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would integrate with actual payment gateways
      console.log(`Processing payment for ${selectedPlan} using ${paymentMethod}`);
      
      // Show success message
      alert('Payment successful! Welcome to NeuroFit!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan || !(selectedPlan in pricingPlans)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Plan Selected</h1>
          <a href="/#pricing" className="text-purple-500 hover:text-purple-400">
            Return to Pricing Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Order Summary */}
          <div className="bg-gray-800 rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Complete Your Order</h1>
            <div className="border-b border-gray-700 pb-6 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Selected Plan:</span>
                <span className="text-white font-semibold">{selectedPlan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Amount:</span>
                <span className="text-2xl font-bold text-purple-500">
                  ₹{pricingPlans[selectedPlan].price}
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Plan Features</h3>
              <ul className="text-gray-300 space-y-2">
                {pricingPlans[selectedPlan].features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Select Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedPayment === method.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-500'
                  }`}
                  onClick={() => handlePayment(method.id)}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                      {/* Replace with actual icons */}
                      <span className="text-white">{method.name[0]}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">{method.name}</h3>
                      <p className="text-gray-400 text-sm">{method.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white">Processing your payment...</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SalesPage;
