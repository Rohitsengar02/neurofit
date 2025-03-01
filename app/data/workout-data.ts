// Define category colors without JSX
export const categoryColors = {
  challenges: 'from-amber-400 to-amber-600',
  cardio: 'from-orange-400 to-orange-600',
  strength: 'from-blue-400 to-blue-600',
  boxing: 'from-red-500 to-red-700',
  yoga: 'from-purple-400 to-purple-600',
  climbing: 'from-green-400 to-green-600',
  cycling: 'from-cyan-400 to-cyan-600'
} as const;

// Define the workout data without icons
export const workoutData = [
  {
    id: 'challenges',
    name: 'Challenges',
    color: categoryColors.challenges,
    workouts: [
      {
        id: 'challenge-1',
        title: '30-Day Full-Body Blast',
        duration: 30,
        calories: '400/day',
        intensity: 'Medium',
        type: 'challenge' as const,
        focus: 'Full Body',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format',
        description: 'Build overall strength and endurance with daily sessions.'
      },
      {
        id: 'challenge-2',
        title: '90-Day Warrior',
        duration: 90,
        calories: '550/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&auto=format',
        description: 'Complete strength transformation.'
      },
      {
        id: 'challenge-3',
        title: '7-Day Quick Burn',
        duration: 7,
        calories: '350/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Fat Burn',
        image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&auto=format',
        description: 'Rapid results with an intense full-body regimen.'
      },
      {
        id: 'challenge-4',
        title: '21-Day Lean Core',
        duration: 21,
        calories: '300/day',
        intensity: 'Medium',
        type: 'challenge' as const,
        focus: 'Abs/Core',
        image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=300&auto=format',
        description: 'Sculpt a lean core with progressive exercises.'
      },
      {
        id: 'challenge-5',
        title: '6-Month Fitness Journey',
        duration: 180,
        calories: '600/day',
        intensity: 'Variable',
        type: 'challenge' as const,
        focus: 'Overall Fitness',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&auto=format',
        description: 'A holistic approach to achieving peak fitness.'
      }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardio',
    color: categoryColors.cardio,
    workouts: [
      {
        id: 'cardio-challenge-1',
        title: '30-Day Cardio Transformation',
        duration: 30,
        calories: '450/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Cardio Endurance',
        image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&auto=format',
        description: '30-day journey to transform your cardiovascular fitness and endurance.'
      },
      {
        id: 'cardio-challenge-2',
        title: '21-Day HIIT Revolution',
        duration: 21,
        calories: '400/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'HIIT',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&auto=format',
        description: 'Transform your fitness with 21 days of progressive HIIT workouts.'
      },
      {
        id: 'cardio-challenge-3',
        title: '14-Day Sprint Master',
        duration: 14,
        calories: '350/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Speed',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&auto=format',
        description: 'Master sprint intervals and improve your speed in two weeks.'
      },
      // Regular cardio workouts
      {
        id: 'hiit-blast',
        title: 'HIIT Cardio Blast',
        duration: 30,
        calories: '400',
        intensity: 'High',
        type: 'workout' as const,
        focus: 'Full Body',
        image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&auto=format',
        description: 'High-intensity interval training to maximize calorie burn.'
      },
      // ... (previous cardio workouts remain the same)
    ]
  },
  {
    id: 'strength',
    name: 'Strength',
    color: categoryColors.strength,
    workouts: [
      {
        id: 'strength-challenge-1',
        title: '30-Day Strength Builder',
        duration: 30,
        calories: '500/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Full Body Strength',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&auto=format',
        description: 'Progressive strength training program to build muscle and power.'
      },
      {
        id: 'strength-challenge-2',
        title: '21-Day Power Program',
        duration: 21,
        calories: '450/day',
        intensity: 'High',
        type: 'challenge' as const,
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&auto=format',
        description: 'Build explosive power and strength in 21 days.'
      },
      {
        id: 'strength-challenge-3',
        title: '14-Day Core Master',
        duration: 14,
        calories: '300/day',
        intensity: 'Medium',
        type: 'challenge' as const,
        focus: 'Core Strength',
        image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400&h=300&auto=format',
        description: 'Intensive core strengthening program for a stronger foundation.'
      },
      // Regular strength workouts
      {
        id: 'upper-body-power',
        title: 'Upper Body Power',
        duration: 45,
        calories: '350',
        intensity: 'High',
        type: 'workout' as const,
        focus: 'Upper Body',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&auto=format',
        description: 'Comprehensive upper body workout.'
      },
      // ... (previous strength workouts remain the same)
    ]
  }
];
