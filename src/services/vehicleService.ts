import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export const vehicleService = {
  // Get all vehicles
  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }

    return data || [];
  },

  // Get vehicle by ID
  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    return data;
  },

  // Create new vehicle
  async create(vehicle: VehicleInsert): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }

    return data;
  },

  // Update vehicle
  async update(id: string, updates: VehicleUpdate): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }

    return data;
  },

  // Delete vehicle
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  },

  // Get vehicles by status
  async getByStatus(status: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles by status:', error);
      throw new Error('Failed to fetch vehicles');
    }

    return data || [];
  },

  // Search vehicles
  async search(query: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`make.ilike.%${query}%,model.ilike.%${query}%,license_plate.ilike.%${query}%,vin.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching vehicles:', error);
      throw new Error('Failed to search vehicles');
    }

    return data || [];
  }
};