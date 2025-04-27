import { NextResponse } from 'next/server';

// Helper function to generate image using pollinations.ai (free, no API key required)
async function generateWithPollinations(prompt: string) {
  try {
    // Enhanced prompt for better avatar generation
    const enhancedPrompt = `high quality, detailed avatar portrait of a person ${prompt}, digital art, profile picture, fitness app avatar, professional looking, centered composition, face clearly visible`;
    
    // Using pollinations.ai API which is free and doesn't require authentication
    const response = await fetch(
      'https://image.pollinations.ai/prompt/' + encodeURIComponent(enhancedPrompt),
      {
        method: 'GET',
        headers: {
          'Accept': 'image/*, application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Pollinations API error:', response.statusText);
      return NextResponse.json(
        { success: false, message: 'Failed to generate image with fallback API' },
        { status: response.status }
      );
    }

    // For this API, we can just return the URL directly
    const imageUrl = response.url;

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error) {
    console.error('Error generating image with Pollinations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate avatar with fallback API' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhanced prompt to guide the model towards avatar generation
    const enhancedPrompt = `high quality, detailed avatar portrait of a person ${prompt}, digital art, profile picture, fitness app avatar, professional looking, centered composition, face clearly visible`;

    // Hugging Face API key from environment variables - note the correct env variable name
    const apiKey = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      console.warn('HUGGING_FACE_API_KEY is not defined, falling back to pollinations.ai');
      // Fall back to the free pollinations.ai API that doesn't require authentication
      return await generateWithPollinations(prompt);
    }

    // Call Hugging Face API for image generation
    // Using the stable-diffusion-2 model which is good for avatar generation
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: enhancedPrompt }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', error);
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Failed to generate image' },
        { status: response.status }
      );
    }

    // The response is the binary image data
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl: dataUrl 
    });
  } catch (error) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate avatar' },
      { status: 500 }
    );
  }
}
