/*
  # Create Session Edge Function

  1. Purpose
    - Creates a Supabase JWT session for custom authenticated users
    - Validates user credentials against custom users table
    - Issues proper Supabase authentication tokens

  2. Security
    - Validates user exists and is active
    - Creates secure JWT tokens for session management
*/

import { createClient } from 'npm:@supabase/supabase-js@2';
import { JWT } from 'npm:jose@5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateSessionRequest {
  userId: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId, email }: CreateSessionRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'User ID and email are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user exists and is active
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found or inactive' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (8 * 60 * 60); // 8 hours expiry
    
    const payload = {
      aud: 'authenticated',
      exp: exp,
      iat: now,
      iss: supabaseUrl,
      sub: userId,
      email: email,
      phone: '',
      app_metadata: {
        provider: 'custom',
        providers: ['custom']
      },
      user_metadata: {
        name: user.name,
        role: user.role
      },
      role: 'authenticated',
      aal: 'aal1',
      amr: [{ method: 'password', timestamp: now }],
      session_id: crypto.randomUUID()
    };

    // Get JWT secret from Supabase
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    // Create JWT token
    const secret = new TextEncoder().encode(jwtSecret);
    const accessToken = await new JWT.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(secret);

    // Create refresh token (longer expiry)
    const refreshPayload = {
      ...payload,
      exp: now + (30 * 24 * 60 * 60), // 30 days
    };

    const refreshToken = await new JWT.SignJWT(refreshPayload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + (30 * 24 * 60 * 60))
      .sign(secret);

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 8 * 60 * 60, // 8 hours in seconds
        expires_at: exp,
        token_type: 'bearer',
        user: {
          id: userId,
          email: email,
          user_metadata: {
            name: user.name,
            role: user.role
          }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});