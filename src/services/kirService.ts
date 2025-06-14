import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type KIRRecord = Database['public']['Tables']['kir_records']['Row'];
type KIRRecordInsert = Database['public']['Tables']['kir_records']['Insert'];
type KIRRecordUpdate = Database['public']['Tables']['kir_records']['Update'];

export const kirService = {
  // Get all KIR records
  async getAll(): Promise<KIRRecord[]> {
    const { data, error } = await supabase
      .from('kir_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KIR records:', error);
      throw new Error('Failed to fetch KIR records');
    }

    return data || [];
  },

  // Get KIR record by ID
  async getById(id: string): Promise<KIRRecord | null> {
    const { data, error } = await supabase
      .from('kir_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching KIR record:', error);
      return null;
    }

    return data;
  },

  // Create new KIR record
  async create(record: KIRRecordInsert): Promise<KIRRecord> {
    const { data, error } = await supabase
      .from('kir_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating KIR record:', error);
      throw new Error('Failed to create KIR record');
    }

    return data;
  },

  // Update KIR record
  async update(id: string, updates: KIRRecordUpdate): Promise<KIRRecord> {
    const { data, error } = await supabase
      .from('kir_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating KIR record:', error);
      throw new Error('Failed to update KIR record');
    }

    return data;
  },

  // Delete KIR record
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('kir_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting KIR record:', error);
      throw new Error('Failed to delete KIR record');
    }
  },

  // Get KIR records by status
  async getByStatus(status: string): Promise<KIRRecord[]> {
    const { data, error } = await supabase
      .from('kir_records')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KIR records by status:', error);
      throw new Error('Failed to fetch KIR records');
    }

    return data || [];
  },

  // Get KIR records by vehicle ID
  async getByVehicleId(vehicleId: string): Promise<KIRRecord[]> {
    const { data, error } = await supabase
      .from('kir_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KIR records by vehicle:', error);
      throw new Error('Failed to fetch KIR records');
    }

    return data || [];
  },

  // Search KIR records
  async search(query: string): Promise<KIRRecord[]> {
    const { data, error } = await supabase
      .from('kir_records')
      .select('*')
      .or(`vehicle_plate.ilike.%${query}%,certificate_number.ilike.%${query}%,inspector.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching KIR records:', error);
      throw new Error('Failed to search KIR records');
    }

    return data || [];
  }
};