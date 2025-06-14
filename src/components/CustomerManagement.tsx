import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Star, AlertTriangle, Target, Users, Car, Bus, Truck, X, Save, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { customerService } from '../services/customerService';
import { useCustomers } from '../hooks/useSupabaseData';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  license_number: string;
  license_expiry: string;
  date_of_birth: string;
  loyalty_points: number;
  is_blacklisted: boolean;
  is_sales_goal: boolean;
  sales_goal_notes?: string;
  preferred_vehicle_type: 'mobil' | 'bus' | 'elf' | 'hiace' | 'mixed';
  vehicle_history: string[];
  total_rental_days: number;
  average_rental_duration: number;
  longest_rental_duration: number;
  shortest_rental_duration: number;
  created_at: string;
  updated_at: string;
}

const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [salesGoalFilter, setSalesGoalFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get vehicle type for telemarketing users
  const userVehicleType = user?.role?.startsWith('telemarketing') ? user.role.split('-')[1] : undefined;
  
  // Use the custom hook to fetch customers
  const { data: customers, loading, error, refetch } = useCustomers(userVehicleType);

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = 
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesSalesGoal = salesGoalFilter === 'all' || 
      (salesGoalFilter === 'sales-goal' && customer.is_sales_goal) ||
      (salesGoalFilter === 'not-sales-goal' && !customer.is_sales_goal);
    
    const matchesVehicleType = vehicleTypeFilter === 'all' || 
      customer.preferred_vehicle_type === vehicleTypeFilter ||
      (vehicleTypeFilter === 'mixed' && customer.preferred_vehicle_type === 'mixed');
    
    const matchesDuration = durationFilter === 'all' ||
      (durationFilter === 'short' && customer.average_rental_duration <= 3) ||
      (durationFilter === 'medium' && customer.average_rental_duration > 3 && customer.average_rental_duration <= 14) ||
      (durationFilter === 'long' && customer.average_rental_duration > 14);
    
    return matchesSearch && matchesSalesGoal && matchesVehicleType && matchesDuration;
  });

  // Get available vehicle types based on user role
  const getAvailableVehicleTypes = () => {
    if (user?.role?.startsWith('telemarketing')) {
      const vehicleType = user.role.split('-')[1];
      return [vehicleType];
    }
    return ['mobil', 'bus', 'elf', 'hiace', 'mixed'];
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'mobil':
        return <Car size={16} className="text-blue-500" />;
      case 'bus':
        return <Bus size={16} className="text-green-500" />;
      case 'elf':
        return <Truck size={16} className="text-orange-500" />;
      case 'hiace':
        return <Truck size={16} className="text-purple-500" />;
      case 'mixed':
        return <Users size={16} className="text-gray-500" />;
      default:
        return <Car size={16} className="text-gray-500" />;
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case 'mobil':
        return 'bg-blue-100 text-blue-800';
      case 'bus':
        return 'bg-green-100 text-green-800';
      case 'elf':
        return 'bg-orange-100 text-orange-800';
      case 'hiace':
        return 'bg-purple-100 text-purple-800';
      case 'mixed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case 'mobil':
        return 'Mobil';
      case 'bus':
        return 'Bus';
      case 'elf':
        return 'Elf';
      case 'hiace':
        return 'Hiace';
      case 'mixed':
        return 'Mixed';
      default:
        return type;
    }
  };

  const getDurationCategory = (avgDuration: number) => {
    if (avgDuration <= 3) return { label: 'Pendek', color: 'bg-red-100 text-red-800', icon: Clock };
    if (avgDuration <= 14) return { label: 'Menengah', color: 'bg-yellow-100 text-yellow-800', icon: Calendar };
    return { label: 'Panjang', color: 'bg-green-100 text-green-800', icon: Calendar };
  };

  // Statistics by vehicle type (filtered by user role)
  const availableVehicleTypes = getAvailableVehicleTypes();
  const vehicleTypeStats = availableVehicleTypes.map(type => ({
    type,
    count: customers.filter((c: Customer) => c.preferred_vehicle_type === type).length,
    salesGoalCount: customers.filter((c: Customer) => c.preferred_vehicle_type === type && c.is_sales_goal).length,
    avgLoyaltyPoints: customers.filter((c: Customer) => c.preferred_vehicle_type === type).length > 0 
      ? Math.round(customers.filter((c: Customer) => c.preferred_vehicle_type === type).reduce((sum: number, c: Customer) => sum + c.loyalty_points, 0) / customers.filter((c: Customer) => c.preferred_vehicle_type === type).length)
      : 0,
    avgRentalDuration: customers.filter((c: Customer) => c.preferred_vehicle_type === type).length > 0 
      ? Math.round(customers.filter((c: Customer) => c.preferred_vehicle_type === type).reduce((sum: number, c: Customer) => sum + c.average_rental_duration, 0) / customers.filter((c: Customer) => c.preferred_vehicle_type === type).length * 10) / 10
      : 0
  }));

  // Duration statistics
  const durationStats = {
    short: customers.filter((c: Customer) => c.average_rental_duration <= 3).length,
    medium: customers.filter((c: Customer) => c.average_rental_duration > 3 && c.average_rental_duration <= 14).length,
    long: customers.filter((c: Customer) => c.average_rental_duration > 14).length,
    totalDays: customers.reduce((sum: number, c: Customer) => sum + c.total_rental_days, 0),
    avgDuration: customers.length > 0 ? Math.round(customers.reduce((sum: number, c: Customer) => sum + c.average_rental_duration, 0) / customers.length * 10) / 10 : 0
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      license_number: customer.license_number,
      license_expiry: customer.license_expiry,
      date_of_birth: customer.date_of_birth,
      loyalty_points: customer.loyalty_points,
      is_blacklisted: customer.is_blacklisted,
      is_sales_goal: customer.is_sales_goal,
      sales_goal_notes: customer.sales_goal_notes,
      preferred_vehicle_type: customer.preferred_vehicle_type,
      vehicle_history: customer.vehicle_history,
      total_rental_days: customer.total_rental_days,
      average_rental_duration: customer.average_rental_duration,
      longest_rental_duration: customer.longest_rental_duration,
      shortest_rental_duration: customer.shortest_rental_duration
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      await customerService.update(selectedCustomer.id, editFormData);
      await refetch();
      setShowEditModal(false);
      setSelectedCustomer(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Gagal mengupdate pelanggan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      await customerService.delete(selectedCustomer.id);
      await refetch();
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Gagal menghapus pelanggan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add customer
  const handleAddCustomer = async (formData: FormData) => {
    const customerData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      license_number: formData.get('licenseNumber') as string,
      license_expiry: formData.get('licenseExpiry') as string,
      date_of_birth: formData.get('dateOfBirth') as string,
      loyalty_points: parseInt(formData.get('loyaltyPoints') as string) || 0,
      is_blacklisted: formData.get('isBlacklisted') === 'on',
      is_sales_goal: formData.get('salesGoal') === 'true',
      sales_goal_notes: formData.get('salesGoalNotes') as string || null,
      preferred_vehicle_type: formData.get('preferredVehicleType') as any,
      vehicle_history: [formData.get('preferredVehicleType') as string],
      total_rental_days: parseInt(formData.get('totalRentalDays') as string) || 0,
      average_rental_duration: parseFloat(formData.get('averageRentalDuration') as string) || 0,
      longest_rental_duration: parseInt(formData.get('longestRentalDuration') as string) || 0,
      shortest_rental_duration: parseInt(formData.get('shortestRentalDuration') as string) || 0
    };

    setIsLoading(true);
    try {
      await customerService.create(customerData);
      await refetch();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Gagal menambah pelanggan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const AddCustomerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tambah Pelanggan Baru</h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleAddCustomer(formData);
        }} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Depan</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama depan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama belakang"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan alamat email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <textarea
                name="address"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Masukkan alamat lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor SIM</label>
              <input
                type="text"
                name="licenseNumber"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nomor SIM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kadaluarsa SIM</label>
              <input
                type="date"
                name="licenseExpiry"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferensi Kendaraan</label>
              <select name="preferredVehicleType" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih jenis kendaraan</option>
                {availableVehicleTypes.map(type => (
                  <option key={type} value={type}>{getVehicleTypeName(type)}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rental Duration History */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Durasi Sewa</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Hari Sewa</label>
                <input
                  type="number"
                  name="totalRentalDays"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rata-rata Durasi (hari)</label>
                <input
                  type="number"
                  step="0.1"
                  name="averageRentalDuration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sewa Terpanjang (hari)</label>
                <input
                  type="number"
                  name="longestRentalDuration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sewa Terpendek (hari)</label>
                <input
                  type="number"
                  name="shortestRentalDuration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Sales Goal Classification */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Klasifikasi Sales Goal</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="salesGoal"
                    value="true"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Sales Goal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="salesGoal"
                    value="false"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Not Sales Goal</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Sales Goal (Opsional)</label>
                <textarea
                  name="salesGoalNotes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Masukkan catatan untuk pelanggan sales goal"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Tambah Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditCustomerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Pelanggan</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Depan</label>
              <input
                type="text"
                value={editFormData.first_name || ''}
                onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama depan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang</label>
              <input
                type="text"
                value={editFormData.last_name || ''}
                onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama belakang"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan alamat email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
              <input
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <textarea
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Masukkan alamat lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor SIM</label>
              <input
                type="text"
                value={editFormData.license_number || ''}
                onChange={(e) => setEditFormData({...editFormData, license_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nomor SIM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kadaluarsa SIM</label>
              <input
                type="date"
                value={editFormData.license_expiry || ''}
                onChange={(e) => setEditFormData({...editFormData, license_expiry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
              <input
                type="date"
                value={editFormData.date_of_birth || ''}
                onChange={(e) => setEditFormData({...editFormData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poin Loyalitas</label>
              <input
                type="number"
                value={editFormData.loyalty_points || 0}
                onChange={(e) => setEditFormData({...editFormData, loyalty_points: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan poin loyalitas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferensi Kendaraan</label>
              <select 
                value={editFormData.preferred_vehicle_type || ''}
                onChange={(e) => setEditFormData({...editFormData, preferred_vehicle_type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih jenis kendaraan</option>
                {availableVehicleTypes.map(type => (
                  <option key={type} value={type}>{getVehicleTypeName(type)}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rental Duration History */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Durasi Sewa</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Hari Sewa</label>
                <input
                  type="number"
                  value={editFormData.total_rental_days || 0}
                  onChange={(e) => setEditFormData({...editFormData, total_rental_days: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rata-rata Durasi (hari)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData.average_rental_duration || 0}
                  onChange={(e) => setEditFormData({...editFormData, average_rental_duration: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sewa Terpanjang (hari)</label>
                <input
                  type="number"
                  value={editFormData.longest_rental_duration || 0}
                  onChange={(e) => setEditFormData({...editFormData, longest_rental_duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sewa Terpendek (hari)</label>
                <input
                  type="number"
                  value={editFormData.shortest_rental_duration || 0}
                  onChange={(e) => setEditFormData({...editFormData, shortest_rental_duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Sales Goal Classification */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Klasifikasi Sales Goal</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editSalesGoal"
                    checked={editFormData.is_sales_goal === true}
                    onChange={() => setEditFormData({...editFormData, is_sales_goal: true})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Sales Goal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editSalesGoal"
                    checked={editFormData.is_sales_goal === false}
                    onChange={() => setEditFormData({...editFormData, is_sales_goal: false})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Not Sales Goal</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Sales Goal (Opsional)</label>
                <textarea
                  value={editFormData.sales_goal_notes || ''}
                  onChange={(e) => setEditFormData({...editFormData, sales_goal_notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Masukkan catatan untuk pelanggan sales goal"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Pelanggan</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBlacklisted"
                checked={editFormData.is_blacklisted || false}
                onChange={(e) => setEditFormData({...editFormData, is_blacklisted: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isBlacklisted" className="ml-2 block text-sm text-gray-900">
                Masukkan ke daftar hitam
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Pelanggan</h3>
              <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          
          {selectedCustomer && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Anda akan menghapus pelanggan:
              </p>
              <p className="font-semibold text-gray-900 mt-1">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </p>
              <p className="text-sm text-gray-600">
                {selectedCustomer.email}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-2" />
              {isLoading ? 'Menghapus...' : 'Hapus Pelanggan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Gagal memuat data pelanggan</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pelanggan</h1>
          <p className="text-gray-600 mt-2">
            Kelola pelanggan berdasarkan jenis kendaraan dan durasi sewa
            {user?.role?.startsWith('telemarketing') && (
              <span className="block text-sm text-blue-600 mt-1">
                Anda mengelola pelanggan untuk: {getVehicleTypeName(user.role.split('-')[1])}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah Pelanggan
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelanggan berdasarkan nama, email, atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {!user?.role?.startsWith('telemarketing') && (
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Jenis Kendaraan</option>
              <option value="mobil">Mobil</option>
              <option value="bus">Bus</option>
              <option value="elf">Elf</option>
              <option value="hiace">Hiace</option>
              <option value="mixed">Mixed</option>
            </select>
          )}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Durasi</option>
            <option value="short">Pendek (≤3 hari)</option>
            <option value="medium">Menengah (4-14 hari)</option>
            <option value="long">Panjang ({'>'}14 hari)</option>
          </select>
          <select
            value={salesGoalFilter}
            onChange={(e) => setSalesGoalFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Klasifikasi</option>
            <option value="sales-goal">Sales Goal</option>
            <option value="not-sales-goal">Not Sales Goal</option>
          </select>
        </div>
      </div>

      {/* Duration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sewa Pendek</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{durationStats.short}</p>
              <p className="text-xs text-gray-500 mt-1">≤3 hari</p>
            </div>
            <Clock className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sewa Menengah</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{durationStats.medium}</p>
              <p className="text-xs text-gray-500 mt-1">4-14 hari</p>
            </div>
            <Calendar className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sewa Panjang</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{durationStats.long}</p>
              <p className="text-xs text-gray-500 mt-1">{'>'} 14 hari</p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hari Sewa</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{durationStats.totalDays}</p>
              <p className="text-xs text-gray-500 mt-1">Semua pelanggan</p>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Durasi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{durationStats.avgDuration}</p>
              <p className="text-xs text-gray-500 mt-1">hari per sewa</p>
            </div>
            <Clock className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Vehicle Type Statistics */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(availableVehicleTypes.length, 5)} gap-6`}>
        {vehicleTypeStats.map((stats) => (
          <div key={stats.type} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getVehicleTypeIcon(stats.type)}
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{getVehicleTypeName(stats.type)}</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-sm font-medium text-gray-900">{stats.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sales Goal:</span>
                <span className="text-sm font-medium text-green-600">{stats.salesGoalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Durasi:</span>
                <span className="text-sm font-medium text-gray-900">{stats.avgRentalDuration} hari</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
            </div>
            <User className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Goal</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.filter((c: Customer) => c.is_sales_goal).length}</p>
            </div>
            <Target className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not Sales Goal</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.filter((c: Customer) => !c.is_sales_goal).length}</p>
            </div>
            <Users className="text-gray-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daftar Hitam</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.filter((c: Customer) => c.is_blacklisted).length}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferensi Kendaraan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi Sewa</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Goal</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin Loyalitas</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer: Customer) => {
                const durationCategory = getDurationCategory(customer.average_rental_duration);
                const IconComponent = durationCategory.icon;
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.first_name[0]}{customer.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Anggota sejak {new Date(customer.created_at).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getVehicleTypeIcon(customer.preferred_vehicle_type)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVehicleTypeColor(customer.preferred_vehicle_type)}`}>
                          {getVehicleTypeName(customer.preferred_vehicle_type)}
                        </span>
                      </div>
                      {customer.vehicle_history.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Riwayat: {customer.vehicle_history.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center mb-1">
                        <IconComponent size={16} className="mr-1" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${durationCategory.color}`}>
                          {durationCategory.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Rata-rata: {customer.average_rental_duration} hari</div>
                        <div>Total: {customer.total_rental_days} hari</div>
                        <div>Range: {customer.shortest_rental_duration}-{customer.longest_rental_duration} hari</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.is_sales_goal ? (
                          <div className="flex items-center">
                            <Target size={16} className="text-green-500 mr-2" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Sales Goal
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-400 mr-2" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Not Sales Goal
                            </span>
                          </div>
                        )}
                      </div>
                      {customer.sales_goal_notes && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {customer.sales_goal_notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{customer.loyalty_points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.is_blacklisted 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.is_blacklisted ? 'Daftar Hitam' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit pelanggan"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus pelanggan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pelanggan ditemukan</h3>
          <p className="text-gray-600">Coba sesuaikan kriteria pencarian atau tambah pelanggan baru.</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddCustomerModal />}
      {showEditModal && <EditCustomerModal />}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
};

export default CustomerManagement;