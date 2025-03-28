import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit } from 'firebase/firestore';

export interface BlogSection {
  type: 'heading' | 'paragraph' | 'image';
  content: string;
  alt?: string; // Optional alt text for images
}

export interface BlogContent {
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
}

export interface Blog {
  id: string;
  title: string;
  summary: string;
  content: BlogContent;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const getBlogs = async (searchQuery?: string): Promise<Blog[]> => {
  try {
    console.log('Fetching blogs...');
    let q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    console.log('Got snapshot with', snapshot.size, 'documents');
    
    let blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Blog[];

    // Client-side search if query provided
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      blogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(search) ||
        blog.summary.toLowerCase().includes(search) ||
        blog.category.toLowerCase().includes(search) ||
        blog.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const getBlogById = async (blogId: string): Promise<Blog | null> => {
  try {
    console.log('Fetching blog:', blogId);
    const docRef = doc(db, 'blogs', blogId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Blog;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

export const getBlogsByCategory = async (category: string): Promise<Blog[]> => {
  try {
    console.log('Fetching blogs in category:', category);
    const q = query(
      collection(db, 'blogs'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Blog[];
  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    throw error;
  }
};

export const getLatestBlogs = async (count: number = 3): Promise<Blog[]> => {
  try {
    console.log('Fetching latest blogs...');
    const q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Blog[];
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    throw error;
  }
};
