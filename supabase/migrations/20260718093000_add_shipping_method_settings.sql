-- Checkout shipping methods managed by Max Bearings administrators.
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  free_shipping_threshold DECIMAL(10, 2) CHECK (free_shipping_threshold >= 0),
  estimated_delivery VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.shipping_methods (code, name, description, price, free_shipping_threshold, estimated_delivery, display_order, is_active)
VALUES
  ('standard', 'Standard Shipping', 'Reliable delivery for most bearing orders.', 9.99, 50.00, '5–7 business days', 10, true),
  ('express', 'Express Shipping', 'Priority delivery for time-sensitive requirements.', 19.99, NULL, '2–3 business days', 20, true),
  ('overnight', 'Overnight Shipping', 'Next-business-day delivery where available.', 39.99, NULL, 'Next business day', 30, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping methods are publicly viewable"
  ON public.shipping_methods FOR SELECT
  USING (is_active = true);

CREATE POLICY "Administrators can view all shipping methods"
  ON public.shipping_methods FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Administrators can update shipping methods"
  ON public.shipping_methods FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
