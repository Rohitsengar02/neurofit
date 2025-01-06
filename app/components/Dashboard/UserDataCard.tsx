'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FaUser, FaDumbbell, FaWeight, FaCalendarAlt, FaClock, FaHeartbeat } from 'react-icons/fa';

interface UserDataCardProps {
  title: string;
  icon: IconType;
  data: Record<string, any>;
  color: string;
}

export default function UserDataCard({ title, icon: Icon, data, color }: UserDataCardProps) {
  const renderValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${renderValue(val)}`)
        .join(', ');
    }
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg shadow-lg ${color} text-white`}
    >
      <div className="flex items-center mb-4">
        <Icon className="text-2xl mr-3" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm opacity-80 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="font-medium">{renderValue(value)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
