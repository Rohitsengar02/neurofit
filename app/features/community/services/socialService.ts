import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { CommunityPost, CommunityComment } from '../utils/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function for file uploads
const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

// Community post services
export const getPostsByCommunityId = async (communityId: string, limitCount: number = 20): Promise<CommunityPost[]> => {
  const q = query(
    collection(db, 'communityPosts'), 
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CommunityPost);
};

export const getPostById = async (postId: string): Promise<CommunityPost | null> => {
  const postRef = doc(db, 'communityPosts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    return null;
  }
  
  return { id: postSnap.id, ...postSnap.data() } as CommunityPost;
};

export const createPost = async (
  communityId: string, 
  authorId: string, 
  authorType: 'trainer' | 'member',
  content: string,
  mediaFiles: File[] = []
): Promise<CommunityPost> => {
  // Upload media files if any
  const mediaUrls: string[] = [];
  
  if (mediaFiles.length > 0) {
    for (const file of mediaFiles) {
      const path = `posts/${communityId}/${authorId}/${Date.now()}-${file.name}`;
      const url = await uploadFile(file, path);
      mediaUrls.push(url);
    }
  }
  
  const newPost = {
    communityId,
    authorId,
    authorType,
    content,
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'communityPosts'), newPost);
  return { 
    id: docRef.id, 
    ...newPost, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now(),
    likes: 0,
    comments: 0
  } as CommunityPost;
};

export const updatePost = async (
  postId: string, 
  content: string
): Promise<void> => {
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    content,
    updatedAt: serverTimestamp()
  });
};

export const deletePost = async (postId: string): Promise<void> => {
  // First, delete all comments associated with this post
  const commentsQuery = query(
    collection(db, 'communityComments'), 
    where('postId', '==', postId)
  );
  
  const commentsSnapshot = await getDocs(commentsQuery);
  
  const deletePromises = commentsSnapshot.docs.map(commentDoc => 
    deleteDoc(doc(db, 'communityComments', commentDoc.id))
  );
  
  await Promise.all(deletePromises);
  
  // Then delete the post
  const postRef = doc(db, 'communityPosts', postId);
  await deleteDoc(postRef);
};

export const likePost = async (postId: string): Promise<void> => {
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    likes: increment(1)
  });
};

// Comment services
export const getCommentsByPostId = async (postId: string): Promise<CommunityComment[]> => {
  const q = query(
    collection(db, 'communityComments'), 
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CommunityComment);
};

export const createComment = async (
  postId: string, 
  authorId: string, 
  authorType: 'trainer' | 'member',
  content: string
): Promise<CommunityComment> => {
  const newComment = {
    postId,
    authorId,
    authorType,
    content,
    likes: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  // Increment comment count on the post
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    comments: increment(1),
    updatedAt: serverTimestamp()
  });
  
  const docRef = await addDoc(collection(db, 'communityComments'), newComment);
  return { 
    id: docRef.id, 
    ...newComment, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now(),
    likes: 0
  } as CommunityComment;
};

export const updateComment = async (
  commentId: string, 
  content: string
): Promise<void> => {
  const commentRef = doc(db, 'communityComments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp()
  });
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  // Decrement comment count on the post
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    comments: increment(-1),
    updatedAt: serverTimestamp()
  });
  
  // Delete the comment
  const commentRef = doc(db, 'communityComments', commentId);
  await deleteDoc(commentRef);
};

export const likeComment = async (commentId: string): Promise<void> => {
  const commentRef = doc(db, 'communityComments', commentId);
  await updateDoc(commentRef, {
    likes: increment(1)
  });
};
