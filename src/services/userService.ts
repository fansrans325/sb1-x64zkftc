import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    return data || [];
  },

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  },

  // Create new user via Edge Function
  async create(user: { name: string; email: string; password_hash: string; role: string }): Promise<User> {
    try {
      // Get the current session to include auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Call the Edge Function
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password_hash, // Edge function expects 'password', not 'password_hash'
          role: user.role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async update(id: string, updates: UserUpdate): Promise<User> {
    // If password is being updated, hash it
    if (updates.password_hash) {
      updates.password_hash = await hashPassword(updates.password_hash);
    }

    // Update permissions based on role if role is being updated
    if (updates.role) {
      updates.permissions = getPermissionsByRole(updates.role);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return data;
  },

  // Delete user
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  },

  // Toggle user active status
  async toggleStatus(id: string): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.update(id, { is_active: !user.is_active });
  },

  // Search users
  async search(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }

    return data || [];
  },

  // Get users by role
  async getByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users');
    }

    return data || [];
  }
};

// Helper function to hash password (simplified for demo)
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to get permissions by role
function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['all'];
    case 'manager':
      return ['dashboard', 'customers', 'vehicles', 'reports', 'maintenance', 'vendors', 'kir', 'tax', 'pricing', 'hpp', 'invoices'];
    case 'telemarketing-mobil':
      return ['customers-mobil'];
    case 'telemarketing-bus':
      return ['customers-bus'];
    case 'telemarketing-elf':
      return ['customers-elf'];
    case 'telemarketing-hiace':
      return ['customers-hiace'];
    default:
      return [];
  }
}