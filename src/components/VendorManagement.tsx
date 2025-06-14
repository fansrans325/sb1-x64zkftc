import React, { useState } from 'react';
import { Plus, Search, Filter, Star, Phone, Mail, MapPin, DollarSign, Package, Edit, Trash2, Car, Bus, Truck } from 'lucide-react';
import { Vendor } from '../types';
import { mockVendors } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const VendorManagement: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter vendors based on user role
  const getFilteredVendorsByRole = () => {
    let filteredByRole = vendors;
    
    // If user is telemarketing, only show vendors for their vehicle type
    if (user?.role?.startsWith('telemarketing')) {
      const vehicleType = user.role.split('-')[1]; // mobil, bus, elf, hiace
      filteredByRole = vendors.filter(vendor => vendor.vehicleType === vehicleType);
    }
    
    return filteredByRole;
  };

  const filteredVendors = getFilteredVendorsByRole().filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesVehicleType = vehicleTypeFilter === 'all' || vendor.vehicleType === vehicleTypeFilter;
    
    return matchesSearch && matchesCategory && matchesVehicleType;
  });

  // Get available vehicle types based on user role
  const getAvailableVehicleTypes = () => {
    if (user?.role?.startsWith('telemarketing')) {
      const vehicleType = user.role.split('-')[1];
      return [vehicleType];
    }
    return ['mobil', 'bus', 'elf', 'hiace'];
  };

  const roleFilteredVendors = getFilteredVendorsByRole();
  const totalVendors = roleFilteredVendors.length;
  const activeVendors = roleFilteredVendors.filter(v => v.isActive).length;
  const totalSpent = roleFilteredVendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0);
  const avgRating = roleFilteredVendors.length > 0 ? roleFilteredVendors.reduce((sum, vendor) => sum + vendor.rating, 0) / roleFilteredVendors.length : 0;

  const categories = [...new Set(roleFilteredVendors.map(v => v.category))];
  const vehicleTypes = getAvailableVehicleTypes();

  // Statistics by vehicle type (filtered by user role)
  const vendorsByType = vehicleTypes.map(type => ({
    type,
    count: roleFilteredVendors.filter(v => v.vehicleType === type).length,
    totalSpent: roleFilteredVendors.filter(v => v.vehicleType === type).reduce((sum, v) => sum + v.totalSpent, 0),
    avgRating: roleFilteredVendors.filter(v => v.vehicleType === type).length > 0 
      ? roleFilteredVendors.filter(v => v.vehicleType === type).reduce((sum, v) => sum + v.rating, 0) / roleFilteredVendors.filter(v => v.vehicleType === type).length 
      : 0
  }));

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'mobil':
        return <Car size={20} className="text-blue-500" />;
      case 'bus':
        return <Bus size={20} className="text-green-500" />;
      case 'elf':
        return <Truck size={20} className="text-orange-500" />;
      case 'hiace':
        return <Truck size={20} className="text-purple-500" />;
      default:
        return <Package size={20} className="text-gray-500" />;
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
      default:
        return type;
    }
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const AddVendorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tambah Vendor Baru</h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        <form className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama perusahaan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kendaraan</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih jenis kendaraan</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{getVehicleTypeName(type)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih kategori</option>
                <option value="Perawatan">Perawatan</option>
                <option value="Suku Cadang">Suku Cadang</option>
                <option value="Asuransi">Asuransi</option>
                <option value="Bahan Bakar">Bahan Bakar</option>
                <option value="Pembersihan">Pembersihan</option>
                <option value="Derek">Derek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kontak Person</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama kontak person"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan alamat email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="5">5 Bintang - Sangat Baik</option>
                <option value="4">4 Bintang - Baik</option>
                <option value="3">3 Bintang - Cukup</option>
                <option value="2">2 Bintang - Kurang</option>
                <option value="1">1 Bintang - Sangat Kurang</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Masukkan alamat lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layanan yang Ditawarkan</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan layanan (pisahkan dengan koma)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spesialisasi (Opsional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Masukkan detail spesialisasi vendor"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Vendor aktif
            </label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tambah Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Vendor</h1>
          <p className="text-gray-600 mt-2">
            Kelola vendor berdasarkan jenis kendaraan: Mobil, Bus, Elf, dan Hiace
            {user?.role?.startsWith('telemarketing') && (
              <span className="block text-sm text-blue-600 mt-1">
                Anda mengelola vendor untuk: {getVehicleTypeName(user.role.split('-')[1])}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah Vendor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari vendor berdasarkan nama, kontak, atau layanan..."
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
            </select>
          )}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Stats by Vehicle Type */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(vehicleTypes.length, 4)} gap-6`}>
        {vendorsByType.map((stats) => (
          <div key={stats.type} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getVehicleTypeIcon(stats.type)}
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{getVehicleTypeName(stats.type)}</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vendor:</span>
                <span className="text-sm font-medium text-gray-900">{stats.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Spent:</span>
                <span className="text-sm font-medium text-gray-900">{formatRupiah(stats.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Rating:</span>
                <span className="text-sm font-medium text-gray-900">{stats.avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendor</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalVendors}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendor Aktif</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeVendors}</p>
            </div>
            <Package className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatRupiah(totalSpent)}</p>
            </div>
            <DollarSign className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rating Rata-rata</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgRating.toFixed(1)}</p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  {vendor.isActive && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="flex items-center mb-2">
                  {getVehicleTypeIcon(vendor.vehicleType)}
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVehicleTypeColor(vendor.vehicleType)}`}>
                    {getVehicleTypeName(vendor.vehicleType)}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">• {vendor.category}</span>
                </div>
                <StarRating rating={vendor.rating} />
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={16} className="mr-2" />
                {vendor.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-2" />
                {vendor.email}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{vendor.address}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Kontak Person</span>
                <span className="text-sm text-gray-900">{vendor.contact}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Total Pesanan</span>
                <span className="text-sm text-gray-900">{vendor.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">Total Pengeluaran</span>
                <span className="text-sm font-semibold text-gray-900">{formatRupiah(vendor.totalSpent)}</span>
              </div>
              
              {vendor.specialization && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Spesialisasi</p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{vendor.specialization}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Layanan</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {service}
                    </span>
                  ))}
                  {vendor.services.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      +{vendor.services.length - 3} lainnya
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Hubungi
                </button>
                <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor tidak ditemukan</h3>
          <p className="text-gray-600">Coba sesuaikan kriteria pencarian atau tambah vendor baru.</p>
        </div>
      )}

      {showAddModal && <AddVendorModal />}
    </div>
  );
};

export default VendorManagement;