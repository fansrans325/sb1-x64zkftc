import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type HPPCalculation = Database['public']['Tables']['hpp_calculations']['Row'];
type HPPCalculationInsert = Database['public']['Tables']['hpp_calculations']['Insert'];
type HPPCalculationUpdate = Database['public']['Tables']['hpp_calculations']['Update'];

export const hppService = {
  // Get all HPP calculations
  async getAll(): Promise<HPPCalculation[]> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HPP calculations:', error);
      throw new Error('Failed to fetch HPP calculations');
    }

    return data || [];
  },

  // Get HPP calculation by ID
  async getById(id: string): Promise<HPPCalculation | null> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching HPP calculation:', error);
      return null;
    }

    return data;
  },

  // Create new HPP calculation
  async create(calculation: HPPCalculationInsert): Promise<HPPCalculation> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .insert(calculation)
      .select()
      .single();

    if (error) {
      console.error('Error creating HPP calculation:', error);
      throw new Error('Failed to create HPP calculation');
    }

    return data;
  },

  // Update HPP calculation
  async update(id: string, updates: HPPCalculationUpdate): Promise<HPPCalculation> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating HPP calculation:', error);
      throw new Error('Failed to update HPP calculation');
    }

    return data;
  },

  // Delete HPP calculation
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hpp_calculations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting HPP calculation:', error);
      throw new Error('Failed to delete HPP calculation');
    }
  },

  // Get HPP calculations by vehicle ID
  async getByVehicleId(vehicleId: string): Promise<HPPCalculation[]> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HPP calculations by vehicle:', error);
      throw new Error('Failed to fetch HPP calculations');
    }

    return data || [];
  },

  // Get HPP calculations by period
  async getByPeriod(period: string): Promise<HPPCalculation[]> {
    const { data, error } = await supabase
      .from('hpp_calculations')
      .select('*')
      .eq('period', period)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HPP calculations by period:', error);
      throw new Error('Failed to fetch HPP calculations');
    }

    return data || [];
  }
};