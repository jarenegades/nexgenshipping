import { supabase } from './supabaseClient';
import { publicAnonKey, supabaseUrl } from './supabase/info';

const SUPABASE_URL = supabaseUrl;
const ADMIN_ORDERS_URL = `${SUPABASE_URL}/functions/v1/admin-orders`;
const PROCESS_REFUND_URL = `${SUPABASE_URL}/functions/v1/process-refund`;

export interface AdminOrderRecord {
  id: string;
  order_number: string;
  created_at: string;
  status: 'processing' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_transaction_id: string | null;
  total: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  shipping_method: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  shipping_full_name: string;
  shipping_email: string;
  shipping_phone: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('Admin session not found');
  }

  return {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'Authorization': `Bearer ${accessToken}`,
  };
}

export const adminOrdersService = {
  async getAll(): Promise<AdminOrderRecord[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(ADMIN_ORDERS_URL, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to load admin orders');
    }

    const data = await response.json();
    return data.orders || [];
  },

  async updateOrder(orderId: string, updates: {
    status?: AdminOrderRecord['status'];
    tracking_number?: string | null;
    estimated_delivery?: string | null;
  }): Promise<AdminOrderRecord> {
    const headers = await getAuthHeaders();
    const response = await fetch(ADMIN_ORDERS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'update-order', orderId, ...updates }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update order');
    }

    const data = await response.json();
    return data.order;
  },

  async processRefund(orderId: string): Promise<AdminOrderRecord> {
    const headers = await getAuthHeaders();
    const response = await fetch(PROCESS_REFUND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process refund');
    }

    const data = await response.json();
    return data.order;
  },
};
