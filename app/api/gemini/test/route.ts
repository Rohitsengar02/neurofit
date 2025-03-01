import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Simple test prompt
    const result = await model.generateContent('Say "Hello, World!"');
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, message: text });
  } catch (error) {
    console.error('Gemini API test error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Gemini API' },
      { status: 500 }
    );
  }
}
