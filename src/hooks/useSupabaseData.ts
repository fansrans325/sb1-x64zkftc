import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseSupabaseDataOptions {
  table: string;
  select?: string;
  filter?: { column: string; value: any; operator?: string };
  orderBy?: { column: string; ascending?: boolean };
  realtime?: boolean;
}

export function useSupabaseData<T>({
  table,
  select = '*',
  filter,
  orderBy,
  realtime = false
}: UseSupabaseDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let query = supabase.from(table).select(select);

    if (filter) {
      const { column, value, operator = 'eq' } = filter;
      query = query[operator as keyof typeof query](column, value) as any;
    }

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
          console.error(`Error fetching ${table}:`, fetchError);
        } else {
          setData(result || []);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error(`Error fetching ${table}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription if enabled
    let subscription: any;
    if (realtime) {
      subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table }, 
          () => {
            fetchData(); // Refetch data on any change
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [table, select, filter?.column, filter?.value, filter?.operator, orderBy?.column, orderBy?.ascending, realtime]);

  const refetch = async () => {
    setLoading(true);
    try {
      let query = supabase.from(table).select(select);

      if (filter) {
        const { column, value, operator = 'eq' } = filter;
        query = query[operator as keyof typeof query](column, value) as any;
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        console.error(`Error refetching ${table}:`, fetchError);
      } else {
        setData(result || []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error refetching ${table}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Specialized hooks for each entity
export const useCustomers = (vehicleType?: string) => {
  return useSupabaseData<any>({
    table: 'customers',
    filter: vehicleType ? { column: 'preferred_vehicle_type', value: vehicleType } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useVehicles = (status?: string) => {
  return useSupabaseData<any>({
    table: 'vehicles',
    filter: status ? { column: 'status', value: status } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useKIRRecords = (status?: string) => {
  return useSupabaseData<any>({
    table: 'kir_records',
    filter: status ? { column: 'status', value: status } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useTaxRecords = (status?: string) => {
  return useSupabaseData<any>({
    table: 'tax_records',
    filter: status ? { column: 'status', value: status } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useMaintenanceRecords = (status?: string) => {
  return useSupabaseData<any>({
    table: 'maintenance_records',
    filter: status ? { column: 'status', value: status } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useVendors = (vehicleType?: string) => {
  return useSupabaseData<any>({
    table: 'vendors',
    filter: vehicleType ? { column: 'vehicle_type', value: vehicleType } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useCompetitorPrices = () => {
  return useSupabaseData<any>({
    table: 'competitor_prices',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useInvoices = (status?: string) => {
  return useSupabaseData<any>({
    table: 'invoices',
    select: `
      *,
      invoice_items (*)
    `,
    filter: status ? { column: 'status', value: status } : undefined,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};

export const useHPPCalculations = () => {
  return useSupabaseData<any>({
    table: 'hpp_calculations',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });
};