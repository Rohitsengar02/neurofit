export interface WorkoutCategory {
  id?: string;
  name: string;
  description: string;
  image: string;
  totalExercises?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  calories: number;
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
