'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function WorkoutPlan() {
  const workouts = [
    {
      name: "Full Body Workout",
      duration: "45 min",
      exercises: [
        { name: "Push-ups", sets: 3, reps: 12 },
        { name: "Squats", sets: 3, reps: 15 },
        { name: "Plank", sets: 3, duration: "30 sec" }
      ]
    }
  ];

  return (
    <div>
      {workouts.map((workout, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-700 rounded-xl p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{workout.name}</h3>
            <span className="text-sm text-gray-400">{workout.duration}</span>
          </div>
          
          <div className="space-y-3">
            {workout.exercises.map((exercise, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                <span>{exercise.name}</span>
                <span className="text-gray-400">
                  {exercise.reps 
                    ? `${exercise.sets} × ${exercise.reps}`
                    : `${exercise.sets} × ${exercise.duration}`
                  }
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
