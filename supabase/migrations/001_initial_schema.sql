-- NEX-GEN Shipping Agency Database Schema
-- Created: December 2025
-- This schema supports the full e-commerce application including products, users, orders, and inventory

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Extend auth.users with custom profile data
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User addresses
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
    is_default BOOLEAN DEFAULT false,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    order_updates BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT false,
    sms_alerts BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

-- Product categories
CREATE TABLE public.categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id VARCHAR(50) REFERENCES public.categories(id),
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('baby', 'pharmaceutical')),
    category_id VARCHAR(50) REFERENCES public.categories(id),
    subcategory_id VARCHAR(50) REFERENCES public.categories(id),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) CHECK (original_price >= 0),
    cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),
    image_url TEXT NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
    sold_count INTEGER DEFAULT 0 CHECK (sold_count >= 0),
    in_stock BOOLEAN DEFAULT true,
    badge VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full text search
    search_vector tsvector
);

-- Product reviews
CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per user per product
    UNIQUE(product_id, user_id)
);

-- ============================================
-- SHOPPING & ORDERS
-- ============================================

-- Shopping cart
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one product per user in cart
    UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one product per user in wishlist
    UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'confirmed', 'in-transit', 'delivered', 'cancelled', 'refunded')),
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Shipping details
    shipping_method VARCHAR(20) CHECK (shipping_method IN ('standard', 'express', 'overnight')),
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Shipping address (denormalized for historical record)
    shipping_full_name VARCHAR(200) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20),
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'United States',
    
    -- Payment details
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit-card', 'debit-card', 'paypal', 'bank-transfer')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_transaction_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    
    -- Product snapshot (for historical record)
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVENTORY & ANALYTICS
-- ============================================

-- Inventory transactions log
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'return', 'adjustment', 'restock')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales analytics (materialized view for performance)
CREATE MATERIALIZED VIEW public.product_sales_analytics AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.quantity) as total_units_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as average_price,
    MAX(o.created_at) as last_sale_date
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name, p.category;

-- ============================================
-- INDEXES
-- ============================================

-- User indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(id);
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON public.user_addresses(user_id, is_default);

-- Product indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_products_search ON public.products USING gin(search_vector);

-- Order indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Cart and wishlist indexes
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);

-- Review indexes
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);

-- Inventory indexes
CREATE INDEX idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_created_at ON public.inventory_transactions(created_at DESC);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.category, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_search_vector BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET 
        rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
        review_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Update inventory on order
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease stock when order is confirmed
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'processing') THEN
        UPDATE public.products p
        SET 
            stock_count = stock_count - oi.quantity,
            sold_count = sold_count + oi.quantity,
            in_stock = (stock_count - oi.quantity) > 0
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
        
        -- Log inventory transactions
        INSERT INTO public.inventory_transactions (product_id, transaction_type, quantity_change, previous_stock, new_stock, order_id)
        SELECT 
            p.id,
            'sale',
            -oi.quantity,
            p.stock_count + oi.quantity,
            p.stock_count,
            NEW.id
        FROM public.order_items oi
        JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = NEW.id;
    END IF;
    
    -- Restore stock if order is cancelled
    IF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'in-transit') THEN
        UPDATE public.products p
        SET 
            stock_count = stock_count + oi.quantity,
            sold_count = GREATEST(0, sold_count - oi.quantity),
            in_stock = true
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
        
        -- Log inventory transactions
        INSERT INTO public.inventory_transactions (product_id, transaction_type, quantity_change, previous_stock, new_stock, order_id)
        SELECT 
            p.id,
            'return',
            oi.quantity,
            p.stock_count - oi.quantity,
            p.stock_count,
            NEW.id
        FROM public.order_items oi
        JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_trigger AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order();

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'NG-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                           LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories (no auth required)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = true);

-- User profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- User addresses
CREATE POLICY "Users can view their own addresses" ON public.user_addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.user_addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON public.user_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Cart items
CREATE POLICY "Users can manage their own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Wishlist items
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Reviews
CREATE POLICY "Anyone can view reviews" ON public.product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (requires is_admin = true in user_profiles)
CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- ============================================
-- FUNCTIONS FOR APPLICATION USE
-- ============================================

-- Get user's cart total
CREATE OR REPLACE FUNCTION get_cart_total(p_user_id UUID)
RETURNS DECIMAL AS $$
    SELECT COALESCE(SUM(p.price * ci.quantity), 0)
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.user_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Search products
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, p_category TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category VARCHAR,
    price DECIMAL,
    image_url TEXT,
    rating DECIMAL,
    review_count INTEGER,
    in_stock BOOLEAN,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.category,
        p.price,
        p.image_url,
        p.rating,
        p.review_count,
        p.in_stock,
        ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM public.products p
    WHERE 
        p.is_active = true
        AND (p_category IS NULL OR p.category = p_category)
        AND p.search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, p.rating DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample categories
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
('baby', 'Baby Products', 'baby-products', 'Everything for your little ones', 1),
('pharmaceutical', 'Pharmaceuticals', 'pharmaceuticals', 'Health and wellness products', 2),
('baby-clothing', 'Baby Clothing', 'baby-clothing', 'Clothes and accessories for babies', 1),
('baby-accessories', 'Baby Accessories', 'baby-accessories', 'Baby care accessories', 2),
('cold-cough-allergy-sinus', 'Cold, Cough, Allergy & Sinus', 'cold-cough-allergy-sinus', 'Relief from cold and flu symptoms', 1),
('pain-relief', 'Pain Relief', 'pain-relief', 'Pain management products', 2),
('vitamins-supplements', 'Vitamins & Supplements', 'vitamins-supplements', 'Health supplements and vitamins', 3);

-- Set parent categories
UPDATE public.categories SET parent_id = 'baby' WHERE id IN ('baby-clothing', 'baby-accessories');
UPDATE public.categories SET parent_id = 'pharmaceutical' WHERE id IN ('cold-cough-allergy-sinus', 'pain-relief', 'vitamins-supplements');

COMMENT ON TABLE public.products IS 'Main product catalog for NEX-GEN Shipping';
COMMENT ON TABLE public.orders IS 'Customer orders with full tracking and payment information';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON MATERIALIZED VIEW public.product_sales_analytics IS 'Aggregated sales data for analytics dashboard';
