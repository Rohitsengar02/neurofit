export interface UserData {
  gender: string;
  height: number;
  weight: number;
  goal: string;
  frequency: string;
  experience: string;
}

export interface OnboardingProps {
  onNext: (data: any) => void;
}