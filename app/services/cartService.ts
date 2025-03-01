import { db, auth } from '@/app/firebase/config';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';

export interface CartItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  addedAt: number;
}

class CartService {
  private getUserCartRef(userId: string) {
    return collection(db, `users/${userId}/cart`);
  }

  async addToCart(userId: string, item: Omit<CartItem, 'addedAt'>) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!item.id) {
      throw new Error('Item ID is required');
    }

    const cartRef = this.getUserCartRef(userId);
    const itemRef = doc(cartRef, item.id);
    
    await setDoc(itemRef, {
      ...item,
      addedAt: Date.now()
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartRef = this.getUserCartRef(userId);
    const itemRef = doc(cartRef, itemId);
    await deleteDoc(itemRef);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const cartRef = this.getUserCartRef(userId);
    const itemRef = doc(cartRef, itemId);
    
    if (quantity <= 0) {
      await this.removeFromCart(userId, itemId);
    } else {
      await setDoc(itemRef, { quantity }, { merge: true });
    }
  }

  subscribeToCart(userId: string, callback: (items: CartItem[]) => void) {
    const cartRef = this.getUserCartRef(userId);
    
    return onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CartItem[];
      
      // Sort by added time
      items.sort((a, b) => b.addedAt - a.addedAt);
      callback(items);
    });
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cartRef = this.getUserCartRef(userId);
    const snapshot = await getDocs(cartRef);
    
    const items = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as CartItem[];
    
    // Sort by added time
    return items.sort((a, b) => b.addedAt - a.addedAt);
  }
}

export const cartService = new CartService();
