import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type TaxRecord = Database['public']['Tables']['tax_records']['Row'];
type TaxRecordInsert = Database['public']['Tables']['tax_records']['Insert'];
type TaxRecordUpdate = Database['public']['Tables']['tax_records']['Update'];

export const taxService = {
  // Get all tax records
  async getAll(): Promise<TaxRecord[]> {
    const { data, error } = await supabase
      .from('tax_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tax records:', error);
      throw new Error('Failed to fetch tax records');
    }

    return data || [];
  },

  // Get tax record by ID
  async getById(id: string): Promise<TaxRecord | null> {
    const { data, error } = await supabase
      .from('tax_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tax record:', error);
      return null;
    }

    return data;
  },

  // Create new tax record
  async create(record: TaxRecordInsert): Promise<TaxRecord> {
    const { data, error } = await supabase
      .from('tax_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating tax record:', error);
      throw new Error('Failed to create tax record');
    }

    return data;
  },

  // Update tax record
  async update(id: string, updates: TaxRecordUpdate): Promise<TaxRecord> {
    const { data, error } = await supabase
      .from('tax_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax record:', error);
      throw new Error('Failed to update tax record');
    }

    return data;
  },

  // Delete tax record
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tax_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tax record:', error);
      throw new Error('Failed to delete tax record');
    }
  },

  // Get tax records by status
  async getByStatus(status: string): Promise<TaxRecord[]> {
    const { data, error } = await supabase
      .from('tax_records')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tax records by status:', error);
      throw new Error('Failed to fetch tax records');
    }

    return data || [];
  },

  // Get tax records by vehicle ID
  async getByVehicleId(vehicleId: string): Promise<TaxRecord[]> {
    const { data, error } = await supabase
      .from('tax_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tax records by vehicle:', error);
      throw new Error('Failed to fetch tax records');
    }

    return data || [];
  },

  // Mark tax as paid and create next year record for annual tax
  async markAsPaid(id: string): Promise<TaxRecord> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error('Tax record not found');
    }

    // Update current record to paid
    const updatedRecord = await this.update(id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0]
    });

    // If it's an annual tax, create next year's record
    if (record.tax_type === 'annual') {
      const nextYear = record.tax_year + 1;
      const nextDueDate = new Date(record.due_date);
      nextDueDate.setFullYear(nextYear);

      await this.create({
        vehicle_id: record.vehicle_id,
        vehicle_plate: record.vehicle_plate,
        tax_type: 'annual',
        tax_year: nextYear,
        base_amount: record.base_amount,
        has_tax: record.has_tax,
        tax_rate: record.tax_rate,
        tax_amount: record.tax_amount,
        total_amount: record.total_amount,
        due_date: nextDueDate.toISOString().split('T')[0],
        status: 'pending',
        description: `Pajak Tahunan ${nextYear}`
      });
    }

    return updatedRecord;
  }
};