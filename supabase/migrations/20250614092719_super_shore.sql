/*
  # Complete Database Schema for Rentalinx Car Rental System

  1. New Tables
    - `users` - System users with role-based access
    - `customers` - Customer management with vehicle preferences and rental history
    - `vehicles` - Vehicle fleet management
    - `kir_records` - Vehicle inspection records
    - `tax_records` - Vehicle tax management with optional 12% tax
    - `maintenance_records` - Vehicle maintenance tracking
    - `vendors` - Vendor management by vehicle type
    - `competitor_prices` - Price tracking for market analysis
    - `invoices` - Invoice management with duration tracking
    - `invoice_items` - Invoice line items with rental details
    - `hpp_calculations` - Cost calculation records

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'telemarketing-mobil', 'telemarketing-bus', 'telemarketing-elf', 'telemarketing-hiace')),
  is_active boolean DEFAULT true,
  permissions text[] DEFAULT '{}',
  last_login timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  license_number text NOT NULL,
  license_expiry date NOT NULL,
  date_of_birth date NOT NULL,
  loyalty_points integer DEFAULT 0,
  is_blacklisted boolean DEFAULT false,
  is_sales_goal boolean DEFAULT false,
  sales_goal_notes text,
  preferred_vehicle_type text NOT NULL CHECK (preferred_vehicle_type IN ('mobil', 'bus', 'elf', 'hiace', 'mixed')),
  vehicle_history text[] DEFAULT '{}',
  total_rental_days integer DEFAULT 0,
  average_rental_duration numeric(5,2) DEFAULT 0,
  longest_rental_duration integer DEFAULT 0,
  shortest_rental_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text UNIQUE NOT NULL,
  vin text UNIQUE NOT NULL,
  color text NOT NULL,
  fuel_type text NOT NULL,
  transmission text NOT NULL,
  seats integer NOT NULL,
  daily_rate numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  mileage integer DEFAULT 0,
  acquisition_cost numeric(12,2) NOT NULL,
  kir_expiry date,
  tax_due date,
  insurance_expiry date,
  last_service date,
  next_service date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KIR Records table
CREATE TABLE IF NOT EXISTS kir_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  vehicle_plate text NOT NULL,
  inspection_date date NOT NULL,
  expiry_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('valid', 'expired', 'expiring-soon')),
  inspector text NOT NULL,
  certificate_number text NOT NULL,
  cost numeric(10,2) DEFAULT 0,
  notes text,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tax Records table
CREATE TABLE IF NOT EXISTS tax_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  vehicle_plate text NOT NULL,
  tax_type text NOT NULL CHECK (tax_type IN ('annual', 'transfer', 'penalty')),
  tax_year integer NOT NULL,
  base_amount numeric(12,2) NOT NULL,
  has_tax boolean DEFAULT false,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')),
  description text,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maintenance Records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  vehicle_plate text NOT NULL,
  type text NOT NULL CHECK (type IN ('scheduled', 'repair', 'inspection')),
  description text NOT NULL,
  scheduled_date date NOT NULL,
  completed_date date,
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  cost numeric(10,2) DEFAULT 0,
  technician text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('mobil', 'bus', 'elf', 'hiace')),
  category text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  services text[] DEFAULT '{}',
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Competitor Prices table
CREATE TABLE IF NOT EXISTS competitor_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor text NOT NULL,
  vehicle_category text NOT NULL,
  daily_rate numeric(10,2) NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  has_tax boolean DEFAULT false,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes text,
  total_rental_days integer DEFAULT 0,
  average_daily_rate numeric(10,2) DEFAULT 0,
  duration_discount numeric(10,2) DEFAULT 0,
  duration_discount_percentage numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id),
  rental_days integer,
  start_date date,
  end_date date,
  duration_category text CHECK (duration_category IN ('short', 'medium', 'long', 'extended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HPP Calculations table
CREATE TABLE IF NOT EXISTS hpp_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  period text NOT NULL,
  acquisition_cost numeric(12,2) NOT NULL,
  maintenance_costs numeric(12,2) DEFAULT 0,
  insurance_costs numeric(12,2) DEFAULT 0,
  tax_costs numeric(12,2) DEFAULT 0,
  fuel_costs numeric(12,2) DEFAULT 0,
  depreciation_costs numeric(12,2) DEFAULT 0,
  operating_costs numeric(12,2) DEFAULT 0,
  total_costs numeric(12,2) NOT NULL,
  revenue numeric(12,2) NOT NULL,
  profit numeric(12,2) NOT NULL,
  profit_margin numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kir_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for Customers table
CREATE POLICY "All authenticated users can read customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can manage customers" ON customers
  FOR ALL TO authenticated
  USING (true);

-- RLS Policies for Vehicles table
CREATE POLICY "All authenticated users can read vehicles" ON vehicles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage vehicles" ON vehicles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for KIR Records table
CREATE POLICY "All authenticated users can read kir_records" ON kir_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage kir_records" ON kir_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Tax Records table
CREATE POLICY "All authenticated users can read tax_records" ON tax_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage tax_records" ON tax_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Maintenance Records table
CREATE POLICY "All authenticated users can read maintenance_records" ON maintenance_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage maintenance_records" ON maintenance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Vendors table
CREATE POLICY "All authenticated users can read vendors" ON vendors
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage vendors" ON vendors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Competitor Prices table
CREATE POLICY "All authenticated users can read competitor_prices" ON competitor_prices
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage competitor_prices" ON competitor_prices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Invoices table
CREATE POLICY "All authenticated users can read invoices" ON invoices
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (true);

-- RLS Policies for Invoice Items table
CREATE POLICY "All authenticated users can read invoice_items" ON invoice_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can manage invoice_items" ON invoice_items
  FOR ALL TO authenticated
  USING (true);

-- RLS Policies for HPP Calculations table
CREATE POLICY "All authenticated users can read hpp_calculations" ON hpp_calculations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage hpp_calculations" ON hpp_calculations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_preferred_vehicle_type ON customers(preferred_vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_kir_records_vehicle_id ON kir_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_kir_records_status ON kir_records(status);
CREATE INDEX IF NOT EXISTS idx_tax_records_vehicle_id ON tax_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_status ON tax_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_vendors_vehicle_type ON vendors(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kir_records_updated_at BEFORE UPDATE ON kir_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_records_updated_at BEFORE UPDATE ON tax_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_prices_updated_at BEFORE UPDATE ON competitor_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hpp_calculations_updated_at BEFORE UPDATE ON hpp_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();