import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CalendarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export default function NextWorkout() {
  const workoutPlan = [
    { name: 'Warm-up', duration: '10 mins', completed: true },
    { name: 'Strength Training', duration: '30 mins', completed: false },
    { name: 'Cardio', duration: '20 mins', completed: false },
    { name: 'Cool-down', duration: '10 mins', completed: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Next Workout</h2>
        <span className="text-purple-400 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          70 mins
        </span>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <CalendarIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-gray-400">Today</p>
          <p className="text-lg font-semibold">Upper Body Focus</p>
        </div>
      </div>

      <div className="space-y-4">
        {workoutPlan.map((exercise, index) => (
          <motion.div
            key={exercise.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-700/50"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${exercise.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-600/50 text-gray-400'
                  }`}
              >
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <span className={exercise.completed ? 'text-gray-400' : 'text-white'}>
                {exercise.name}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {exercise.duration}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl
                 font-semibold transition-colors duration-200"
      >
        Start Workout
      </motion.button>
    </motion.div>
  );
}
