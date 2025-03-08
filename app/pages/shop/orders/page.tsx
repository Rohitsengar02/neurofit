'use client';
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiMapPin, FiShoppingBag, FiCheck, FiX, FiTruck, FiShoppingCart, FiDollarSign, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderStatusEvent {
  status: string;
  timestamp: number;
  message: string;
  reason?: string;
  comments?: string;
  details?: {
    items?: number;
    total?: number;
    paymentMethod?: string;
  };
}

interface OrderItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  totalItemPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  orderSummary: {
    subtotal: number;
    discount: number;
    totalAmount: number;
    itemCount: number;
  };
  orderStatus: {
    current: string;
    history: OrderStatusEvent[];
    estimatedDelivery?: number;
    lastUpdated: number;
  };
  metadata: {
    orderId: string;
    createdAt: number;
    updatedAt: number;
  };
}

export default function OrdersPage() {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getValidTimestamp = (timestamp: number | undefined): number => {
    if (!timestamp) return 0;
    
    try {
      // Convert to string to check length (Unix timestamp vs milliseconds)
      const timestampStr = timestamp.toString();
      // If it's a Unix timestamp (10 digits), convert to milliseconds
      if (timestampStr.length === 10) {
        return timestamp * 1000;
      }
      // If it's already in milliseconds (13 digits) or any other value, return as is
      return timestamp;
    } catch (error) {
      console.error('Error converting timestamp:', error);
      return 0;
    }
  };

  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const validTime = getValidTimestamp(timestamp);
      if (validTime === 0) return 'N/A';
      
      // Create a new Date object and validate it
      const date = new Date(validTime);
      if (isNaN(date.getTime())) return 'N/A';
      
      return format(date, 'PP');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'N/A';
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('customerInfo.uid', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Sort orders client-side with safe timestamp handling
      ordersList.sort((a, b) => {
        const timeA = getValidTimestamp(a.metadata?.createdAt);
        const timeB = getValidTimestamp(b.metadata?.createdAt);
        return timeB - timeA;
      });

      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-500">
            <FiClock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-500">
            <FiPackage className="mr-1 h-3 w-3" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-500">
            <FiTruck className="mr-1 h-3 w-3" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-500">
            <FiCheck className="mr-1 h-3 w-3" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <FiX className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <FiPackage className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/pages/shop/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
          {/* Filter/Sort Options - Can be implemented later */}
          <div className="flex space-x-2">
            <select 
              className="hidden sm:block rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              defaultValue="all"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-sm text-gray-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="rounded-full bg-gray-100 h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Looks like you haven't placed any orders. Start shopping to see your orders here.
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiShoppingCart className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
                  order.orderStatus?.current === 'cancelled' ? 'border-l-4 border-red-500' : ''
                }`}
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="p-4 sm:p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          Order #{order.metadata?.orderId || 'Unknown'}
                        </span>
                        {getStatusBadge(order.orderStatus?.current || 'unknown')}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Placed on {formatTimestamp(order.metadata?.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end">
                      <div className="sm:order-2">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          ₹{order.orderSummary.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 sm:order-1 sm:mb-1">
                        {order.orderSummary.itemCount} items
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex-none">
                          <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.mainImage}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs text-center py-0.5">
                              x{item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-none w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Notice */}
                  {order.orderStatus?.current === 'cancelled' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <div className="flex items-start">
                        <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="ml-2">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Cancelled:</span>{' '}
                            {order.orderStatus?.history?.find(h => h.status === 'cancelled')?.reason || 'Order was cancelled'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiClock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500">
                          {order.orderStatus?.current === 'cancelled'
                            ? 'Cancelled on ' + formatTimestamp(order.orderStatus?.history?.find(h => h.status === 'cancelled')?.timestamp)
                            : order.orderStatus?.estimatedDelivery
                            ? 'Est. delivery: ' + formatTimestamp(order.orderStatus?.estimatedDelivery)
                            : 'Processing'}
                        </span>
                      </div>
                      <button 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order.id);
                        }}
                      >
                        Details
                        <FiChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
