export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: Date;
  dateOfBirth: Date;
  loyaltyPoints: number;
  isBlacklisted: boolean;
  isSalesGoal: boolean; // New field for sales goal classification
  salesGoalNotes?: string; // Optional notes for sales goal customers
  preferredVehicleType: 'mobil' | 'bus' | 'elf' | 'hiace' | 'mixed'; // New field for vehicle preference
  vehicleHistory: string[]; // Track which vehicle types they've rented
  totalRentalDays: number; // Total days of rental history
  averageRentalDuration: number; // Average rental duration in days
  longestRentalDuration: number; // Longest single rental in days
  shortestRentalDuration: number; // Shortest single rental in days
  createdAt: Date;
  documents: Document[];
  rentalHistory: Rental[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  fuelType: string;
  transmission: string;
  seats: number;
  dailyRate: number;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  mileage: number;
  kirExpiry: Date;
  taxDue: Date;
  insuranceExpiry: Date;
  lastService: Date;
  nextService: Date;
  acquisitionCost: number;
  createdAt: Date;
}

export interface KIRRecord {
  id: string;
  vehicleId: string;
  inspectionDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expired' | 'due';
  cost: number;
  inspector: string;
  notes: string;
  documentUrl?: string;
}

export interface TaxRecord {
  id: string;
  vehicleId: string;
  taxYear: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  documentUrl?: string;
  // New fields for optional tax
  hasTax: boolean; // Whether this record includes 12% tax
  baseAmount: number; // Amount before tax
  taxAmount: number; // 12% tax amount
  taxRate: number; // Tax rate (default 12%)
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  date: Date;
  nextServiceDate?: Date;
  vendorId: string;
  mileage: number;
  parts: string[];
  labor: number;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  vehicleType: 'mobil' | 'bus' | 'elf' | 'hiace'; // New field for vehicle type specialization
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  services: string[];
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  specialization?: string; // Additional specialization notes
}

export interface Rental {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  dailyRate: number;
  totalAmount: number;
  deposit: number;
  status: 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  returnLocation: string;
  notes: string;
  // New fields for optional tax
  hasTax: boolean; // Whether this rental includes 12% tax
  baseAmount: number; // Amount before tax
  taxAmount: number; // 12% tax amount
  taxRate: number; // Tax rate (default 12%)
  // Duration tracking
  plannedDuration: number; // Planned rental duration in days
  actualDuration?: number; // Actual rental duration in days
  durationCategory: 'short' | 'medium' | 'long' | 'extended'; // Duration category
}

export interface CompetitorPrice {
  id: string;
  competitor: string;
  vehicleCategory: string;
  dailyRate: number;
  location: string;
  date: Date;
  notes: string;
}

export interface HPPCalculation {
  vehicleId: string;
  period: string;
  acquisitionCost: number;
  maintenanceCosts: number;
  insuranceCosts: number;
  taxCosts: number;
  fuelCosts: number;
  depreciationCosts: number;
  operatingCosts: number;
  totalCosts: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'telemarketing-mobil' | 'telemarketing-bus' | 'telemarketing-elf' | 'telemarketing-hiace';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  permissions: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  hasTax: boolean; // Whether this invoice includes 12% tax
  taxRate: number; // Tax rate (default 12%)
  taxAmount: number; // 12% tax amount
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Duration tracking
  totalRentalDays: number; // Total rental days across all items
  averageDailyRate: number; // Average daily rate across all items
  durationDiscount?: number; // Discount for long-term rentals
  durationDiscountPercentage?: number; // Discount percentage for long-term rentals
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vehicleId?: string;
  rentalDays?: number;
  startDate?: Date; // Rental start date
  endDate?: Date; // Rental end date
  durationCategory?: 'short' | 'medium' | 'long' | 'extended'; // Duration category
}