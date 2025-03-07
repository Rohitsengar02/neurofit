'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, addDoc } from 'firebase/firestore';
import { FiShoppingBag, FiMapPin, FiCreditCard, FiCheck, FiPercent, FiChevronRight } from 'react-icons/fi';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface CartItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}

interface Product {
  id: string;
  mainImage: string;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Coupon {
  code: string;
  discount: number;
}

const CheckoutPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [step, setStep] = useState<'cart' | 'address' | 'payment'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    // Set default address if available
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }
  }, [addresses]);

  const fetchCartItems = async () => {
    if (!user) return;
    try {
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const snapshot = await getDocs(cartRef);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CartItem));
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items');
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      const snapshot = await getDocs(addressesRef);
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressList);
    } catch (error) {
      toast.error('Failed to fetch addresses');
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode) return;
    setLoading(true);
    try {
      // Fetch coupon from Firestore
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const couponData = snapshot.docs[0].data() as Coupon;
        setAppliedCoupon(couponData);
        toast.success('Coupon applied successfully!');
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.discountedPrice * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return (calculateSubtotal() * appliedCoupon.discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleProceedToAddress = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setStep('address');
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || !paymentMethod) return;

    try {
      setLoading(true);
      const selectedAddr = addresses.find(addr => addr.id === selectedAddress);

      // Get user details
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      // Create comprehensive order data
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          mainImage: item.mainImage,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          totalItemPrice: item.discountedPrice * item.quantity
        })),
        orderSummary: {
          subtotal: calculateSubtotal(),
          discount: calculateDiscount(),
          totalAmount: calculateTotal(),
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        },
        address: {
          id: selectedAddr?.id,
          name: selectedAddr?.name,
          phone: selectedAddr?.phoneNumber,
          street: selectedAddr?.addressLine1,
          city: selectedAddr?.city,
          state: selectedAddr?.state,
          pincode: selectedAddr?.pincode,
          isDefault: selectedAddr?.isDefault
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'Cash on Delivery' ? 'pending' : 'not_initiated',
          timestamp: Date.now()
        },
        couponApplied: appliedCoupon ? {
          code: appliedCoupon.code,
          discount: appliedCoupon.discount,
          discountAmount: calculateDiscount()
        } : null,
        orderStatus: {
          current: 'pending',
          history: [{
            status: 'pending',
            timestamp: Date.now(),
            message: 'Order placed successfully',
            details: {
              items: cartItems.length,
              total: calculateTotal(),
              paymentMethod: paymentMethod
            }
          }],
          estimatedDelivery: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
          lastUpdated: Date.now()
        },
        customerInfo: {
          uid: user.uid,
          email: user.email,
          name: userData?.displayName || user.displayName,
          phone: selectedAddr?.phoneNumber,
          profileImage: userData?.photoURL || user.photoURL
        },
        metadata: {
          orderId: `ORD${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(7)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          platform: 'web',
          userAgent: window.navigator.userAgent
        }
      };

      // Create order in main orders collection
      const ordersRef = collection(db, 'orders');
      const newOrderDoc = await addDoc(ordersRef, orderData);

      // Update order with ID
      await updateDoc(doc(db, 'orders', newOrderDoc.id), {
        'metadata.orderId': `ORD${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(7)}`
      });

      // Clear cart after successful order
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const cartSnapshot = await getDocs(cartRef);
      const deletePromises = cartSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      toast.success('Order placed successfully!');
      router.push('/pages/shop/thankyou');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                animate={{
                  backgroundColor: step === 'cart' ? '#8B5CF6' : '#D1D5DB',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              >
                <FiShoppingBag />
              </motion.div>
              <div className="ml-2">Cart</div>
            </div>
            <div className="h-0.5 w-16 bg-gray-200" />
            <div className="flex items-center">
              <motion.div
                animate={{
                  backgroundColor: step === 'address' ? '#8B5CF6' : '#D1D5DB',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              >
                <FiMapPin />
              </motion.div>
              <div className="ml-2">Address</div>
            </div>
            <div className="h-0.5 w-16 bg-gray-200" />
            <div className="flex items-center">
              <motion.div
                animate={{
                  backgroundColor: step === 'payment' ? '#8B5CF6' : '#D1D5DB',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              >
                <FiCreditCard />
              </motion.div>
              <div className="ml-2">Payment</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Cart Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiShoppingBag className="mr-2" />
                    Your Cart
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                      >
                        {/* Product Image */}
                        <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                          {item.mainImage ? (
                            <Image
                              src={item.mainImage}
                              alt={item.name}
                              fill
                              className="object-cover transition-opacity duration-200"
                              sizes="(max-width: 640px) 100vw, 96px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <FiShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                              Quantity: {item.quantity}
                            </span>
                            <span className="inline-block w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-200" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                              ₹{item.discountedPrice} per item
                            </span>
                            {item.price > item.discountedPrice && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="w-full sm:w-auto flex items-center justify-between sm:block text-right">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                            ₹{item.discountedPrice * item.quantity}
                          </span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full transition-colors duration-200"
                          >
                            {item.quantity > 1 ? `${item.quantity} items` : '1 item'}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300 transition-colors duration-200">
                        <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                        <span>₹{calculateSubtotal()}</span>
                      </div>
                      {appliedCoupon && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between text-green-600 dark:text-green-400 transition-colors duration-200"
                        >
                          <span className="flex items-center">
                            <FiPercent className="mr-1" />
                            Discount ({appliedCoupon.discount}% off)
                          </span>
                          <span>-₹{calculateDiscount()}</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Total Amount</span>
                        <motion.span
                          key={calculateTotal()}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-200"
                        >
                          ₹{calculateTotal()}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
                <div className="p-6 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-800">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiPercent className="mr-2" />
                    Apply Coupon
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCouponApply}
                      disabled={loading || !couponCode}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
                        loading || !couponCode
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-800 text-white hover:shadow-lg'
                      }`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiPercent />
                          <span>Apply Coupon</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center justify-between transition-colors duration-200"
                    >
                      <div className="flex items-center text-green-700 dark:text-green-400">
                        <FiCheck className="mr-2" />
                        <span>Coupon applied successfully!</span>
                      </div>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {appliedCoupon.discount}% OFF
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Proceed Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToAddress}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white py-4 rounded-lg font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Proceed to Address</span>
                <FiChevronRight />
              </motion.button>
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Select Delivery Address</h2>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                        selectedAddress === address.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium capitalize">{address.type} Address</h3>
                          <p className="text-gray-600 dark:text-gray-400">{address.name}</p>
                          <p className="text-gray-600 dark:text-gray-400">{address.phoneNumber}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        {selectedAddress === address.id && (
                          <FiCheck className="text-purple-600 w-6 h-6" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToPayment}
                  className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <FiChevronRight />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiCreditCard className="mr-2" />
                    Payment Method
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500'
                      }`}
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FaMoneyBillWave className="w-6 h-6 text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                        </div>
                        {paymentMethod === 'Cash on Delivery' && (
                          <FiCheck className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                    </div>

                    {/* Other payment methods (disabled for now) */}
                    {[
                      { icon: SiPhonepe, name: 'PhonePe', color: 'text-indigo-500' },
                      { icon: SiGooglepay, name: 'Google Pay', color: 'text-blue-500' },
                      { icon: SiPaytm, name: 'Paytm', color: 'text-blue-600' }
                    ].map(({ icon: Icon, name, color }) => (
                      <div
                        key={name}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-6 h-6 ${color}`} />
                          <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">(Coming Soon)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={!paymentMethod || loading}
                className={`w-full py-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                  loading || !paymentMethod
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Place Order</span>
                    <FiCheck />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;
