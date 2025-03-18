export interface BaseWorkout {
  id: string;
  title: string;
  image: string;
  description?: string;
  intensity: string;
  focus: string;
  calories?: string;
  type: 'challenge' | 'cardio' | 'strength' | 'workout';
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in seconds
  restBetweenSets: number; // in seconds
}

export interface WorkoutCategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
  backgroundColor: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  days: number;
  caloriesPerDay: number;
  exercises: Exercise[];
  categoryId: string;
}

export interface ChallengeWorkout extends BaseWorkout {
  type: 'challenge';
  duration: number;
  levels: {
    name: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      rest: number;
    }[];
  }[];
}

export interface ActiveWorkout {
  workoutId: string;
  categoryId: string;
  categoryName: string;
  startDate: Date;
  endDate: Date;
  completedDays: Date[];
  title: string;
  imageUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalDays: number;
  caloriesPerDay: number;
  status: 'active' | 'completed' | 'failed';
}

export type UpdatedWorkout = Partial<ActiveWorkout>;
