import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

export const vendorService = {
  // Get all vendors
  async getAll(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }

    return data || [];
  },

  // Get vendor by ID
  async getById(id: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }

    return data;
  },

  // Create new vendor
  async create(vendor: VendorInsert): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw new Error('Failed to create vendor');
    }

    return data;
  },

  // Update vendor
  async update(id: string, updates: VendorUpdate): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw new Error('Failed to update vendor');
    }

    return data;
  },

  // Delete vendor
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      throw new Error('Failed to delete vendor');
    }
  },

  // Get vendors by vehicle type
  async getByVehicleType(vehicleType: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vehicle_type', vehicleType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors by vehicle type:', error);
      throw new Error('Failed to fetch vendors');
    }

    return data || [];
  },

  // Search vendors
  async search(query: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .or(`name.ilike.%${query}%,contact.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching vendors:', error);
      throw new Error('Failed to search vendors');
    }

    return data || [];
  }
};