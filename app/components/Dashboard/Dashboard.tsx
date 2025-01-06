'use client';

import { motion } from 'framer-motion';
import { UserData } from '@/app/utils/userService';
import { FaUser, FaDumbbell, FaWeight, FaRunning, FaClock, FaCalendar, FaHeart, FaRuler } from 'react-icons/fa';
import { IoMdFitness } from 'react-icons/io';
import { MdHealthAndSafety } from 'react-icons/md';

interface DashboardProps {
  userData: UserData;
}

const Card = ({ title, icon, children, gradient }: { title: string; icon: React.ReactNode; children: React.ReactNode; gradient: string }) => (
  <motion.div
    className={`bg-gray-800 rounded-xl p-6 shadow-lg ${gradient}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center mb-4">
      <div className="text-2xl text-white mr-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <div className="text-gray-300">{children}</div>
  </motion.div>
);

export default function Dashboard({ userData }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Fitness Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Info Card */}
          <Card title="Personal Information" icon={<FaUser />} gradient="bg-gradient-to-br from-purple-600 to-blue-500">
            <ul className="space-y-2">
              <li>Age: {userData.personalInfo.age} years</li>
              <li>Gender: {userData.personalInfo.gender}</li>
              <li>Body Type: {userData.personalInfo.bodyType}</li>
              <li>Body Fat: {userData.personalInfo.bodyFat}%</li>
            </ul>
          </Card>

          {/* Fitness Goals Card */}
          <Card title="Fitness Goals" icon={<IoMdFitness />} gradient="bg-gradient-to-br from-green-600 to-teal-500">
            <ul className="space-y-2">
              {userData.fitnessGoals.map((goal, index) => (
                <li key={index}>• {goal}</li>
              ))}
            </ul>
          </Card>

          {/* Weight Goals Card */}
          <Card title="Weight Goals" icon={<FaWeight />} gradient="bg-gradient-to-br from-red-600 to-pink-500">
            <ul className="space-y-2">
              <li>Current Weight: {userData.weightGoals.currentWeight} kg</li>
              <li>Target Weight: {userData.weightGoals.targetWeight} kg</li>
              <li>Goal Difference: {Math.abs(userData.weightGoals.targetWeight - userData.weightGoals.currentWeight)} kg</li>
            </ul>
          </Card>

          {/* Experience Card */}
          <Card title="Experience Level" icon={<FaDumbbell />} gradient="bg-gradient-to-br from-yellow-600 to-red-500">
            <ul className="space-y-2">
              <li>Level: {userData.experienceLevel}</li>
              <li>Weightlifting: {userData.weightliftingExperience}</li>
            </ul>
          </Card>

          {/* Workout Preferences Card */}
          <Card title="Workout Preferences" icon={<FaRunning />} gradient="bg-gradient-to-br from-blue-600 to-indigo-500">
            <ul className="space-y-2">
              <li>Days per Week: {userData.workoutPreferences.daysPerWeek}</li>
              <li>Time per Workout: {userData.workoutPreferences.timePerWorkout} minutes</li>
              <li>Preferred Time: {userData.workoutPreferences.preferredTime}</li>
              <li>Location: {userData.workoutPreferences.location}</li>
              <li>Frequency: {userData.workoutPreferences.frequency}</li>
              <li>Duration: {userData.workoutPreferences.duration}</li>
            </ul>
          </Card>

          {/* Schedule Card */}
          <Card title="Weekly Schedule" icon={<FaCalendar />} gradient="bg-gradient-to-br from-purple-600 to-pink-500">
            <ul className="space-y-2">
              {userData.weeklySchedule.map((day, index) => (
                <li key={index}>• {day}</li>
              ))}
            </ul>
          </Card>

          {/* Daily Routine Card */}
          <Card title="Daily Routine" icon={<FaClock />} gradient="bg-gradient-to-br from-green-600 to-blue-500">
            <ul className="space-y-2">
              <li>Wake Up: {userData.dailyRoutine.wakeUpTime}</li>
              <li>Sleep: {userData.dailyRoutine.sleepTime}</li>
              <li>Meals: {userData.dailyRoutine.mealtimes.length} times per day</li>
            </ul>
          </Card>

          {/* Exercise Preferences Card */}
          <Card title="Exercise Preferences" icon={<IoMdFitness />} gradient="bg-gradient-to-br from-red-600 to-yellow-500">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Preferred Exercises:</h4>
                <ul className="space-y-1">
                  {userData.exercisePreferences.preferredExercises.map((exercise, index) => (
                    <li key={index}>• {exercise}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Exercises to Avoid:</h4>
                <ul className="space-y-1">
                  {userData.exercisePreferences.avoidExercises.map((exercise, index) => (
                    <li key={index}>• {exercise}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Health Conditions Card */}
          <Card title="Health Conditions" icon={<MdHealthAndSafety />} gradient="bg-gradient-to-br from-blue-600 to-green-500">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Conditions:</h4>
                <ul className="space-y-1">
                  {userData.healthConditions.conditions.map((condition, index) => (
                    <li key={index}>• {condition}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Medications:</h4>
                <ul className="space-y-1">
                  {userData.healthConditions.medications.map((medication, index) => (
                    <li key={index}>• {medication}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Injuries:</h4>
                <ul className="space-y-1">
                  {userData.healthConditions.injuries.map((injury, index) => (
                    <li key={index}>• {injury}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Measurements Card */}
          <Card title="Body Measurements" icon={<FaRuler />} gradient="bg-gradient-to-br from-yellow-600 to-purple-500">
            <ul className="space-y-2">
              <li>Height: {userData.measurements.height} cm</li>
              <li>Weight: {userData.measurements.weight} kg</li>
              <li>Chest: {userData.measurements.chest} cm</li>
              <li>Waist: {userData.measurements.waist} cm</li>
              <li>Hips: {userData.measurements.hips} cm</li>
              <li>Arms: {userData.measurements.arms} cm</li>
              <li>Legs: {userData.measurements.legs} cm</li>
            </ul>
          </Card>

          {/* Stress Level Card */}
          <Card title="Stress Management" icon={<FaHeart />} gradient="bg-gradient-to-br from-pink-600 to-red-500">
            <div className="space-y-4">
              <div>Level: {userData.stressLevel.level}</div>
              <div>
                <h4 className="font-semibold mb-2">Stressors:</h4>
                <ul className="space-y-1">
                  {userData.stressLevel.stressors.map((stressor, index) => (
                    <li key={index}>• {stressor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Training History Card */}
          <Card title="Training History" icon={<FaDumbbell />} gradient="bg-gradient-to-br from-indigo-600 to-blue-500">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Previous Experience:</h4>
                <ul className="space-y-1">
                  {userData.trainingHistory.previousExperience.map((exp, index) => (
                    <li key={index}>• {exp}</li>
                  ))}
                </ul>
              </div>
              <div>Duration: {userData.trainingHistory.trainingDuration}</div>
              <div>Consistency: {userData.trainingHistory.consistency}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}