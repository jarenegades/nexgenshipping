import { publicAnonKey, supabaseUrl } from './supabase/info';

const SUPABASE_URL = supabaseUrl;
const ORDER_NOTIFICATION_URL = `${SUPABASE_URL}/functions/v1/send-order-notifications`;

export interface OrderNotificationPayload {
  userId: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  currency: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    method: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
    categoryId?: string;
    subcategoryId?: string;
  }>;
}

export const orderNotificationService = {
  async sendOrderCompleteNotifications(payload: OrderNotificationPayload): Promise<void> {
    const response = await fetch(ORDER_NOTIFICATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': publicAnonKey,
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send order notifications';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore malformed error responses and fall back to the default message.
      }

      throw new Error(errorMessage);
    }
  },
};
