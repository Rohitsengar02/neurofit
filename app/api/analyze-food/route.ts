import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1];
    const mimeType = image.match(/^data:(.*?);/)?.[1] || 'image/jpeg';
    
    // Create the prompt
    const prompt = `You are a food recognition and nutrition analysis AI. Analyze the provided food image and return:
    1. A list of detected food items with their confidence levels
    2. For each food item, provide a brief description and estimated nutritional information
    
    Format your response as a JSON object with the following structure:
    {
      "foods": [
        {
          "name": "food name",
          "description": "brief description",
          "confidence": 0.0 to 1.0,
          "nutritionalInfo": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        }
      ]
    }`;

    // Convert base64 to GoogleGenerativeAI.Part
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    // Validate and return the response
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error analyzing food:', error);
    
    // Return a mock response in case of error (for development)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        foods: [
          {
            name: 'Apple',
            description: 'Fresh red apple',
            confidence: 0.95,
            nutritionalInfo: {
              calories: 95,
              protein: 0.5,
              carbs: 25,
              fat: 0.3
            }
          },
          {
            name: 'Banana',
            description: 'Ripe yellow banana',
            confidence: 0.85,
            nutritionalInfo: {
              calories: 105,
              protein: 1.3,
              carbs: 27,
              fat: 0.4
            }
          }
        ]
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze food image' },
      { status: 500 }
    );
  }
}
