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
  Timestamp,
  increment,
  orderBy
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { SubscriptionTier, CommunityMember } from '../utils/types';
import * as couponService from './couponService';

// Subscription tier services
export const getTiersByCommunityId = async (communityId: string): Promise<SubscriptionTier[]> => {
  const q = query(
    collection(db, 'subscriptionTiers'), 
    where('communityId', '==', communityId),
    orderBy('price', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SubscriptionTier);
};

export const getTierById = async (tierId: string): Promise<SubscriptionTier | null> => {
  const tierRef = doc(db, 'subscriptionTiers', tierId);
  const tierSnap = await getDoc(tierRef);
  
  if (!tierSnap.exists()) {
    return null;
  }
  
  return { id: tierSnap.id, ...tierSnap.data() } as SubscriptionTier;
};

export const createTier = async (communityId: string, tierData: Omit<SubscriptionTier, 'id' | 'communityId' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionTier> => {
  const newTier = {
    ...tierData,
    communityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'subscriptionTiers'), newTier);
  return { id: docRef.id, ...newTier, createdAt: Timestamp.now(), updatedAt: Timestamp.now() } as SubscriptionTier;
};

export const updateTier = async (tierId: string, tierData: Partial<Omit<SubscriptionTier, 'id' | 'communityId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const tierRef = doc(db, 'subscriptionTiers', tierId);
  await updateDoc(tierRef, {
    ...tierData,
    updatedAt: serverTimestamp()
  });
};

export const deleteTier = async (tierId: string): Promise<void> => {
  const tierRef = doc(db, 'subscriptionTiers', tierId);
  await deleteDoc(tierRef);
};

// Community membership services
export const getMembershipsByUserId = async (userId: string): Promise<CommunityMember[]> => {
  const q = query(
    collection(db, 'communityMembers'), 
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CommunityMember);
};

export const getMembershipsByCommunityId = async (communityId: string): Promise<CommunityMember[]> => {
  const q = query(
    collection(db, 'communityMembers'), 
    where('communityId', '==', communityId),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CommunityMember);
};

export const getUserMembershipForCommunity = async (userId: string, communityId: string): Promise<CommunityMember | null> => {
  const q = query(
    collection(db, 'communityMembers'), 
    where('userId', '==', userId),
    where('communityId', '==', communityId),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CommunityMember;
};

export const createMembership = async (
  userId: string, 
  communityId: string, 
  tierId: string, 
  durationMonths: number = 1,
  couponCode?: string
): Promise<CommunityMember> => {
  // Calculate expiration date
  const now = new Date();
  const expiresAt = new Date(now.setMonth(now.getMonth() + durationMonths));
  
  const newMembership = {
    userId,
    communityId,
    tierId,
    status: 'active',
    joinedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt)
  };
  
  // Update community member count
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, {
    memberCount: increment(1),
    updatedAt: serverTimestamp()
  });
  
  // Apply coupon if provided
  if (couponCode) {
    try {
      // Validate coupon
      const validation = await couponService.validateCoupon(couponCode, communityId, userId);
      
      if (validation.valid && validation.coupon) {
        // Get tier price
        const tier = await getTierById(tierId);
        if (tier) {
          // Apply the coupon
          await couponService.applyCoupon(
            validation.coupon.id,
            userId,
            communityId,
            tierId,
            tier.price
          );
          
          // Add coupon information to membership
          Object.assign(newMembership, {
            couponId: validation.coupon.id,
            couponCode: validation.coupon.code,
            discountPercentage: validation.coupon.discountPercentage
          });
        }
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      // Continue without coupon if there's an error
    }
  }
  
  const docRef = await addDoc(collection(db, 'communityMembers'), newMembership);
  return { 
    id: docRef.id, 
    ...newMembership, 
    joinedAt: Timestamp.now(), 
    status: 'active' as const
  } as CommunityMember;
};

export const cancelMembership = async (membershipId: string): Promise<void> => {
  const membershipRef = doc(db, 'communityMembers', membershipId);
  const membershipSnap = await getDoc(membershipRef);
  
  if (!membershipSnap.exists()) {
    throw new Error('Membership not found');
  }
  
  const membershipData = membershipSnap.data() as CommunityMember;
  
  // Update membership status
  await updateDoc(membershipRef, {
    status: 'cancelled'
  });
  
  // Update community member count
  const communityRef = doc(db, 'communities', membershipData.communityId);
  await updateDoc(communityRef, {
    memberCount: increment(-1),
    updatedAt: serverTimestamp()
  });
};

export const renewMembership = async (
  membershipId: string, 
  durationMonths: number = 1
): Promise<void> => {
  const membershipRef = doc(db, 'communityMembers', membershipId);
  const membershipSnap = await getDoc(membershipRef);
  
  if (!membershipSnap.exists()) {
    throw new Error('Membership not found');
  }
  
  // Calculate new expiration date
  const now = new Date();
  const expiresAt = new Date(now.setMonth(now.getMonth() + durationMonths));
  
  await updateDoc(membershipRef, {
    status: 'active',
    expiresAt: Timestamp.fromDate(expiresAt)
  });
};
