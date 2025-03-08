import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PaymentDetails {
  planName: string;
  amount: number;
  paymentMethod: string;
  userId: string;
}

interface OrderDetails {
  orderId: string;
  userId: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  statusHistory: {
    status: string;
    timestamp: Date;
  }[];
  paymentInfo: {
    transactionId: string;
    paymentStatus: string;
    timestamp: Date;
  };
  customerContact: {
    email: string;
    phone?: string;
  };
}

export const processPayment = async (
  paymentDetails: PaymentDetails,
  userEmail: string
): Promise<OrderDetails> => {
  try {
    // Create a new order in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: paymentDetails.userId,
      planName: paymentDetails.planName,
      amount: paymentDetails.amount,
      paymentMethod: paymentDetails.paymentMethod,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: serverTimestamp()
        }
      ],
      paymentInfo: {
        transactionId: `TXN_${Date.now()}`,
        paymentStatus: 'initiated',
        timestamp: serverTimestamp()
      },
      customerContact: {
        email: userEmail
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Simulate payment gateway integration
    // In production, this would integrate with actual payment gateways
    const processPaymentGateway = async () => {
      switch (paymentDetails.paymentMethod) {
        case 'phonepe':
          // Integrate PhonePe API
          return { success: true, transactionId: `PHONEPE_${Date.now()}` };
        case 'paytm':
          // Integrate Paytm API
          return { success: true, transactionId: `PAYTM_${Date.now()}` };
        case 'googlepay':
          // Integrate Google Pay API
          return { success: true, transactionId: `GPAY_${Date.now()}` };
        case 'paypal':
          // Integrate PayPal API
          return { success: true, transactionId: `PAYPAL_${Date.now()}` };
        default:
          throw new Error('Invalid payment method');
      }
    };

    // Process payment through gateway
    const paymentResult = await processPaymentGateway();

    if (paymentResult.success) {
      // Update order status to processing
      await orderRef.update({
        status: 'processing',
        statusHistory: [
          ...orderRef.data().statusHistory,
          {
            status: 'processing',
            timestamp: serverTimestamp()
          }
        ],
        'paymentInfo.paymentStatus': 'completed',
        'paymentInfo.transactionId': paymentResult.transactionId,
        updatedAt: serverTimestamp()
      });

      return {
        orderId: orderRef.id,
        ...paymentDetails,
        status: 'processing',
        statusHistory: [
          {
            status: 'processing',
            timestamp: new Date()
          }
        ],
        paymentInfo: {
          transactionId: paymentResult.transactionId,
          paymentStatus: 'completed',
          timestamp: new Date()
        },
        customerContact: {
          email: userEmail
        }
      };
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

export const getOrderStatus = async (orderId: string): Promise<string> => {
  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }
    return orderDoc.data()?.status || 'unknown';
  } catch (error) {
    console.error('Error fetching order status:', error);
    throw error;
  }
};

export const cancelOrder = async (
  orderId: string,
  userId: string,
  reason: string,
  comments?: string
): Promise<void> => {
  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const orderData = orderDoc.data();
    if (orderData?.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    if (!['pending', 'processing'].includes(orderData?.status)) {
      throw new Error('Order cannot be cancelled in current status');
    }

    await orderRef.update({
      status: 'cancelled',
      statusHistory: [
        ...orderData?.statusHistory,
        {
          status: 'cancelled',
          timestamp: serverTimestamp()
        }
      ],
      cancellation: {
        reason,
        comments,
        timestamp: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};
