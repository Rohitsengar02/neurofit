import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ChartBarIcon, 
  HeartIcon, 
  CpuChipIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ChartBarIcon,
    title: 'Progress Tracking',
    description: 'Track your fitness journey with detailed analytics and insights.'
  },
  {
    icon: HeartIcon,
    title: 'Health Monitoring',
    description: 'Monitor your vital signs and overall health metrics in real-time.'
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Plans',
    description: 'Get personalized workout and nutrition plans powered by AI.'
  },
  {
    icon: SparklesIcon,
    title: 'Smart Recovery',
    description: 'Optimize your rest and recovery with intelligent recommendations.'
  }
];

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const featureElements = featuresRef.current?.querySelectorAll('.feature-card');
    
    featureElements?.forEach((feature, index) => {
      gsap.from(feature, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: feature,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.2
      });
    });
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Transform with Technology
        </motion.h2>

        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-gray-800 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300"
            >
              <feature.icon className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
