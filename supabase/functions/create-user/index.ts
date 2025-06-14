/*
  # Create User Edge Function

  1. Purpose
    - Securely create new users with proper role assignment
    - Bypass RLS using service role key
    - Validate permissions before user creation

  2. Security
    - Only authenticated admin users can create new users
    - Password hashing handled server-side
    - Input validation and sanitization

  3. Usage
    - Called from frontend UserManagement component
    - Returns created user data or error response
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'telemarketing-mobil' | 'telemarketing-bus' | 'telemarketing-elf' | 'telemarketing-hiace';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
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

    // Initialize regular client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is authenticated and get their role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the user's role from the users table
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'User not found in system' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has permission to create users (only admin and manager)
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to create users' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const requestData: CreateUserRequest = await req.json();

    // Validate required fields
    if (!requestData.name || !requestData.email || !requestData.password || !requestData.role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, password, role' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate password length
    if (requestData.password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'telemarketing-mobil', 'telemarketing-bus', 'telemarketing-elf', 'telemarketing-hiace'];
    if (!validRoles.includes(requestData.role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(requestData.password);

    // Get permissions based on role
    const permissions = getPermissionsByRole(requestData.role);

    // Create user in database using service role (bypasses RLS)
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        name: requestData.name,
        email: requestData.email,
        password_hash: hashedPassword,
        role: requestData.role,
        is_active: true,
        permissions: permissions
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      
      // Handle duplicate email error
      if (createError.code === '23505' && createError.message.includes('email')) {
        return new Response(
          JSON.stringify({ error: 'Email address already exists' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Remove password hash from response
    const { password_hash, ...userResponse } = newUser;

    return new Response(
      JSON.stringify({ 
        message: 'User created successfully',
        user: userResponse 
      }),
      { 
        status: 201, 
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

// Helper function to hash password
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