-- Admin-managed order completion notification settings

CREATE TABLE IF NOT EXISTS public.order_notification_settings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    notifications_enabled BOOLEAN DEFAULT false,
    admin_emails TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_notification_settings_row CHECK (id = '00000000-0000-0000-0000-000000000002'::uuid)
);

INSERT INTO public.order_notification_settings (id, notifications_enabled, admin_emails)
VALUES ('00000000-0000-0000-0000-000000000002'::uuid, false, '{}')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.supplier_notification_routes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    subcategory_id VARCHAR(100),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_notification_routes_category
ON public.supplier_notification_routes(category_id, subcategory_id);

ALTER TABLE public.order_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_notification_routes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'order_notification_settings'
        AND policyname = 'Admins can view order notification settings'
    ) THEN
        CREATE POLICY "Admins can view order notification settings"
        ON public.order_notification_settings FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'order_notification_settings'
        AND policyname = 'Admins can insert order notification settings'
    ) THEN
        CREATE POLICY "Admins can insert order notification settings"
        ON public.order_notification_settings FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'order_notification_settings'
        AND policyname = 'Admins can update order notification settings'
    ) THEN
        CREATE POLICY "Admins can update order notification settings"
        ON public.order_notification_settings FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'supplier_notification_routes'
        AND policyname = 'Admins can view supplier notification routes'
    ) THEN
        CREATE POLICY "Admins can view supplier notification routes"
        ON public.supplier_notification_routes FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'supplier_notification_routes'
        AND policyname = 'Admins can insert supplier notification routes'
    ) THEN
        CREATE POLICY "Admins can insert supplier notification routes"
        ON public.supplier_notification_routes FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'supplier_notification_routes'
        AND policyname = 'Admins can update supplier notification routes'
    ) THEN
        CREATE POLICY "Admins can update supplier notification routes"
        ON public.supplier_notification_routes FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'supplier_notification_routes'
        AND policyname = 'Admins can delete supplier notification routes'
    ) THEN
        CREATE POLICY "Admins can delete supplier notification routes"
        ON public.supplier_notification_routes FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.is_admin = true
            )
        );
    END IF;
END $$;

COMMENT ON TABLE public.order_notification_settings IS 'Admin-managed recipients for completed order notifications.';
COMMENT ON TABLE public.supplier_notification_routes IS 'Maps supplier emails to product category and subcategory routes.';
