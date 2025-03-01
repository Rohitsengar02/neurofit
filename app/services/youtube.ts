const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  viewCount: string;
  duration: string;
}

export interface YouTubeResponse {
  videos: YouTubeVideo[];
  nextPageToken: string | null;
}

const CATEGORY_QUERIES = {
  focus: 'focus music concentration productivity',
  sleep: 'sleep asmr relaxation',
  meditate: 'guided meditation mindfulness',
  nature: 'nature sounds relaxation ambient',
  yoga: 'yoga practice session relaxation',
  breath: 'breathing exercises techniques'
} as const;

export type VideoCategory = keyof typeof CATEGORY_QUERIES;

export const fetchVideos = async (category: VideoCategory, pageToken?: string): Promise<YouTubeResponse> => {
  try {
    const query = CATEGORY_QUERIES[category];
    // First fetch the search results
    const searchResponse = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=10&q=${query}&type=video&key=${YOUTUBE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch search results');
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || !Array.isArray(searchData.items)) {
      console.error('Invalid search response:', searchData);
      return { videos: [], nextPageToken: null };
    }

    // Extract video IDs and make the details request
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const detailsData = await detailsResponse.json();

    if (!detailsData.items || !Array.isArray(detailsData.items)) {
      console.error('Invalid details response:', detailsData);
      return { videos: [], nextPageToken: null };
    }

    // Map the combined data to our interface
    const videos = searchData.items.map((item: any, index: number) => {
      const details = detailsData.items[index] || {};
      return {
        id: item.id.videoId,
        title: item.snippet.title || '',
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        channelTitle: item.snippet.channelTitle || '',
        viewCount: details.statistics?.viewCount || '0',
        duration: details.contentDetails?.duration || 'PT0S'
      };
    });

    return {
      videos,
      nextPageToken: searchData.nextPageToken || null
    };
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return { videos: [], nextPageToken: null };
  }
};
