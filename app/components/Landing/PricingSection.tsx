'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  popular: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic Plan',
    price: 499,
    features: ['Access to basic features', 'Community support', 'Email support'],
    popular: false,
  },
  {
    name: 'Pro Plan',
    price: 799,
    features: ['All Basic Plan features', 'Advanced analytics', 'Priority support'],
    popular: true,
  },
  {
    name: 'Premium Plan',
    price: 999,
    features: ['All Pro Plan features', 'Personalized training', '24/7 support'],
    popular: false,
  },
];

const PricingSection: React.FC = () => {
  const router = useRouter();

  const handlePlanSelect = (planName: string): void => {
    router.push(`/sales?plan=${encodeURIComponent(planName)}`);
  };

  return (
    <section className="py-20 bg-gray-900" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-400">Select the best plan that suits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`bg-gray-800 rounded-xl p-8 shadow-lg transform transition-transform duration-300 hover:scale-105 ${plan.popular ? 'border-4 border-purple-500' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-semibold text-white mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold text-purple-500 mb-4">₹{plan.price}</p>
              <ul className="text-gray-300 mb-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
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
              <button
                onClick={() => handlePlanSelect(plan.name)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                Select Plan
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">Secure Payment Methods</h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-gray-300">PhonePe</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-gray-300">Paytm</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-gray-300">Google Pay</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-gray-300">PayPal</span>
            </div>
          </div>
          <p className="text-gray-400 mt-4">All transactions are secure and encrypted</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
