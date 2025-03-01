import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `As a professional fitness trainer AI, generate a detailed workout plan. 
    Return ONLY a valid JSON object with this EXACT structure:
    {
      "duration": "45-60 minutes",
      "calories": 500,
      "intensity": "Medium",
      "type": "Push",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": 12,
          "description": "Form instructions"
        }
      ]
    }

    IMPORTANT RULES:
    1. Return ONLY the JSON, no other text
    2. Include 5-8 exercises
    3. Ensure all exercises match the workout type
    4. For Push workouts: chest, shoulders, triceps
    5. For Pull workouts: back, biceps, rear delts
    6. For Legs workouts: quads, hamstrings, calves
    7. Sets should be between 3-5
    8. Reps should be between 8-15
    9. Duration should be "45-60 minutes"
    10. Calories should be between 400-600
    11. Intensity should be one of: "Low", "Medium", "High"
    12. Type should be one of: "Push", "Pull", "Legs"
    13. Each exercise must have a clear, detailed form description`;

    const result = await model.generateContent(systemPrompt + "\n\nUser request: " + prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return NextResponse.json(
        { error: 'Empty response from Gemini' },
        { status: 500 }
      );
    }

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Parse and validate the JSON structure
    try {
      const workout = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!workout.duration || 
          typeof workout.calories !== 'number' || 
          !workout.intensity || 
          !workout.type || 
          !Array.isArray(workout.exercises)) {
        throw new Error('Missing required fields');
      }

      // Validate workout type
      if (!['Push', 'Pull', 'Legs'].includes(workout.type)) {
        throw new Error('Invalid workout type');
      }

      // Validate intensity
      if (!['Low', 'Medium', 'High'].includes(workout.intensity)) {
        throw new Error('Invalid intensity level');
      }

      // Validate exercises
      if (workout.exercises.length < 5 || workout.exercises.length > 8) {
        throw new Error('Invalid number of exercises');
      }

      for (const exercise of workout.exercises) {
        if (!exercise.name || 
            typeof exercise.sets !== 'number' || 
            typeof exercise.reps !== 'number' || 
            !exercise.description ||
            exercise.sets < 3 || 
            exercise.sets > 5 ||
            exercise.reps < 8 || 
            exercise.reps > 15) {
          throw new Error('Invalid exercise data');
        }
      }

      return NextResponse.json({ response: JSON.stringify(workout) });
    } catch (error: any) {
      console.error('JSON validation error:', error.message);
      return NextResponse.json(
        { error: 'Failed to generate valid workout data: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
