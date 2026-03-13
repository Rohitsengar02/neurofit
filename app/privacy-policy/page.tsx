import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 dark:text-gray-200">
      <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block font-semibold">
        ← Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Privacy Policy
      </h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">1. Introduction</h2>
          <p>
            Welcome to NeuroFit. We are committed to protecting your personal data and your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">2. Data We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, 
            update your profile, or use our fitness tracking features. This may include:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Name and contact information</li>
            <li>Biometric data (height, weight, age)</li>
            <li>Fitness activity data (steps, heart rate, workouts)</li>
            <li>Device information and usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">3. How We Use Your Data</h2>
          <p>
            Your data is used to provide personalized workout recommendations, track your progress over time, 
            and improve our AI-powered features. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. 
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time 
            through your account settings. If you have any questions, please contact our support team.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500">Last updated: March 13, 2026</p>
        </section>
      </div>
    </div>
  );
}
