import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface WorkoutRequest {
  category: string;
  dayNumber: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  description: string;
}

interface WorkoutResponse {
  duration: string;
  calories: number;
  intensity: string;
  type: string;
  exercises: Exercise[];
}

// Fallback workout in case of API failure
const getFallbackWorkout = (category: string, dayNumber: number): WorkoutResponse => ({
  duration: "45 mins",
  calories: 300,
  intensity: "Medium",
  type: category,
  exercises: [
    {
      name: "Push-ups",
      sets: 3,
      reps: 12,
      description: "Keep your body straight and lower your chest to the ground"
    },
    {
      name: "Squats",
      sets: 3,
      reps: 15,
      description: "Keep your back straight and lower your body until thighs are parallel to ground"
    },
    {
      name: "Plank",
      sets: 3,
      reps: 30,
      description: "Hold position with straight back for 30 seconds"
    },
    {
      name: "Mountain Climbers",
      sets: 3,
      reps: 20,
      description: "Alternate bringing knees to chest while maintaining plank position"
    }
  ]
});

const isValidWorkoutRequest = (data: any): data is WorkoutRequest => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.category === 'string' &&
    typeof data.dayNumber === 'number'
  );
};

const isValidWorkout = (data: any): data is WorkoutResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.duration === 'string' &&
    typeof data.calories === 'number' &&
    typeof data.intensity === 'string' &&
    typeof data.type === 'string' &&
    Array.isArray(data.exercises) &&
    data.exercises.every((exercise: any) => {
      return (
        typeof exercise === 'object' &&
        exercise !== null &&
        typeof exercise.name === 'string' &&
        typeof exercise.sets === 'number' &&
        typeof exercise.reps === 'number' &&
        typeof exercise.description === 'string'
      );
    })
  );
};

export async function POST(request: Request) {
  try {
    const { category, dayNumber } = await request.json();

    if (!category || !dayNumber) {
      console.error('Missing required parameters');
      return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
    }

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback workout');
      return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `Generate a workout plan for ${category} training, day ${dayNumber}.

Requirements:
1. Include 5-8 exercises
2. Each exercise must have a clear, descriptive name
3. Each exercise description must be detailed step-by-step instructions
4. Sets should be between 3-4
5. Reps should be between 10-15 based on exercise type
6. Exercises should be appropriate for the ${category} category
7. Exercises should follow proper progression for day ${dayNumber}
8. Include a mix of compound and isolation exercises

Return ONLY a valid JSON object with this exact structure:
{
  "duration": "string",
  "calories": number,
  "intensity": "string",
  "type": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": number,
      "description": "string"
    }
  ]
}`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
      }

      let workout: WorkoutResponse;
      try {
        workout = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
      }

      // Validate workout structure
      if (!isValidWorkout(workout)) {
        console.error('Invalid workout structure');
        return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
      }

      // Validate exercises
      if (!Array.isArray(workout.exercises) || workout.exercises.length < 5 || workout.exercises.length > 8) {
        console.error('Invalid number of exercises');
        return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
      }

      // Validate each exercise
      const isValid = workout.exercises.every((ex: Exercise) => 
        ex.name && 
        typeof ex.name === 'string' &&
        ex.sets && 
        typeof ex.sets === 'number' &&
        ex.sets >= 3 &&
        ex.sets <= 4 &&
        ex.reps && 
        typeof ex.reps === 'number' &&
        ex.reps >= 10 &&
        ex.reps <= 15 &&
        ex.description &&
        typeof ex.description === 'string'
      );

      if (!isValid) {
        console.error('Invalid exercise data structure');
        return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
      }

      return NextResponse.json({ workout });

    } catch (error) {
      console.error('Gemini API error:', error);
      return NextResponse.json({ workout: getFallbackWorkout(category, dayNumber) });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ error: 'Failed to generate workout' }, { status: 500 });
  }
}
