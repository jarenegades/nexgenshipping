import { supabase } from './supabaseClient';

export interface ShippingMethod {
  code: 'standard' | 'express' | 'overnight';
  name: string;
  description?: string | null;
  price: number;
  free_shipping_threshold?: number | null;
  estimated_delivery: string;
  display_order: number;
  is_active: boolean;
}

const fallbackMethods: ShippingMethod[] = [
  { code: 'standard', name: 'Standard Shipping', description: 'Reliable delivery for most bearing orders.', price: 9.99, free_shipping_threshold: 50, estimated_delivery: '5–7 business days', display_order: 10, is_active: true },
  { code: 'express', name: 'Express Shipping', description: 'Priority delivery for time-sensitive requirements.', price: 19.99, free_shipping_threshold: null, estimated_delivery: '2–3 business days', display_order: 20, is_active: true },
  { code: 'overnight', name: 'Overnight Shipping', description: 'Next-business-day delivery where available.', price: 39.99, free_shipping_threshold: null, estimated_delivery: 'Next business day', display_order: 30, is_active: true },
];

export const shippingMethodsService = {
  async getActive(): Promise<ShippingMethod[]> {
    if (!supabase) return fallbackMethods;
    const { data, error } = await supabase.from('shipping_methods').select('*').eq('is_active', true).order('display_order');
    if (error) throw error;
    return (data || []) as ShippingMethod[];
  },

  async getAll(): Promise<ShippingMethod[]> {
    const { data, error } = await supabase.from('shipping_methods').select('*').order('display_order');
    if (error) throw error;
    return (data || []) as ShippingMethod[];
  },

  async update(method: ShippingMethod) {
    const { data, error } = await supabase
      .from('shipping_methods')
      .update({
        name: method.name.trim(),
        description: method.description?.trim() || null,
        price: method.price,
        free_shipping_threshold: method.free_shipping_threshold,
        estimated_delivery: method.estimated_delivery.trim(),
        display_order: method.display_order,
        is_active: method.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('code', method.code)
      .select()
      .single();
    if (error) throw error;
    return data as ShippingMethod;
  },
};
