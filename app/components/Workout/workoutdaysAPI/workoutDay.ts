import { Exercise } from './exercise';

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  exercises: WorkoutExercise[];
  categoryId: string;
  workoutId: string;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  days: number;
  categoryId: string;
  duration?: number;
  calories?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: any;
  updatedAt: any;
}
