import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';

interface DailyRoutineProps {
  onNext: (data: { wakeTime: string; sleepTime: string; mealsPerDay: number; workHours: number }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function DailyRoutine({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: DailyRoutineProps) {
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [workHours, setWorkHours] = useState(8);

  const handleSubmit = () => {
    onNext({
      wakeTime,
      sleepTime,
      mealsPerDay,
      workHours,
    });
  };

  return (
    <StepLayout
      title="Daily Routine"
      subtitle="Tell us about your daily schedule to help optimize your workout plan"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={handleSubmit}
      nextButtonText="Continue"
    >
      <div className="space-y-8 pb-4">
        {/* Wake & Sleep Time */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-center font-medium">Wake Time</label>
            <select
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800/30 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-center font-medium">Sleep Time</label>
            <select
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800/30 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meals Per Day */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            How many meals do you have per day?
          </h3>
          <div className="flex justify-center gap-3">
            {[2, 3, 4, 5, 6].map((num) => (
              <motion.button
                key={num}
                onClick={() => setMealsPerDay(num)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  mealsPerDay === num
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Work Hours */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            How many hours do you work/study per day?
          </h3>
          <div className="relative w-full h-12 bg-gray-800/30 rounded-xl px-4">
            <input
              type="range"
              min="0"
              max="16"
              value={workHours}
              onChange={(e) => setWorkHours(Number(e.target.value))}
              className="w-full h-full appearance-none bg-transparent cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${
                  (workHours / 16) * 100
                }%, #1f2937 ${(workHours / 16) * 100}%, #1f2937 100%)`,
              }}
            />
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-sm">
              <span>0h</span>
              <span className="text-purple-500 font-bold">{workHours}h</span>
              <span>16h</span>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
