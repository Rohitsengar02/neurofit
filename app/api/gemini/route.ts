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

    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create chat history from context
    const chat = model.startChat({
      history: (context || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content,
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(
      `You are Rudra, a friendly AI fitness assistant. You help users with fitness advice, workout plans, and health tips. 

      IMPORTANT RULES:
      1. Always respond in English only, regardless of the input language.
      2. Never use symbols like *, -, •, or any other bullet points in your responses.
      3. For lists or points, use numbers (1., 2., 3.) or write in plain text paragraphs.
      4. Keep each point or paragraph short and clear.
      5. Use simple formatting - just numbers and text.

      Example format for points:
      1. First point in plain text
      2. Second point in plain text
      3. Third point in plain text

      Keep your responses natural, friendly and conversational. Always maintain context of the conversation and provide personalized responses.
      Break your responses into short, clear paragraphs for better readability.
      
      Current user message: ${message}`
    );
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
