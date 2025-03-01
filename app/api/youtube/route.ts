import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    if (!data.items?.[0]) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    return NextResponse.json({ videoId: data.items[0].id.videoId });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}
