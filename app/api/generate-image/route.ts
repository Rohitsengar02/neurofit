import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Use Gemini 2.5 Flash to enhance the prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const enhancementPrompt = `You are a professional prompt engineer for Stable Diffusion. Enhance this simple prompt into a detailed, high-quality image generation prompt for a fitness app. 
    Original Prompt: ${prompt}
    Focus on: photorealistic, 8k, high detail, vibrant, cinematic lighting.
    Return ONLY the enhanced prompt text.`;

    const geminiResult = await model.generateContent(enhancementPrompt);
    const enhancedPrompt = geminiResult.response.text().trim();

    // 2. Try Hugging Face (Higher quality)
    const hfKey = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (hfKey) {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
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
            imageUrl: `data:image/jpeg;base64,${base64Image}`,
            engine: 'huggingface',
            success: true 
          });
        }
      } catch (hfError) {
        console.error('Hugging Face fallback to Pollinations:', hfError);
      }
    }

    // 3. Fallback to Pollinations (Free)
    const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    
    return NextResponse.json({ 
      imageUrl: pollUrl,
      engine: 'pollinations',
      success: true 
    });
    
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the image.', details: error.message },
      { status: 500 }
    );
  }
}
