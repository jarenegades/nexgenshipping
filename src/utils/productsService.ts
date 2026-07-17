import { supabase } from './supabaseClient';
import { Product } from '../components/ProductCard';
import { config } from './config';
import { bearingCategoryIds, bearingCopyFor, bearingImageFor } from './bearingCatalog';
import { showcaseProducts } from '../data/showcaseProducts';

/**
 * Products Service - Handles all product operations with Supabase
 * Provides fallback to local state when Supabase is disabled or fails
 */

// Helper to shuffle array consistently based on page number
const shuffleArrayByPage = (array: any[], page: number): any[] => {
  const shuffled = [...array];
  // Use page number as seed for consistent shuffling per page
  const seed = page * 12345;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = ((seed + i) * 9007199254740992) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const productsService = {
  /**
   * Fetch products with pagination and filtering
   */
  async getProducts(options: {
    page?: number;
    limit?: number;
    category?: 'all' | 'baby' | 'pharmaceutical';
    categoryId?: string;
    subcategoryId?: string;
    search?: string;
    sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating';
  }): Promise<{ products: Product[]; count: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    let products = showcaseProducts.filter((product) => {
      if (options.category && options.category !== 'all' && product.category !== options.category) return false;
      if (options.categoryId && product.categoryId !== options.categoryId) return false;
      if (options.subcategoryId && product.subcategoryId !== options.subcategoryId) return false;
      if (options.search) {
        const query = options.search.toLowerCase();
        return product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query);
      }
      return true;
    });

    if (options.sortBy === 'price-low') products = [...products].sort((a, b) => a.price - b.price);
    if (options.sortBy === 'price-high') products = [...products].sort((a, b) => b.price - a.price);
    if (options.sortBy === 'rating') products = [...products].sort((a, b) => b.rating - a.rating);

    return { products: products.slice((page - 1) * limit, page * limit), count: products.length };

    try {
      const page = options.page || 1;
      const limit = options.limit || 20;

      // Check if we're filtering or just showing all products
      const isFiltered = options.category !== 'all' || options.categoryId || options.subcategoryId || options.search;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }

      const isBearingCategoryFilter = Boolean(options.categoryId && bearingCategoryIds.has(options.categoryId));

      if (options.categoryId && !isBearingCategoryFilter) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.subcategoryId) {
        query = query.eq('subcategory_id', options.subcategoryId);
      }

      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }

      // Determine sort order
      let orderBy = 'created_at';
      let ascending = false;
      
      if (options.sortBy === 'price-low') {
        orderBy = 'price';
        ascending = true;
      } else if (options.sortBy === 'price-high') {
        orderBy = 'price';
        ascending = false;
      } else if (options.sortBy === 'rating') {
        orderBy = 'rating';
        ascending = false;
      }
      // Default is 'newest' (created_at descending)

      // If showing all products without filters, fetch more to shuffle and select
      // This ensures good distribution across categories
      if (isBearingCategoryFilter) {
        const { data, error } = await query.order(orderBy, { ascending });
        if (error) throw error;

        const matchingProducts = (data || [])
          .map(this.mapToProduct)
          .filter((product) => product.categoryId === options.categoryId);
        const start = (page - 1) * limit;

        return {
          products: matchingProducts.slice(start, start + limit),
          count: matchingProducts.length,
        };
      }

      if (!isFiltered && options.category === 'all' && !options.sortBy) {
        const { data, count, error } = await query
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Shuffle all products for better distribution
        const allProducts = (data || []).map(this.mapToProduct);
        const shuffled = shuffleArrayByPage(allProducts, page);

        // Apply pagination on shuffled results
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedProducts = shuffled.slice(start, end);

        return {
          products: paginatedProducts,
          count: count || 0
        };
      } else {
        // For filtered results or when sorting, use normal pagination
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, count, error } = await query
          .order(orderBy, { ascending })
          .range(start, end);

        if (error) throw error;

        return {
          products: (data || []).map(this.mapToProduct),
          count: count || 0
        };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetch all active products from Supabase
   */
  async getAll(): Promise<Product[]> {
    return showcaseProducts;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });


      if (error) throw error;

      // Map Supabase data to Product interface
      return (data || []).map(this.mapToProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  async getById(id: string): Promise<Product | null> {
    return showcaseProducts.find((product) => product.id === id) || null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapToProduct(data) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  /**
   * Create a new product in Supabase
   */
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      const productData = this.mapToSupabase(product);

      // Use admin client to bypass RLS policies
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      if (config.debugMode) {
        console.log('✅ Product created in Supabase:', data);
      }

      return this.mapToProduct(data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      const updateData = this.mapToSupabase(updates);

      // Use admin client to bypass RLS policies
      // @ts-ignore - JSR Supabase package has strict typing issues
      const { data, error } = await supabase
        .from('products')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (config.debugMode) {
        console.log('✅ Product updated in Supabase:', data);
      }

      return this.mapToProduct(data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Delete a product (soft delete by marking inactive)
   */
  async delete(id: string): Promise<void> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      // Use admin client to bypass RLS policies
      // Soft delete by marking as inactive
      // @ts-ignore - JSR Supabase package has strict typing issues
      const { error } = await supabase
        .from('products')
        .update({ is_active: false } as any)
        .eq('id', id);

      if (error) throw error;

      if (config.debugMode) {
        console.log('✅ Product deleted (soft) from Supabase:', id);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Hard delete a product (permanent removal)
   */
  async hardDelete(id: string): Promise<void> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      console.log('🗑️ Attempting to delete product from Supabase:', id);

      // Use admin client to bypass RLS policies
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw new Error(`Supabase delete failed: ${error.message}`);
      }

      console.log('✅ Product permanently deleted from Supabase:', id, data);
    } catch (error) {
      console.error('❌ Error hard deleting product:', error);
      throw error;
    }
  },

  /**
   * Bulk delete products by category or all
   * More efficient than deleting one by one
   */
  async bulkDelete(action: 'baby' | 'pharmaceutical' | 'purge'): Promise<number> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      // First, count products to be deleted
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (action !== 'purge') {
        countQuery = countQuery.eq('category', action);
      }

      const { count: countBefore } = await countQuery;
      const deletedCount = countBefore || 0;

      if (deletedCount === 0) {
        console.log(`⚠️ No products found to delete for action: ${action}`);
        return 0;
      }

      // Perform bulk delete
      let deleteQuery = supabase
        .from('products')
        .delete();

      if (action === 'purge') {
        // For purge, we need a WHERE clause that matches all rows
        // Using .neq('id', '') which matches all UUIDs (they're never empty strings)
        deleteQuery = deleteQuery.neq('id', '');
      } else {
        deleteQuery = deleteQuery.eq('category', action);
      }

      const { error } = await deleteQuery;

      if (error) {
        console.error('❌ Bulk delete error:', error);
        throw error;
      }

      if (config.debugMode) {
        console.log(`✅ Bulk delete complete: ${deletedCount} products deleted (${action})`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  },

  /**
   * Ensure category exists, create if missing
   */
  async ensureCategory(categoryId: string, category: 'baby' | 'pharmaceutical'): Promise<void> {
    if (!categoryId) return;

    try {
      // Check if category exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .single();

      if (existing) {
        return; // Category already exists
      }

      // Create missing category
      const categoryName = categoryId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const parentId = category === 'baby' ? 'baby' : 'pharmaceutical';

      const { error } = await supabase
        .from('categories')
        .insert({
          id: categoryId,
          name: categoryName,
          slug: categoryId,
          description: `${categoryName} products`,
          parent_id: parentId,
          display_order: 0,
          is_active: true,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.warn(`⚠️ Failed to create category ${categoryId}:`, error.message);
      } else if (!error) {
        console.log(`✅ Created missing category: ${categoryId}`);
      }
    } catch (err) {
      console.warn(`⚠️ Error ensuring category ${categoryId}:`, err);
      // Don't throw - continue with import even if category creation fails
    }
  },

  /**
   * Bulk import products
   * Batches inserts to handle large volumes (e.g., 200+ products)
   */
  async bulkImport(products: Omit<Product, 'id'>[]): Promise<number> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      // First, ensure all categories exist
      const categoryIds = new Set<string>();
      products.forEach(p => {
        if (p.categoryId) {
          categoryIds.add(p.categoryId);
        }
      });

      // Create missing categories in parallel
      await Promise.allSettled(
        Array.from(categoryIds).map(categoryId => {
          // Determine parent category from first product using this categoryId
          const product = products.find(p => p.categoryId === categoryId);
          const parentCategory = product?.category || 'pharmaceutical';
          return productsService.ensureCategory(categoryId, parentCategory as 'baby' | 'pharmaceutical');
        })
      );

      const productsData = products.map(this.mapToSupabase);
      const BATCH_SIZE = 50; // Supabase can handle more, but batching prevents timeout issues
      let totalImported = 0;
      let allErrors: Error[] = [];

      // Process in batches
      for (let i = 0; i < productsData.length; i += BATCH_SIZE) {
        const batch = productsData.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(productsData.length / BATCH_SIZE);

        if (config.debugMode) {
          console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);
        }

        try {
          // Use admin client to bypass RLS policies
          const { data, error } = await supabase
            .from('products')
            .insert(batch as any)
            .select();

          if (error) {
            console.error(`❌ Error in batch ${batchNumber}:`, error);
            allErrors.push(new Error(`Batch ${batchNumber}: ${error.message}`));
            continue; // Continue with next batch
          }

          const batchCount = data?.length || 0;
          totalImported += batchCount;

          if (config.debugMode) {
            console.log(`✅ Batch ${batchNumber} imported: ${batchCount} products`);
          }

          // Small delay between batches to avoid rate limiting
          if (i + BATCH_SIZE < productsData.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (batchError) {
          console.error(`❌ Error processing batch ${batchNumber}:`, batchError);
          allErrors.push(new Error(`Batch ${batchNumber}: ${batchError instanceof Error ? batchError.message : String(batchError)}`));
        }
      }

      if (config.debugMode) {
        console.log(`✅ Bulk import complete: ${totalImported}/${productsData.length} products imported`);
        if (allErrors.length > 0) {
          console.warn(`⚠️ ${allErrors.length} batches had errors:`, allErrors);
        }
      }

      // If we imported at least some products, return success count
      // If all failed, throw the first error
      if (totalImported === 0 && allErrors.length > 0) {
        throw new Error(`Bulk import failed: ${allErrors[0].message}`);
      }

      return totalImported;
    } catch (error) {
      console.error('Error bulk importing products:', error);
      throw error;
    }
  },

  /**
   * Search products by name or description
   */
  async search(query: string, category?: 'baby' | 'pharmaceutical'): Promise<Product[]> {
    if (!config.useSupabase) {
      return [];
    }

    try {
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      // Use full-text search if available, otherwise use ILIKE
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      );

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return (data || []).map(this.mapToProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  /**
   * Get products by category
   */
  async getByCategory(category: 'baby' | 'pharmaceutical'): Promise<Product[]> {
    if (!config.useSupabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  /**
   * Update stock count
   */
  async updateStock(id: string, quantity: number): Promise<void> {
    if (!config.useSupabase) {
      throw new Error('Supabase is disabled');
    }

    try {
      // @ts-ignore - JSR Supabase package has strict typing issues
      const { error } = await supabase
        .from('products')
        .update({
          stock_count: quantity,
          in_stock: quantity > 0,
        } as any)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  /**
   * Map Supabase product data to frontend Product interface
   */
  mapToProduct(data: any): Product {
    const bearingCopy = bearingCopyFor(data.id);
    return {
      id: data.id,
      name: bearingCopy.name,
      description: bearingCopy.description,
      category: data.category,
      categoryId: data.category_id,
      subcategoryId: data.subcategory_id,
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      currency: data.currency || 'USD',
      rating: Number(data.rating),
      reviewCount: data.review_count,
      image: bearingImageFor(data.id),
      inStock: data.in_stock,
      badge: bearingCopy.badge || data.badge,
      stockCount: data.stock_count,
      soldCount: data.sold_count,
      costPrice: data.cost_price ? Number(data.cost_price) : undefined,
    };
  },

  /**
   * Map frontend Product to Supabase database format
   */
  mapToSupabase(product: Partial<Product>): any {
    const mapped: any = {};

    if (product.name !== undefined) mapped.name = product.name;
    if (product.description !== undefined) mapped.description = product.description;
    if (product.category !== undefined) mapped.category = product.category;
    if (product.categoryId !== undefined) mapped.category_id = product.categoryId;
    if (product.subcategoryId !== undefined) mapped.subcategory_id = product.subcategoryId;
    if (product.price !== undefined) mapped.price = product.price;
    if (product.originalPrice !== undefined) mapped.original_price = product.originalPrice;
    // Always set currency - default to USD if not provided
    mapped.currency = product.currency || 'USD';
    if (product.rating !== undefined) mapped.rating = product.rating;
    if (product.reviewCount !== undefined) mapped.review_count = product.reviewCount;
    if (product.image !== undefined) mapped.image_url = product.image;
    if (product.inStock !== undefined) mapped.in_stock = product.inStock;
    if (product.badge !== undefined) mapped.badge = product.badge;
    if (product.stockCount !== undefined) mapped.stock_count = product.stockCount;
    if (product.soldCount !== undefined) mapped.sold_count = product.soldCount;
    if (product.costPrice !== undefined) mapped.cost_price = product.costPrice;

    return mapped;
  },
};
