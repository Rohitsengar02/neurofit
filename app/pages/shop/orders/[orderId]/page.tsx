'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiClock, FiMapPin, FiAlertCircle, FiCheck, FiX, FiTruck } from 'react-icons/fi';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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

interface Order {
  id: string;
  items: {
    id: string;
    name: string;
    mainImage: string;
    price: number;
    discountedPrice: number;
    quantity: number;
    totalItemPrice: number;
  }[];
  orderSummary: {
    subtotal: number;
    discount: number;
    totalAmount: number;
    itemCount: number;
  };
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment: {
    method: string;
    status: string;
    timestamp: number;
  };
  orderStatus: {
    current: string;
    history: OrderStatusEvent[];
    estimatedDelivery?: number;
    lastUpdated: number;
  };
  customerInfo: {
    uid: string;
    email: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  metadata: {
    orderId: string;
    createdAt: number;
    updatedAt: number;
    platform: string;
    userAgent: string;
  };
}

const cancellationReasons = [
  {
    id: 'changed_mind',
    title: 'Changed my mind',
    description: 'I no longer want/need this product',
    suggestion: 'Consider saving the item for later or exploring similar products'
  },
  {
    id: 'found_better_price',
    title: 'Found better price elsewhere',
    description: 'Found the same product at a lower price',
    suggestion: 'We value your feedback and will consider price matching in the future'
  },
  {
    id: 'delivery_time',
    title: 'Delivery time too long',
    description: 'Expected delivery time is longer than anticipated',
    suggestion: 'Check our express delivery options for faster shipping'
  },
  {
    id: 'ordered_wrong',
    title: 'Ordered wrong item',
    description: 'Made a mistake while ordering',
    suggestion: 'Double-check product details before placing a new order'
  },
  {
    id: 'other',
    title: 'Other reason',
    description: 'Other reason not listed above',
    suggestion: 'Please provide additional details to help us improve'
  }
];

export default function OrderDetailPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId as string));
      if (!orderDoc.exists()) {
        toast.error('Order not found');
        router.push('/shop/orders');
        return;
      }

      const orderData = orderDoc.data() as Omit<Order, 'id'>;
      if (orderData.customerInfo.uid !== user?.uid) {
        toast.error('Unauthorized access');
        router.push('/shop/orders');
        return;
      }

      setOrder({
        id: orderDoc.id,
        ...orderData
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
      router.push('/shop/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialCancel = () => {
    if (order?.orderStatus.current !== 'pending') {
      toast.error('Only pending orders can be cancelled');
      return;
    }
    setShowCancelModal(true);
  };

  const handleReasonSubmit = () => {
    setShowCancelModal(false);
    setShowConfirmCancel(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirmCancel(false);
    await handleCancelOrder();
  };

  const handleCancelOrder = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    if (!order) {
      toast.error('Order not found');
      return;
    }

    try {
      setCancelling(true);
      const orderRef = doc(db, 'orders', orderId as string);
      
      const newStatusEvent: OrderStatusEvent = {
        status: 'cancelled',
        timestamp: Date.now(),
        message: 'Order cancelled by customer',
        reason: selectedReason,
        comments: additionalComments || '',
        details: {
          items: order.orderSummary.itemCount,
          total: order.orderSummary.totalAmount
        }
      };

      const updatedHistory = [...order.orderStatus.history, newStatusEvent];

      await updateDoc(orderRef, {
        'orderStatus.current': 'cancelled',
        'orderStatus.history': updatedHistory,
        'orderStatus.lastUpdated': Date.now(),
        'metadata.updatedAt': Date.now()
      });

      // Show success popup with order details
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <FiCheck className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Order Cancelled Successfully
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Order #{order.metadata.orderId} has been cancelled.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Reason: {selectedReason}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });

      setShowCancelModal(false);
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const CancellationModal = () => (
    <AnimatePresence>
      {showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-xl w-full mx-4 my-20 sm:my-4 max-h-[calc(100vh-8rem)] overflow-y-auto mb-20 sm:mb-0"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-500 p-2 -mr-2"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select a reason for cancellation
              </label>
              <div className="space-y-3">
                {cancellationReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-200'
                    }`}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {reason.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {reason.description}
                        </p>
                      </div>
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedReason === reason.id
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedReason === reason.id && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    {selectedReason === reason.id && reason.suggestion && (
                      <div className="mt-3 p-3 bg-white rounded border border-red-100">
                        <p className="text-sm text-gray-600 flex items-start">
                          <FiAlertCircle className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{reason.suggestion}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3"
                rows={3}
                placeholder="Please provide any additional details about your cancellation..."
              />
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Never mind
                </button>
                <button
                  onClick={handleReasonSubmit}
                  disabled={!selectedReason || cancelling}
                  className={`w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white rounded-md ${
                    !selectedReason || cancelling
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Continue to Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const CancelConfirmationModal = () => (
    <AnimatePresence>
      {showConfirmCancel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 my-20 sm:my-4 mb-20 sm:mb-0"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <FiAlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-center text-gray-900 mb-2">
              Cancel Order?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
              <button
                onClick={() => {
                  setShowConfirmCancel(false);
                  setShowCancelModal(true); // Go back to reason selection
                }}
                className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status.toLowerCase()) {
        case 'cancelled':
          return {
            icon: FiX,
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            label: 'Cancelled'
          };
        case 'delivered':
          return {
            icon: FiCheck,
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            label: 'Delivered'
          };
        case 'shipped':
          return {
            icon: FiTruck,
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            label: 'Shipped'
          };
        case 'processing':
          return {
            icon: FiClock,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            label: 'Processing'
          };
        default:
          return {
            icon: FiPackage,
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            label: status.charAt(0).toUpperCase() + status.slice(1)
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className="w-4 h-4 mr-1.5" />
        {config.label}
      </span>
    );
  };

  // Add Cancelled Order Banner
  const CancelledOrderBanner = () => (
    order?.orderStatus.current === 'cancelled' && (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 rounded-full p-2">
            <FiX className="h-5 w-5 text-red-400" />
          </div>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>
            This order was cancelled on{' '}
            {format(
              order.orderStatus.history.find(h => h.status === 'cancelled')?.timestamp || Date.now(),
              'PPpp'
            )}
          </p>
          <p className="mt-1">
            Reason:{' '}
            {order.orderStatus.history.find(h => h.status === 'cancelled')?.reason}
          </p>
          {order.orderStatus.history.find(h => h.status === 'cancelled')?.comments && (
            <p className="mt-1">
              Comments:{' '}
              {order.orderStatus.history.find(h => h.status === 'cancelled')?.comments}
            </p>
          )}
        </div>
      </div>
    )
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <CancelledOrderBanner />
      <CancelConfirmationModal />
      <CancellationModal />
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          {order.orderStatus.current === 'pending' && (
            <button
              onClick={handleInitialCancel}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Order Status and Tracking */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Order Tracking</h3>
            
            {/* Tracking Steps */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {[
                  { status: 'pending', label: 'Order Placed', icon: FiPackage },
                  { status: 'confirmed', label: 'Order Confirmed', icon: FiCheck },
                  { status: 'processing', label: 'Processing', icon: FiClock },
                  { status: 'shipped', label: 'Shipped', icon: FiTruck },
                  { status: 'delivered', label: 'Delivered', icon: FiCheck },
                  ...(order?.orderStatus.current === 'cancelled' ? [
                    { status: 'cancelled', label: 'Cancelled', icon: FiX }
                  ] : [])
                ].map((step, index) => {
                  const isCompleted = order.orderStatus.history.some(
                    (event: OrderStatusEvent) => event.status === step.status
                  );
                  const isCurrent = order.orderStatus.current === step.status;
                  
                  return (
                    <div key={step.status} className="relative flex items-start">
                      {/* Status Icon */}
                      <div className={`absolute left-0 w-16 flex justify-center ${index === 0 ? '' : 'mt-0.5'}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === 'cancelled'
                              ? 'bg-red-500 text-white'
                              : isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <step.icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Status Content */}
                      <div className="ml-16">
                        <h4 className={`text-sm font-medium ${
                          step.status === 'cancelled'
                            ? 'text-red-600'
                            : isCompleted
                            ? 'text-green-600'
                            : isCurrent
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h4>
                        {(isCompleted || isCurrent) && (
                          <div className="mt-1">
                            {order.orderStatus.history
                              .filter((event: OrderStatusEvent) => event.status === step.status)
                              .map((event: OrderStatusEvent, eventIndex: number) => (
                                <div key={eventIndex} className="text-sm text-gray-500">
                                  <p>{event.message}</p>
                                  {event.reason && (
                                    <p className="text-sm text-gray-600">
                                      Reason: {event.reason}
                                    </p>
                                  )}
                                  {event.comments && (
                                    <p className="text-sm text-gray-600">
                                      Comments: {event.comments}
                                    </p>
                                  )}
                                  <p className="text-xs">
                                    {format(event.timestamp, 'PPpp')}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.orderStatus.current !== 'cancelled' && order.orderStatus.current !== 'delivered' && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FiClock className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Estimated Delivery
                    </p>
                    <p className="text-sm text-blue-600">
                      {format(Date.now() + 7 * 24 * 60 * 60 * 1000, 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Instructions */}
            {order.orderStatus.current === 'shipped' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Delivery Instructions
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                      <li>Someone must be available to receive the package</li>
                      <li>Keep your phone handy for delivery updates</li>
                      <li>Have your order ID ready for verification</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Order Items</h3>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                      <Image
                        src={item.mainImage}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{item.discountedPrice.toFixed(2)}
                          </p>
                          {item.price !== item.discountedPrice && (
                            <p className="mt-1 text-sm text-gray-500 line-through">
                              ₹{item.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-gray-500">Price per item</p>
                          <p className="font-medium text-gray-900">₹{item.discountedPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <p className="text-gray-500">Subtotal</p>
                          <p className="font-medium text-gray-900">₹{item.totalItemPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{order.orderSummary.subtotal.toFixed(2)}</span>
                </div>
                {order.orderSummary.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">-₹{order.orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{order.orderSummary.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery and Payment */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Details</h3>
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.address.name}</p>
                    <p className="text-sm text-gray-500">
                      {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                    <p className="text-sm text-gray-500">{order.address.phone}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="flex items-center space-x-3">
                  <FiClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{order.payment.method}</p>
                    <p className="text-sm text-gray-500 capitalize">Status: {order.payment.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
