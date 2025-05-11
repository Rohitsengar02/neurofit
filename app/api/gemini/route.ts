import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Rudra, a knowledgeable fitness and health assistant. You help users with workout plans, nutrition advice, and general health guidance. Please respond to the following message in a helpful and encouraging way: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return NextResponse.json(
        { error: 'Empty response from Gemini' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
