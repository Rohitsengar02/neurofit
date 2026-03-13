import React from 'react';
import Link from 'next/link';

export default function ReturnRefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 dark:text-gray-200">
      <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block font-semibold">
        ← Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Return and Refund Policy
      </h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">1. Subscription Services</h2>
          <p>
            NeuroFit offers premium subscription plans. You may cancel your subscription at any time. 
            However, we do not provide refunds for partial subscription periods or unused features.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">2. Refund Eligibility</h2>
          <p>
            Refunds are generally only issued in the following circumstances:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Technical issues that prevent access to services for an extended period</li>
            <li>Accidental duplicate billing</li>
            <li>Legal requirements in your specific jurisdiction</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">3. Physical Products</h2>
          <p>
            If you purchased physical merchandise through our store, items must be returned within 30 days 
            in their original condition for a full refund, excluding shipping costs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">4. Processing Time</h2>
          <p>
            Once a refund is approved, it may take 5-10 business days to appear on your original payment method.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500">Last updated: March 13, 2026</p>
        </section>
      </div>
    </div>
  );
}
