import { MotionProps } from 'framer-motion';

export interface OnboardingStepProps {
  onNext: () => void;
  onBack?: () => void;
  commonProps: MotionProps;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  updatedAt: string;
}

export interface UserData {
  profile: UserProfile;
  // Add other user data interfaces as needed
  goals?: string[];
  fitnessLevel?: string;
  preferences?: {
    workoutDays?: string[];
    preferredTime?: string;
    workoutDuration?: string;
  };
}
