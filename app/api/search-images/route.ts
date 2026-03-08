import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // 1. Try DuckDuckGo Image Search (Scraping-like approach since it's "unlimited")
    // Note: This is a placeholder for a real search. For a more robust "unlimited" feel,
    // we use a reliable free image search URL generator or a public API.
    
    // Using a more reliable free aggregator: Pixabay (Publicly accessible search)
    // For "fully unlimited", we'll provide a set of results from high-quality sources.
    
    const searchUrl = `https://pixabay.com/api/?key=48733475-68045e7f62e811c05d761665e&q=${encodeURIComponent(query)}&image_type=photo&per_page=12`;
    
    const response = await axios.get(searchUrl);
    
    if (response.data && response.data.hits) {
      const images = response.data.hits.map((hit: any) => ({
        url: hit.webformatURL,
        thumbnail: hit.previewURL,
        title: hit.tags,
        source: 'Pixabay'
      }));
      
      return NextResponse.json({ images });
    }

    // Fallback to a dummy search if API fails
    return NextResponse.json({ images: [] });
    
  } catch (error: any) {
    console.error('Image search error:', error);
    return NextResponse.json({ error: 'Failed to search images', details: error.message }, { status: 500 });
  }
}
