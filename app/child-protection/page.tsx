import React from 'react';
import Link from 'next/link';

export default function ChildProtection() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 dark:text-gray-200">
      <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block font-semibold">
        ← Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Child Protection Policy
      </h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">1. Age Requirement</h2>
          <p>
            NeuroFit is intended for users who are at least 13 years of age. 
            We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">2. Parental Consent</h2>
          <p>
            If you are between the ages of 13 and 18, you should use NeuroFit only with the involvement 
            of a parent or guardian who agrees to be bound by our terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">3. Safe Environment</h2>
          <p>
            We strive to maintain a safe and positive community for all users. 
            Any content or behavior that endangers minors is strictly prohibited and will result in immediate account termination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">4. Data Deletion</h2>
          <p>
            If we become aware that we have collected information from a child under 13 without verification of parental consent, 
            we will take steps to remove that information from our servers.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500">Last updated: March 13, 2026</p>
        </section>
      </div>
    </div>
  );
}
