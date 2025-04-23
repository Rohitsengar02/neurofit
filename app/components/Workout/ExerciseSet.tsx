'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaEdit, FaSave } from 'react-icons/fa';

interface Set {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

interface ExerciseSetProps {
  set?: Set;
  index?: number;
  setNumber?: number;
  reps?: number;
  weight?: number;
  isCompleted?: boolean;
  restTime?: number;
  onUpdateSet: (updates: { reps?: number; weight?: number; isCompleted?: boolean }) => void;
  onComplete: () => void;
  onRemove: () => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({
  set,
  index,
  setNumber,
  reps: propReps,
  weight: propWeight,
  isCompleted: propIsCompleted,
  restTime,
  onComplete,
  onUpdateSet,
  onRemove,
}) => {
  // Use either the direct props or the values from the set object
  const initialReps = propReps ?? set?.reps ?? 10;
  const initialWeight = propWeight ?? set?.weight ?? 0;
  const initialIsCompleted = propIsCompleted ?? set?.isCompleted ?? false;
  
  const [isEditing, setIsEditing] = useState(false);
  const [reps, setReps] = useState(initialReps);
  const [weight, setWeight] = useState(initialWeight);

  const handleComplete = () => {
    onComplete();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateSet({ reps, weight });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setReps(initialReps);
    setWeight(initialWeight);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
      className={`flex items-center p-3 rounded-lg mb-2 ${
        initialIsCompleted
          ? 'bg-green-100 dark:bg-green-900/20'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}
    >
      <div className="mr-3 font-medium text-gray-500 dark:text-gray-400 w-8">
        #{setNumber ?? (index !== undefined ? index + 1 : 1)}
      </div>

      {isEditing ? (
        <>
          <div className="flex-1 flex items-center space-x-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-16 p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                min="1"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-16 p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FaSave />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <FaTimes />
            </button>
            <button
              onClick={onRemove}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaTimes className="text-red-500" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="font-medium">
              {initialReps} reps × {initialWeight} kg
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleComplete}
              className={`p-2 rounded-full ${
                initialIsCompleted
                  ? 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {initialIsCompleted ? <FaCheck /> : <FaCheck className="opacity-50" />}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ExerciseSet;
