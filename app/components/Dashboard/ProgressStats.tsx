import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface ProgressStatsProps {
  title: string;
  value: number;
  unit: string;
  change: string;
  timeframe: string;
}

export default function ProgressStats({
  title,
  value,
  unit,
  change,
  timeframe,
}: ProgressStatsProps) {
  const isPositive = change.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div
          className={`flex items-center px-2 py-1 rounded-lg text-sm
            ${isPositive ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          {change}
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-gray-400">{unit}</span>
      </div>

      <p className="text-sm text-gray-500 mt-2">{timeframe}</p>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-purple-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}
