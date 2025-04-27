import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Using a completely free public API that doesn't require authentication
    // This API uses Stable Diffusion and is available for free use
    const response = await fetch(
      'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt),
      {
        method: 'GET',
        headers: {
          'Accept': 'image/*, application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Image generation API error:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to generate image. Please try again with a different prompt.' },
        { status: response.status }
      );
    }

    // For this API, we can just return the URL directly
    const imageUrl = response.url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the image. Please try again later.' },
      { status: 500 }
    );
  }
}
