-- Secure profile support for Supabase Auth.
-- Customer passwords remain exclusively in auth.users and are never stored in
-- public tables.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Remove the legacy direct-auth trigger and its public policies.
DROP TRIGGER IF EXISTS create_auth_user_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS public.create_auth_user_for_profile();

DROP POLICY IF EXISTS "Anyone can create profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can read for auth" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

CREATE OR REPLACE FUNCTION private.prevent_customer_admin_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'Only server-side administration can change admin access';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_customer_admin_changes ON public.user_profiles;
CREATE TRIGGER prevent_customer_admin_changes
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION private.prevent_customer_admin_changes();

CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
