-- Final security hardening for the Max Bearings production database.

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inventory transactions"
ON public.inventory_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- The catalog uses public object URLs, so clients do not need permission to list
-- the full bucket.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Keep internal analytics out of the exposed Data API.
REVOKE ALL ON public.product_sales_analytics FROM anon, authenticated;

-- Trigger functions must retain elevated rights for review aggregation, but they
-- are not callable as public RPC endpoints.
ALTER FUNCTION public.update_product_rating() SET search_path = public, extensions;
REVOKE EXECUTE ON FUNCTION public.update_product_rating() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;
ALTER FUNCTION public.update_product_search_vector() SET search_path = public, extensions;
ALTER FUNCTION public.update_inventory_on_order() SET search_path = public, extensions;
ALTER FUNCTION public.generate_order_number() SET search_path = public, extensions;
ALTER FUNCTION public.get_cart_total(UUID) SET search_path = public, extensions;
ALTER FUNCTION public.search_products(TEXT, TEXT) SET search_path = public, extensions;
ALTER FUNCTION private.prevent_customer_admin_changes() SET search_path = public, extensions;
