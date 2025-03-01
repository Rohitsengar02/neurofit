'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { FiPackage, FiClock, FiMapPin, FiCheck, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Timestamp;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'confirmed':
      return 'text-blue-500 dark:text-blue-400';
    case 'shipped':
      return 'text-purple-500 dark:text-purple-400';
    case 'delivered':
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <FiClock className="w-5 h-5" />;
    case 'confirmed':
      return <FiCheck className="w-5 h-5" />;
    case 'shipped':
      return <FiTruck className="w-5 h-5" />;
    case 'delivered':
      return <FiPackage className="w-5 h-5" />;
    default:
      return <FiClock className="w-5 h-5" />;
  }
};

export default function OrdersPage() {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const ordersRef = collection(db, `users/${user.uid}/orders`);
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>
        
        <div className="space-y-6">
          <AnimatePresence>
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
              >
                <FiPackage className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No orders found</p>
              </motion.div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-white text-sm">Order #{order.id.slice(-8)}</p>
                        <p className="text-purple-100 text-sm mt-1">
                          {order.createdAt.toDate().toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <motion.div
                          key={item.id}
                          className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          layout
                        >
                          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <Image
                              src={item.mainImage}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{item.discountedPrice.toLocaleString()}
                              </span>
                              {item.price > item.discountedPrice && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                  ₹{item.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delivery Address</h4>
                          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                              {order.address.street}<br />
                              {order.address.city}, {order.address.state}<br />
                              {order.address.pincode}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Payment Details</h4>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p>Payment Method: {order.paymentMethod}</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Total Amount: ₹{order.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
