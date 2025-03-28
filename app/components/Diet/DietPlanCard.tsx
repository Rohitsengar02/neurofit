import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaFire, FaUsers } from 'react-icons/fa';

interface DietPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  targetGroup: string[];
  calories: {
    min: number;
    max: number;
  };
  image: string;
}

interface Props {
  plan: DietPlan;
  categoryId: string;
}

const DietPlanCard: React.FC<Props> = ({ plan, categoryId }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl 
                 transition-all duration-300"
    >
      <Link href={`/diet/${categoryId}/plan/${plan.id}`}>
        <div className="relative h-48">
          <Image
            src={plan.image}
            alt={plan.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${plan.difficulty === 'beginner' ? 'bg-green-500 text-white' : ''}
              ${plan.difficulty === 'intermediate' ? 'bg-yellow-500 text-white' : ''}
              ${plan.difficulty === 'advanced' ? 'bg-red-500 text-white' : ''}
            `}>
              {plan.difficulty}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {plan.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FaClock className="w-4 h-4" />
              <span>{plan.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaFire className="w-4 h-4" />
              <span>{plan.calories.min}-{plan.calories.max} cal</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {plan.targetGroup.map((target, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 
                         bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
              >
                <FaUsers className="w-3 h-3" />
                {target}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DietPlanCard;
