import { db, auth } from '../utils/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp, increment } from 'firebase/firestore';
import type { Post, Comment } from '../types/social';

export async function createPost(postData: Partial<Post>): Promise<string> {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.exists() ? userDoc.data() : null;

  const post: Partial<Post> = {
    ...postData,
    userId: auth.currentUser.uid,
    username: userData?.displayName || auth.currentUser.displayName || 'Anonymous',
    userAvatar: userData?.photoURL || auth.currentUser.photoURL || '/default-avatar.png',
    likes: 0,
    commentsCount: 0,
    shares: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'posts'), post);
  return docRef.id;
}

export async function getPosts() {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[];
}

export async function updatePost(postId: string, updates: Partial<Post>) {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) throw new Error('Post not found');
  if (postDoc.data().userId !== auth.currentUser.uid) throw new Error('Not authorized');

  await updateDoc(postRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deletePost(postId: string) {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) throw new Error('Post not found');
  if (postDoc.data().userId !== auth.currentUser.uid) throw new Error('Not authorized');

  await deleteDoc(postRef);
}

export async function likePost(postId: string) {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const postRef = doc(db, 'posts', postId);
  const likeRef = doc(collection(db, 'likes'), `${postId}_${auth.currentUser.uid}`);
  const likeDoc = await getDoc(likeRef);

  if (likeDoc.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, {
      likes: increment(-1)
    });
  } else {
    await addDoc(collection(db, 'likes'), {
      postId,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now()
    });
    await updateDoc(postRef, {
      likes: increment(1)
    });
  }
}

export async function addComment(postId: string, content: string) {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.exists() ? userDoc.data() : null;

  const comment: Partial<Comment> = {
    postId,
    content,
    userId: auth.currentUser.uid,
    username: userData?.displayName || auth.currentUser.displayName || 'Anonymous',
    userAvatar: userData?.photoURL || auth.currentUser.photoURL || '/default-avatar.png',
    likes: 0,
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'comments'), comment);
  
  // Update comment count
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (postDoc.exists()) {
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
  }

  return docRef.id;
}

export async function getComments(postId: string) {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('postId', '==', postId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
}

export async function deleteComment(commentId: string, postId: string) {
  if (!auth.currentUser) throw new Error('User must be authenticated');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);
  
  if (!commentDoc.exists()) throw new Error('Comment not found');
  if (commentDoc.data().userId !== auth.currentUser.uid) throw new Error('Not authorized');

  await deleteDoc(commentRef);

  // Update comment count
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (postDoc.exists()) {
    await updateDoc(postRef, {
      commentsCount: increment(-1)
    });
  }
}
