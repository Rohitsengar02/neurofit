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
  increment
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Coupon, CouponUsage } from '../utils/types';

// Collection references
const couponsCollection = collection(db, 'coupons');
const couponUsagesCollection = collection(db, 'couponUsages');

/**
 * Create a new coupon for a community
 */
export const createCoupon = async (
  communityId: string, 
  couponData: Omit<Coupon, 'id' | 'usedCount' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<Coupon> => {
  // Generate a random code if not provided
  if (!couponData.code) {
    couponData.code = generateCouponCode();
  } else {
    // Make sure the code is uppercase for consistency
    couponData.code = couponData.code.toUpperCase();
  }

  // Check if the code already exists
  const existingCoupon = await getCouponByCode(couponData.code);
  if (existingCoupon) {
    throw new Error('Coupon code already exists');
  }

  const newCoupon = {
    ...couponData,
    communityId,
    usedCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(couponsCollection, newCoupon);
  return { 
    id: docRef.id, 
    ...newCoupon, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now() 
  } as Coupon;
};

/**
 * Get all coupons for a community
 */
export const getCouponsByCommunityId = async (communityId: string): Promise<Coupon[]> => {
  const q = query(couponsCollection, where('communityId', '==', communityId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Coupon);
};

/**
 * Get a coupon by its ID
 */
export const getCouponById = async (couponId: string): Promise<Coupon | null> => {
  const couponRef = doc(db, 'coupons', couponId);
  const couponSnap = await getDoc(couponRef);
  
  if (!couponSnap.exists()) {
    return null;
  }
  
  return { id: couponSnap.id, ...couponSnap.data() } as Coupon;
};

/**
 * Get a coupon by its code
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  const q = query(couponsCollection, where('code', '==', code.toUpperCase()));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const couponDoc = querySnapshot.docs[0];
  return { id: couponDoc.id, ...couponDoc.data() } as Coupon;
};

/**
 * Update a coupon
 */
export const updateCoupon = async (
  couponId: string, 
  couponData: Partial<Omit<Coupon, 'id' | 'communityId' | 'usedCount' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const couponRef = doc(db, 'coupons', couponId);
  await updateDoc(couponRef, {
    ...couponData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Deactivate a coupon
 */
export const deactivateCoupon = async (couponId: string): Promise<void> => {
  const couponRef = doc(db, 'coupons', couponId);
  await updateDoc(couponRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  await deleteDoc(doc(db, 'coupons', couponId));
};

/**
 * Validate a coupon code for a specific community and user
 * Returns the coupon if valid, null if invalid
 */
export const validateCoupon = async (
  code: string, 
  communityId: string, 
  userId: string
): Promise<{ valid: boolean; coupon: Coupon | null; message: string }> => {
  // Get the coupon by code
  const coupon = await getCouponByCode(code);
  
  // Check if coupon exists
  if (!coupon) {
    return { valid: false, coupon: null, message: 'Invalid coupon code' };
  }
  
  // Check if coupon belongs to the specified community
  if (coupon.communityId !== communityId) {
    return { valid: false, coupon: null, message: 'Coupon not valid for this community' };
  }
  
  // Check if coupon is active
  if (!coupon.isActive) {
    return { valid: false, coupon: null, message: 'Coupon is no longer active' };
  }
  
  // Check if coupon has expired
  const now = Timestamp.now();
  if (coupon.expiresAt && coupon.expiresAt.seconds < now.seconds) {
    return { valid: false, coupon: null, message: 'Coupon has expired' };
  }
  
  // Check if coupon has reached max uses
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, coupon: null, message: 'Coupon has reached maximum uses' };
  }
  
  // Check if user has already used this coupon
  const userUsage = await getUserCouponUsage(coupon.id, userId);
  if (userUsage) {
    return { valid: false, coupon: null, message: 'You have already used this coupon' };
  }
  
  return { valid: true, coupon, message: 'Coupon is valid' };
};

/**
 * Apply a coupon for a user joining a community
 */
export const applyCoupon = async (
  couponId: string, 
  userId: string, 
  communityId: string, 
  tierId: string,
  originalPrice: number
): Promise<CouponUsage> => {
  // Get the coupon
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new Error('Coupon not found');
  }
  
  // Validate the coupon
  const validation = await validateCoupon(coupon.code, communityId, userId);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  // Calculate discount amount
  const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
  
  // Create coupon usage record
  const newUsage = {
    couponId,
    userId,
    communityId,
    tierId,
    discountAmount,
    usedAt: serverTimestamp()
  };
  
  // Increment coupon usage count
  const couponRef = doc(db, 'coupons', couponId);
  await updateDoc(couponRef, {
    usedCount: increment(1),
    updatedAt: serverTimestamp()
  });
  
  // Save usage record
  const docRef = await addDoc(couponUsagesCollection, newUsage);
  return { 
    id: docRef.id, 
    ...newUsage, 
    usedAt: Timestamp.now() 
  } as CouponUsage;
};

/**
 * Get a user's coupon usage for a specific coupon
 */
export const getUserCouponUsage = async (couponId: string, userId: string): Promise<CouponUsage | null> => {
  const q = query(
    couponUsagesCollection, 
    where('couponId', '==', couponId),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const usageDoc = querySnapshot.docs[0];
  return { id: usageDoc.id, ...usageDoc.data() } as CouponUsage;
};

/**
 * Get all coupon usages for a community
 */
export const getCouponUsagesByCommunityId = async (communityId: string): Promise<CouponUsage[]> => {
  const q = query(couponUsagesCollection, where('communityId', '==', communityId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CouponUsage);
};

/**
 * Generate a random coupon code
 */
const generateCouponCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like O, 0, I, 1
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
