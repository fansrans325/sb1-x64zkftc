import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Hash password function (same as in AuthContext)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Demo users to create
const demoUsers = [
  {
    name: 'Administrator Rentalinx',
    email: 'admin@rentalinx.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Manager Rentalinx',
    email: 'manager@rentalinx.com',
    password: 'password123',
    role: 'manager'
  },
  {
    name: 'Sari Telemarketing Mobil',
    email: 'sari.mobil@rentalinx.com',
    password: 'password123',
    role: 'telemarketing-mobil'
  },
  {
    name: 'Budi Telemarketing Bus',
    email: 'budi.bus@rentalinx.com',
    password: 'password123',
    role: 'telemarketing-bus'
  }
];

// Create demo users
async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users...\n');

    // First, let's check if users table exists and is accessible
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .limit(1);

    if (checkError) {
      console.error('❌ Error accessing users table:', checkError);
      return;
    }

    console.log('✅ Users table is accessible');

    for (const userData of demoUsers) {
      console.log(`\n📝 Processing user: ${userData.email}`);

      // Check if user already exists
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        console.log(`   ⚠️  User already exists, updating password...`);
        
        // Update existing user with new password
        const hashedPassword = await hashPassword(userData.password);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            password_hash: hashedPassword,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', userData.email);

        if (updateError) {
          console.error(`   ❌ Error updating user:`, updateError);
        } else {
          console.log(`   ✅ User updated successfully`);
        }
      } else {
        console.log(`   📝 Creating new user...`);
        
        // Hash the password
        const hashedPassword = await hashPassword(userData.password);
        
        // Get permissions based on role
        let permissions = [];
        switch (userData.role) {
          case 'admin':
            permissions = ['all'];
            break;
          case 'manager':
            permissions = ['dashboard', 'customers', 'vehicles', 'reports', 'maintenance', 'vendors', 'kir', 'tax', 'pricing', 'hpp', 'invoices'];
            break;
          case 'telemarketing-mobil':
            permissions = ['customers'];
            break;
          case 'telemarketing-bus':
            permissions = ['customers'];
            break;
          default:
            permissions = [];
        }

        // Insert user into database
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            name: userData.name,
            email: userData.email,
            password_hash: hashedPassword,
            role: userData.role,
            is_active: true,
            permissions: permissions
          })
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ Error creating user:`, insertError);
        } else {
          console.log(`   ✅ User created successfully`);
        }
      }
    }

    console.log('\n🎉 Demo users setup completed!\n');
    console.log('📋 Available login credentials:');
    console.log('================================');
    
    demoUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log('');
    });

    // Test password hashing
    console.log('🔍 Testing password hashing...');
    const testPassword = 'Admin123!';
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Hash 1: ${hash1.substring(0, 20)}...`);
    console.log(`   Hash 2: ${hash2.substring(0, 20)}...`);
    console.log(`   Hashes match: ${hash1 === hash2}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createDemoUsers();