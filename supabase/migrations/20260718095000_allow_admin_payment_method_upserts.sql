CREATE POLICY "Administrators can create payment methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
