import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Hash password function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create admin user
async function createAdminUser() {
  try {
    console.log('Creating administrator account...');

    const adminData = {
      name: 'Administrator Rentalinx',
      email: 'admin@rentalinx.com',
      password: 'Admin123!',
      role: 'admin'
    };

    // Hash the password
    const hashedPassword = await hashPassword(adminData.password);

    // Insert user into database
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: adminData.name,
        email: adminData.email,
        password_hash: hashedPassword,
        role: adminData.role,
        is_active: true,
        permissions: ['all']
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' && error.message.includes('email')) {
        console.log('✅ Administrator account already exists');
        console.log('📧 Email: admin@rentalinx.com');
        console.log('🔑 Password: Admin123!');
        return;
      }
      throw error;
    }

    console.log('✅ Administrator account created successfully!');
    console.log('📧 Email: admin@rentalinx.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 User ID:', user.id);
    console.log('');
    console.log('🚀 You can now login to the system with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();