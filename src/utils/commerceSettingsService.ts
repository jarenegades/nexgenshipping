import { supabase } from './supabaseClient';

export type PaymentMethodCode = 'card' | 'cash-on-delivery' | 'bank-transfer';
export interface PaymentMethodSetting { code: PaymentMethodCode; name: string; description?: string | null; is_active: boolean; display_order: number; }
export interface ProductPricingSetting { product_id: string; purchase_mode: 'price' | 'quote'; }

const paymentFallback: PaymentMethodSetting[] = [{ code: 'card', name: 'Card Payment', description: 'Pay securely online by card.', is_active: true, display_order: 10 }];

export const commerceSettingsService = {
  async getActivePaymentMethods(): Promise<PaymentMethodSetting[]> {
    if (!supabase) return paymentFallback;
    const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('display_order');
    if (error) throw error;
    return (data || []) as PaymentMethodSetting[];
  },
  async getAllPaymentMethods(): Promise<PaymentMethodSetting[]> {
    const { data, error } = await supabase.from('payment_methods').select('*').order('display_order');
    if (error) throw error;
    return (data || []) as PaymentMethodSetting[];
  },
  async savePaymentMethods(methods: PaymentMethodSetting[]) {
    const { error } = await supabase.from('payment_methods').upsert(methods.map((method) => ({ ...method, updated_at: new Date().toISOString() })), { onConflict: 'code' });
    if (error) throw error;
  },
  async getPricingSettings(): Promise<ProductPricingSetting[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('product_pricing_settings').select('product_id,purchase_mode');
    if (error) throw error;
    return (data || []) as ProductPricingSetting[];
  },
  async setProductPurchaseMode(productId: string, purchaseMode: 'price' | 'quote') {
    const { error } = await supabase.from('product_pricing_settings').upsert({ product_id: productId, purchase_mode: purchaseMode, updated_at: new Date().toISOString() }, { onConflict: 'product_id' });
    if (error) throw error;
  },
  async setProductPurchaseModes(productIds: string[], purchaseMode: 'price' | 'quote') {
    if (productIds.length === 0) return;
    const { error } = await supabase
      .from('product_pricing_settings')
      .upsert(productIds.map((product_id) => ({ product_id, purchase_mode: purchaseMode, updated_at: new Date().toISOString() })), { onConflict: 'product_id' });
    if (error) throw error;
  },
};
