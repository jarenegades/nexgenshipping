-- Admin-managed storefront categories for Max Bearings.
-- The public may read active categories; only an authenticated administrator
-- may create, edit, or archive them.

INSERT INTO public.categories (id, name, slug, description, parent_id, display_order, is_active)
VALUES
  ('pharmaceutical', 'Rolling Bearings', 'rolling-bearings', 'Ball and roller bearings for industrial machinery.', NULL, 10, true),
  ('baby', 'Mounted & Linear Units', 'mounted-linear-units', 'Mounted bearing units, linear motion components, housings and seals.', NULL, 20, true),
  ('deep-groove-ball-bearings', 'Deep Groove Ball Bearings', 'deep-groove-ball-bearings', NULL, 'pharmaceutical', 10, true),
  ('angular-contact-ball-bearings', 'Angular Contact Ball Bearings', 'angular-contact-ball-bearings', NULL, 'pharmaceutical', 20, true),
  ('self-aligning-ball-bearings', 'Self-Aligning Ball Bearings', 'self-aligning-ball-bearings', NULL, 'pharmaceutical', 30, true),
  ('spherical-roller-bearings', 'Spherical Roller Bearings', 'spherical-roller-bearings', NULL, 'pharmaceutical', 40, true),
  ('cylindrical-roller-bearings', 'Cylindrical Roller Bearings', 'cylindrical-roller-bearings', NULL, 'pharmaceutical', 50, true),
  ('tapered-roller-bearings', 'Tapered Roller Bearings', 'tapered-roller-bearings', NULL, 'pharmaceutical', 60, true),
  ('needle-roller-bearings', 'Needle Roller Bearings', 'needle-roller-bearings', NULL, 'pharmaceutical', 70, true),
  ('thrust-bearings', 'Thrust Bearings', 'thrust-bearings', NULL, 'pharmaceutical', 80, true),
  ('mounted-bearing-units', 'Mounted Bearing Units', 'mounted-bearing-units', NULL, 'baby', 10, true),
  ('linear-motion', 'Linear Motion', 'linear-motion', NULL, 'baby', 20, true),
  ('bearing-housings-seals', 'Bearing Housings & Seals', 'bearing-housings-seals', NULL, 'baby', 30, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

CREATE INDEX IF NOT EXISTS idx_categories_parent_display_order
  ON public.categories (parent_id, display_order);

CREATE POLICY "Administrators can view all categories"
  ON public.categories FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Administrators can create categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Administrators can update categories"
  ON public.categories FOR UPDATE TO authenticated
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
