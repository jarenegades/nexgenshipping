-- Add payment gateway settings table
-- This migration creates a table to store payment gateway configuration
-- Supports DimePay with merchant ID, secret key, client key, environment, and fee settings

-- Payment gateway settings table (single row - admin managed)
CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    
    -- DimePay Configuration
    merchant_id VARCHAR(255),
    secret_key VARCHAR(500),  -- Encrypted in production
    client_key VARCHAR(500),  -- Encrypted in production
    
    -- Environment: 'sandbox' or 'production'
    environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    
    -- Fee handling: 'merchant' (merchant absorbs) or 'customer' (customer pays)
    fee_handling VARCHAR(20) DEFAULT 'merchant' CHECK (fee_handling IN ('merchant', 'customer')),
    
    -- Platform fee percentage (e.g., 2.9 for 2.9%)
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 2.90 CHECK (platform_fee_percentage >= 0),
    
    -- Whether payment gateway is enabled
    is_enabled BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one row exists
    CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert default row (will be updated by admin)
INSERT INTO public.payment_gateway_settings (id, merchant_id, secret_key, client_key, environment, fee_handling, platform_fee_percentage, is_enabled)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NULL, NULL, NULL, 'sandbox', 'merchant', 2.90, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view and update payment settings
CREATE POLICY "Admins can view payment gateway settings"
ON public.payment_gateway_settings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
);

CREATE POLICY "Admins can update payment gateway settings"
ON public.payment_gateway_settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_gateway_settings_id ON public.payment_gateway_settings(id);

-- Add comment for documentation
COMMENT ON TABLE public.payment_gateway_settings IS 'Payment gateway configuration (DimePay). Only one row should exist.';
COMMENT ON COLUMN public.payment_gateway_settings.environment IS 'Payment gateway environment: sandbox or production';
COMMENT ON COLUMN public.payment_gateway_settings.fee_handling IS 'Who pays platform fees: merchant (absorbed) or customer (added to price)';

