import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UpdateUserRequest {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  is_active?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const { userId, name, email, role, password, is_active }: UpdateUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare update data for users table
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      updateData.role = role;
      updateData.permissions = getPermissionsByRole(role);
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update user in custom users table
    const { data: userData, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user record:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user record: ' + updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update auth user if email or password changed
    const authUpdates: any = {};
    if (email !== undefined) authUpdates.email = email;
    if (password !== undefined && password.trim()) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
      );

      if (authError) {
        console.error('Error updating auth user:', authError);
        return new Response(
          JSON.stringify({ error: 'User updated but failed to update auth: ' + authError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ user: userData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

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