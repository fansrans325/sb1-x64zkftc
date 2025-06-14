import React from 'react';
import { 
  Car, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockVehicles, mockCustomers, mockKIRRecords, mockTaxRecords, mockMaintenanceRecords } from '../data/mockData';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  // Calculate stats
  const totalVehicles = mockVehicles.length;
  const availableVehicles = mockVehicles.filter(v => v.status === 'available').length;
  const rentedVehicles = mockVehicles.filter(v => v.status === 'rented').length;
  const totalCustomers = mockCustomers.length;
  const expiredKIR = mockKIRRecords.filter(k => k.status === 'expired').length;
  const overdueTax = mockTaxRecords.filter(t => t.status === 'overdue').length;
  const pendingMaintenance = mockMaintenanceRecords.filter(m => m.status === 'scheduled').length;

  const monthlyRevenue = 684000000; // Mock data in IDR
  const profitMargin = 28.5; // Mock data

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      name: 'Total Kendaraan',
      value: totalVehicles,
      icon: Car,
      color: 'bg-blue-500',
      change: '+2.1%'
    },
    {
      name: 'Kendaraan Tersedia',
      value: availableVehicles,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+5.4%'
    },
    {
      name: 'Sewa Aktif',
      value: rentedVehicles,
      icon: Users,
      color: 'bg-purple-500',
      change: '+12.3%'
    },
    {
      name: 'Pendapatan Bulanan',
      value: formatRupiah(monthlyRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+8.2%'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: `${expiredKIR} kendaraan memiliki sertifikat KIR yang kadaluarsa`,
      time: '2 jam yang lalu',
      action: () => onTabChange('kir')
    },
    {
      id: 2,
      type: 'error',
      message: `${overdueTax} kendaraan memiliki pembayaran pajak yang terlambat`,
      time: '1 hari yang lalu',
      action: () => onTabChange('tax')
    },
    {
      id: 3,
      type: 'info',
      message: `${pendingMaintenance} kendaraan dijadwalkan untuk perawatan`,
      time: '3 jam yang lalu',
      action: () => onTabChange('maintenance')
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Pemesanan sewa baru',
      customer: 'Ahmad Wijaya',
      vehicle: 'Toyota Camry (B 1234 ABC)',
      time: '10 menit yang lalu'
    },
    {
      id: 2,
      action: 'Kendaraan dikembalikan',
      customer: 'Sari Indah',
      vehicle: 'Honda Civic (B 5678 DEF)',
      time: '1 jam yang lalu'
    },
    {
      id: 3,
      action: 'Perawatan selesai',
      customer: 'Sistem',
      vehicle: 'BMW X3 (B 9012 GHI)',
      time: '2 jam yang lalu'
    }
  ];

  const quickActions = [
    {
      title: 'Tambah Pelanggan',
      description: 'Daftarkan pelanggan baru',
      icon: Users,
      color: 'text-blue-600',
      hoverColor: 'hover:border-blue-300 hover:bg-blue-50',
      action: () => onTabChange('customers')
    },
    {
      title: 'Tambah Kendaraan',
      description: 'Daftarkan kendaraan baru',
      icon: Car,
      color: 'text-green-600',
      hoverColor: 'hover:border-green-300 hover:bg-green-50',
      action: () => onTabChange('vehicles')
    },
    {
      title: 'Jadwal Perawatan',
      description: 'Atur jadwal perawatan',
      icon: Calendar,
      color: 'text-purple-600',
      hoverColor: 'hover:border-purple-300 hover:bg-purple-50',
      action: () => onTabChange('maintenance')
    },
    {
      title: 'Laporan Keuangan',
      description: 'Lihat laporan dan analitik',
      icon: DollarSign,
      color: 'text-yellow-600',
      hoverColor: 'hover:border-yellow-300 hover:bg-yellow-50',
      action: () => onTabChange('reports')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang kembali! Berikut yang terjadi dengan bisnis rental Anda hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ringkasan Pendapatan</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{profitMargin}% margin keuntungan</span>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Visualisasi grafik pendapatan akan ditampilkan di sini</p>
              <p className="text-sm text-gray-400 mt-2">Integrasi dengan library grafik diperlukan</p>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Peringatan Sistem</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={alert.action}
              >
                <div className={`p-1 rounded-full ${
                  alert.type === 'error' ? 'bg-red-100' : 
                  alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {alert.type === 'error' ? (
                    <XCircle size={16} className="text-red-600" />
                  ) : (
                    <AlertTriangle size={16} className={
                      alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    } />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.customer} • {activity.vehicle}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button 
                  key={action.title}
                  onClick={action.action}
                  className={`p-4 text-left rounded-lg border-2 border-dashed border-gray-200 ${action.hoverColor} transition-colors group`}
                >
                  <IconComponent size={24} className={`${action.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;