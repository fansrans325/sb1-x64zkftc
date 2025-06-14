import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export const invoiceService = {
  // Get all invoices with items
  async getAll(): Promise<(Invoice & { items: InvoiceItem[] })[]> {
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw new Error('Failed to fetch invoices');
    }

    return invoices?.map(invoice => ({
      ...invoice,
      items: invoice.invoice_items || []
    })) || [];
  },

  // Get invoice by ID with items
  async getById(id: string): Promise<(Invoice & { items: InvoiceItem[] }) | null> {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return {
      ...invoice,
      items: invoice.invoice_items || []
    };
  },

  // Create new invoice with items
  async create(invoice: InvoiceInsert, items: InvoiceItemInsert[]): Promise<Invoice> {
    const { data: createdInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      throw new Error('Failed to create invoice');
    }

    // Add invoice_id to items and insert them
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: createdInvoice.id
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      // Rollback invoice creation
      await supabase.from('invoices').delete().eq('id', createdInvoice.id);
      throw new Error('Failed to create invoice items');
    }

    return createdInvoice;
  },

  // Update invoice
  async update(id: string, updates: InvoiceUpdate): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }

    return data;
  },

  // Delete invoice (will cascade delete items)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  },

  // Get invoices by status
  async getByStatus(status: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices by status:', error);
      throw new Error('Failed to fetch invoices');
    }

    return data || [];
  },

  // Get invoices by customer ID
  async getByCustomerId(customerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices by customer:', error);
      throw new Error('Failed to fetch invoices');
    }

    return data || [];
  },

  // Search invoices
  async search(query: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .or(`invoice_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching invoices:', error);
      throw new Error('Failed to search invoices');
    }

    return data || [];
  }
};