-- Customer-visible payment availability and per-product quote mode.
CREATE TABLE IF NOT EXISTS public.payment_methods (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.payment_methods (code, name, description, is_active, display_order)
VALUES
  ('card', 'Card Payment', 'Pay securely online by card.', true, 10),
  ('cash-on-delivery', 'Cash on Delivery', 'Pay when your order is delivered.', false, 20),
  ('bank-transfer', 'Bank Transfer', 'Place the order now; payment instructions will be provided.', false, 30)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.product_pricing_settings (
  product_id TEXT PRIMARY KEY,
  purchase_mode VARCHAR(10) NOT NULL DEFAULT 'price' CHECK (purchase_mode IN ('price', 'quote')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment methods are publicly viewable" ON public.payment_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Administrators can view all payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Administrators can update payment methods" ON public.payment_methods FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Product pricing settings are publicly viewable" ON public.product_pricing_settings FOR SELECT USING (true);
CREATE POLICY "Administrators can create product pricing settings" ON public.product_pricing_settings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Administrators can update product pricing settings" ON public.product_pricing_settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('credit-card', 'debit-card', 'paypal', 'bank-transfer', 'cash-on-delivery'));
