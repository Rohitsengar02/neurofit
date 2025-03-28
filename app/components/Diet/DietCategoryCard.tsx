import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DietCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  tags: string[];
}

interface Props {
  category: DietCategory;
}

const DietCategoryCard: React.FC<Props> = ({ category }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl 
                 transition-all duration-300 h-full"
    >
      <Link href={`/diet/${category.id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              {category.type}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {category.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {category.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 
                         text-gray-600 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DietCategoryCard;
