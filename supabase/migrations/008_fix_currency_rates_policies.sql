-- Currency rates are public to read, but only administrators may change them.

DROP POLICY IF EXISTS "authenticated_insert_currency_rates" ON public.currency_rates;
DROP POLICY IF EXISTS "authenticated_update_currency_rates" ON public.currency_rates;
DROP POLICY IF EXISTS "admin_manage_currency_rates" ON public.currency_rates;
DROP POLICY IF EXISTS "admin_update_currency_rates" ON public.currency_rates;

CREATE POLICY "Admins can manage currency rates"
ON public.currency_rates FOR ALL
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
