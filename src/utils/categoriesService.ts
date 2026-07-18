import { supabase } from './supabaseClient';

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
}

const fallbackCategories: StoreCategory[] = [
  { id: 'pharmaceutical', name: 'Rolling Bearings', slug: 'rolling-bearings', display_order: 10, is_active: true },
  { id: 'baby', name: 'Mounted & Linear Units', slug: 'mounted-linear-units', display_order: 20, is_active: true },
];

const toId = (name: string) => name
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 50);

export const categoriesService = {
  async getAll(includeInactive = false): Promise<StoreCategory[]> {
    if (!supabase) return fallbackCategories;

    let query = supabase.from('categories').select('*').order('display_order').order('name');
    if (!includeInactive) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as StoreCategory[];
  },

  async create(input: { name: string; parentId: string; description?: string; displayOrder?: number }) {
    const id = toId(input.name);
    if (!id) throw new Error('Enter a valid category name');
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        name: input.name.trim(),
        slug: id,
        parent_id: input.parentId,
        description: input.description?.trim() || null,
        display_order: input.displayOrder || 0,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data as StoreCategory;
  },

  async update(id: string, updates: Pick<StoreCategory, 'name' | 'description' | 'display_order' | 'is_active'>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as StoreCategory;
  },
};
