import { supabase } from './supabaseClient';
import { config } from './config';

/**
 * Order interface matching the database schema
 */
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'processing' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  shipping_method?: 'standard' | 'express' | 'overnight';
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  shipping_full_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method?: 'credit-card' | 'debit-card' | 'paypal' | 'bank-transfer' | 'cash-on-delivery';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

/**
 * Full order with items
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Orders Service - Handles all order operations with Supabase
 */
export const ordersService = {
  /**
   * Fetch all orders for a specific user
   */
  async getAllByUser(userId: string): Promise<OrderWithItems[]> {
    if (!config.useSupabase) {
      return [];
    }

    try {
      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Map to OrderWithItems interface
      return (orders || []).map(order => ({
        ...order,
        items: order.order_items || []
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get a single order by ID
   */
  async getById(orderId: string): Promise<OrderWithItems | null> {
    if (!config.useSupabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        items: data.order_items || []
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Get a single order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    if (!config.useSupabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        items: data.order_items || []
      };
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  async create(
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'> & { order_number?: string },
    items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
  ): Promise<OrderWithItems> {
    if (!config.useSupabase) {
      throw new Error('Supabase is not enabled');
    }

    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // Insert order items
      const itemsWithOrderId = items.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)
        .select();

      if (itemsError) throw itemsError;

      console.log('✅ Order created:', order.order_number);

      return {
        ...order,
        items: orderItems || []
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: Order['status']): Promise<Order> {
    if (!config.useSupabase) {
      throw new Error('Supabase is not enabled');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Order not found');

      console.log('✅ Order status updated:', orderId, status);
      return data;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Update tracking information
   */
  async updateTracking(orderId: string, trackingNumber: string, estimatedDelivery?: string): Promise<Order> {
    if (!config.useSupabase) {
      throw new Error('Supabase is not enabled');
    }

    try {
      const updateData: any = {
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString()
      };

      if (estimatedDelivery) {
        updateData.estimated_delivery = estimatedDelivery;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Order not found');

      console.log('✅ Order tracking updated:', orderId);
      return data;
    } catch (error) {
      console.error('❌ Error updating tracking:', error);
      throw error;
    }
  },

  /**
   * Cancel an order
   */
  async cancel(orderId: string): Promise<Order> {
    return this.updateStatus(orderId, 'cancelled');
  },

  /**
   * Get order statistics for a user
   */
  async getStats(userId: string): Promise<{
    total: number;
    processing: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  }> {
    if (!config.useSupabase) {
      return { total: 0, processing: 0, inTransit: 0, delivered: 0, cancelled: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        processing: data?.filter(o => o.status === 'processing' || o.status === 'confirmed').length || 0,
        inTransit: data?.filter(o => o.status === 'in-transit').length || 0,
        delivered: data?.filter(o => o.status === 'delivered').length || 0,
        cancelled: data?.filter(o => o.status === 'cancelled' || o.status === 'refunded').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  /**
   * Generate a unique order number
   */
  generateOrderNumber(): string {
    const prefix = 'NG';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}-${year}-${random}`;
  }
};
