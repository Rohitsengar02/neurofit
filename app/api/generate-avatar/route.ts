import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const avatarPrompt = `Generate a detailed, professional-grade image prompt for a fitness app profile avatar. 
    User Description: ${prompt}
    Focus on: athlete, high resolution, centered portrait, vibrant colors, athletic attire, sharp focus.
    Return ONLY the prompt text.`;

    const geminiResult = await model.generateContent(avatarPrompt);
    const enhancedPrompt = geminiResult.response.text().trim();

    const hfKey = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (hfKey) {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: enhancedPrompt }),
          }
        );

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64Image = Buffer.from(buffer).toString('base64');
          return NextResponse.json({ 
            success: true,
            imageUrl: `data:image/jpeg;base64,${base64Image}`,
            engine: 'huggingface'
          });
        }
      } catch (hfError) {
        console.error('Hugging Face error in avatar:', hfError);
      }
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      engine: 'pollinations'
    });
    
  } catch (error: any) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate avatar', details: error.message },
      { status: 500 }
    );
  }
}
