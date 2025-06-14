import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CompetitorPrice = Database['public']['Tables']['competitor_prices']['Row'];
type CompetitorPriceInsert = Database['public']['Tables']['competitor_prices']['Insert'];
type CompetitorPriceUpdate = Database['public']['Tables']['competitor_prices']['Update'];

export const competitorPriceService = {
  // Get all competitor prices
  async getAll(): Promise<CompetitorPrice[]> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitor prices:', error);
      throw new Error('Failed to fetch competitor prices');
    }

    return data || [];
  },

  // Get competitor price by ID
  async getById(id: string): Promise<CompetitorPrice | null> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching competitor price:', error);
      return null;
    }

    return data;
  },

  // Create new competitor price
  async create(price: CompetitorPriceInsert): Promise<CompetitorPrice> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .insert(price)
      .select()
      .single();

    if (error) {
      console.error('Error creating competitor price:', error);
      throw new Error('Failed to create competitor price');
    }

    return data;
  },

  // Update competitor price
  async update(id: string, updates: CompetitorPriceUpdate): Promise<CompetitorPrice> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating competitor price:', error);
      throw new Error('Failed to update competitor price');
    }

    return data;
  },

  // Delete competitor price
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('competitor_prices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting competitor price:', error);
      throw new Error('Failed to delete competitor price');
    }
  },

  // Get prices by vehicle category
  async getByCategory(category: string): Promise<CompetitorPrice[]> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .eq('vehicle_category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prices by category:', error);
      throw new Error('Failed to fetch prices');
    }

    return data || [];
  },

  // Search competitor prices
  async search(query: string): Promise<CompetitorPrice[]> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .or(`competitor.ilike.%${query}%,vehicle_category.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching competitor prices:', error);
      throw new Error('Failed to search competitor prices');
    }

    return data || [];
  }
};