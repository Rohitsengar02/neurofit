import { Timestamp } from 'firebase/firestore';

export type MediaType = 'image' | 'video' | null;
export type Visibility = 'public' | 'private' | 'friends';

export interface PollOption {
  text: string;
  votes: number;
}

export interface FitnessData {
  steps?: number;
  calories?: number;
  duration?: number;
  activityType?: string;
}

export interface Post {
  id?: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  mediaUrls: string[];
  mediaType: MediaType;
  pollOptions?: PollOption[];
  fitnessData?: FitnessData;
  likes: number;
  commentsCount: number;
  shares: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  visibility: Visibility;
  tags: string[];
}

export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  likes: number;
  createdAt: Timestamp;
}

export interface Like {
  id?: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}
