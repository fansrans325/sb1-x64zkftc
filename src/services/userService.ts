import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Helper function to hash password (same as in AuthContext)
async function hashPassword(password: string): Promise<string> {
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
      return ['customers'];
    case 'telemarketing-bus':
      return ['customers'];
    case 'telemarketing-elf':
      return ['customers'];
    case 'telemarketing-hiace':
      return ['customers'];
    default:
      return [];
  }
}

export const userService = {
  // Get all users using service role key
  async getAll(): Promise<User[]> {
    try {
      console.log('📊 Fetching all users...');
      
      // Create admin client with service role key
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('✅ Users fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Service error:', error);
      return null;
    }
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | null> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Error fetching user by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Service error:', error);
      return null;
    }
  },

  // Create new user directly in database
  async create(user: { name: string; email: string; password: string; role: string }): Promise<User> {
    try {
      console.log('➕ Creating user:', user.email);
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Hash password
      const hashedPassword = await hashPassword(user.password);
      
      // Get permissions based on role
      const permissions = getPermissionsByRole(user.role);

      // Insert user into database
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          password_hash: hashedPassword,
          role: user.role,
          is_active: true,
          permissions: permissions
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        
        // Handle duplicate email error
        if (error.code === '23505' && error.message.includes('email')) {
          throw new Error('Email address already exists');
        }
        
        throw new Error(`Failed to create user: ${error.message}`);
      }

      console.log('✅ User created successfully:', data.email);
      return data;
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Update user directly in database
  async update(id: string, updates: { name?: string; email?: string; role?: string; password?: string; is_active?: boolean }): Promise<User> {
    try {
      console.log('✏️ Updating user:', id);
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Prepare update data
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      
      if (updates.role !== undefined) {
        updateData.role = updates.role;
        updateData.permissions = getPermissionsByRole(updates.role);
      }
      
      if (updates.password && updates.password.trim()) {
        updateData.password_hash = await hashPassword(updates.password);
      }

      // Update user in database
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      console.log('✅ User updated successfully:', data.email);
      return data;
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Delete user directly from database
  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting user:', id);
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting user:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Toggle user active status
  async toggleStatus(id: string): Promise<User> {
    try {
      const user = await this.getById(id);
      if (!user) {
        throw new Error('User not found');
      }

      return await this.update(id, { is_active: !user.is_active });
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Search users
  async search(query: string): Promise<User[]> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching users:', error);
        throw new Error(`Failed to search users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  },

  // Get users by role
  async getByRole(role: string): Promise<User[]> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users by role:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  }
};