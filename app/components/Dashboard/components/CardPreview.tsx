'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface CardPreviewProps {
  title: string;
  icon: IconType;
  color: string;
  onClick: () => void;
  stats: {
    label: string;
    value: string | number;
  }[];
}

const CardPreview: React.FC<CardPreviewProps> = ({ title, icon: Icon, color, onClick, stats }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${color} rounded-2xl p-4 cursor-pointer shadow-lg`}
      onClick={onClick}
    >
      <div className="text-white">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="text-sm opacity-80">{stat.label}</div>
              <div className="font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CardPreview;
