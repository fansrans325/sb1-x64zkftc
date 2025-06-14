import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'];
type MaintenanceRecordInsert = Database['public']['Tables']['maintenance_records']['Insert'];
type MaintenanceRecordUpdate = Database['public']['Tables']['maintenance_records']['Update'];

export const maintenanceService = {
  // Get all maintenance records
  async getAll(): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance records:', error);
      throw new Error('Failed to fetch maintenance records');
    }

    return data || [];
  },

  // Get maintenance record by ID
  async getById(id: string): Promise<MaintenanceRecord | null> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching maintenance record:', error);
      return null;
    }

    return data;
  },

  // Create new maintenance record
  async create(record: MaintenanceRecordInsert): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance record:', error);
      throw new Error('Failed to create maintenance record');
    }

    return data;
  },

  // Update maintenance record
  async update(id: string, updates: MaintenanceRecordUpdate): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating maintenance record:', error);
      throw new Error('Failed to update maintenance record');
    }

    return data;
  },

  // Delete maintenance record
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting maintenance record:', error);
      throw new Error('Failed to delete maintenance record');
    }
  },

  // Get maintenance records by status
  async getByStatus(status: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance records by status:', error);
      throw new Error('Failed to fetch maintenance records');
    }

    return data || [];
  },

  // Get maintenance records by vehicle ID
  async getByVehicleId(vehicleId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance records by vehicle:', error);
      throw new Error('Failed to fetch maintenance records');
    }

    return data || [];
  },

  // Mark maintenance as completed
  async markAsCompleted(id: string): Promise<MaintenanceRecord> {
    return this.update(id, {
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0]
    });
  },

  // Mark maintenance as in progress
  async markAsInProgress(id: string): Promise<MaintenanceRecord> {
    return this.update(id, {
      status: 'in-progress'
    });
  }
};