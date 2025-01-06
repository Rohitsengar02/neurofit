import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChartBarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

interface WorkoutOverviewProps {
  userData: any;
}

export default function WorkoutOverview({ userData }: WorkoutOverviewProps) {
  const stats = [
    {
      name: 'Weekly Target',
      value: userData?.frequency?.split('-')[1] || '3',
      icon: CalendarIcon,
      color: 'text-blue-400',
    },
    {
      name: 'Current Level',
      value: userData?.experience || 'Beginner',
      icon: ChartBarIcon,
      color: 'text-green-400',
    },
    {
      name: 'Main Goal',
      value: userData?.goal || 'General Fitness',
      icon: FireIcon,
      color: 'text-orange-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6">Workout Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-lg bg-gray-800 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">{stat.name}</p>
              <p className="text-lg font-semibold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-300">
              Personalized Tip
            </h3>
            <p className="text-gray-400 mt-1">
              Based on your {userData?.experience} level, try to maintain
              {' '}{userData?.frequency} workouts per week for optimal results.
            </p>
          </div>
          <FireIcon className="w-8 h-8 text-purple-400" />
        </div>
      </div>
    </motion.div>
  );
}
