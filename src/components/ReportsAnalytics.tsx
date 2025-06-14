import React, { useState } from 'react';
import { BarChart, PieChart, TrendingUp, Download, Calendar, DollarSign, Car, Users, Filter } from 'lucide-react';
import { mockVehicles, mockCustomers, mockKIRRecords, mockTaxRecords, mockMaintenanceRecords } from '../data/mockData';

const ReportsAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  // Calculate key metrics
  const totalRevenue = 1875000000; // Mock data in IDR
  const totalCosts = 1312500000; // Mock data in IDR
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = (netProfit / totalRevenue) * 100;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const vehicleUtilization = mockVehicles.map(vehicle => ({
    vehicle: `${vehicle.make} ${vehicle.model}`,
    utilization: Math.random() * 100, // Mock utilization percentage
    revenue: Math.random() * 75000000 + 15000000 // Mock revenue in IDR
  }));

  const monthlyData = [
    { month: 'Jan', revenue: 180000000, costs: 127500000, profit: 52500000 },
    { month: 'Feb', revenue: 210000000, costs: 138000000, profit: 72000000 },
    { month: 'Mar', revenue: 240000000, costs: 151500000, profit: 88500000 },
    { month: 'Apr', revenue: 232500000, costs: 147000000, profit: 85500000 },
    { month: 'Mei', revenue: 270000000, costs: 168000000, profit: 102000000 },
    { month: 'Jun', revenue: 300000000, costs: 187500000, profit: 112500000 }
  ];

  const expenseBreakdown = [
    { category: 'Perawatan', amount: 375000000, percentage: 28.6 },
    { category: 'Asuransi', amount: 270000000, percentage: 20.6 },
    { category: 'Bahan Bakar', amount: 225000000, percentage: 17.1 },
    { category: 'Pajak', amount: 180000000, percentage: 13.7 },
    { category: 'Depresiasi', amount: 150000000, percentage: 11.4 },
    { category: 'Lainnya', amount: 112500000, percentage: 8.6 }
  ];

  const customerMetrics = {
    totalCustomers: mockCustomers.length,
    newCustomers: Math.floor(mockCustomers.length * 0.3),
    repeatCustomers: Math.floor(mockCustomers.length * 0.7),
    avgRentalDuration: 4.2,
    customerSatisfaction: 4.6
  };

  const fleetMetrics = {
    totalVehicles: mockVehicles.length,
    availableVehicles: mockVehicles.filter(v => v.status === 'available').length,
    rentedVehicles: mockVehicles.filter(v => v.status === 'rented').length,
    maintenanceVehicles: mockVehicles.filter(v => v.status === 'maintenance').length,
    avgAge: 3.2,
    avgMileage: 45000
  };

  const ReportCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% dari periode sebelumnya
            </p>
          )}
        </div>
        <Icon className={`${color} w-8 h-8`} />
      </div>
    </div>
  );

  const ChartPlaceholder = ({ title, type }: { title: string; type: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          {type === 'bar' ? <BarChart size={48} className="text-gray-400 mx-auto mb-4" /> : 
           type === 'pie' ? <PieChart size={48} className="text-gray-400 mx-auto mb-4" /> :
           <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />}
          <p className="text-gray-500">Visualisasi {title}</p>
          <p className="text-sm text-gray-400 mt-2">Integrasi chart diperlukan</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-2">Wawasan bisnis komprehensif dan metrik kinerja</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">7 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
            <option value="90">3 bulan terakhir</option>
            <option value="365">Tahun terakhir</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={20} className="mr-2" />
            Export Laporan
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Ringkasan Bisnis' },
            { id: 'financial', label: 'Laporan Keuangan' },
            { id: 'fleet', label: 'Kinerja Armada' },
            { id: 'customer', label: 'Analitik Pelanggan' },
            { id: 'maintenance', label: 'Laporan Perawatan' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Pendapatan"
          value={formatRupiah(totalRevenue)}
          change={12.5}
          icon={DollarSign}
          color="text-green-500"
        />
        <ReportCard
          title="Laba Bersih"
          value={formatRupiah(netProfit)}
          change={8.3}
          icon={TrendingUp}
          color="text-blue-500"
        />
        <ReportCard
          title="Utilisasi Armada"
          value="78.5%"
          change={5.2}
          icon={Car}
          color="text-purple-500"
        />
        <ReportCard
          title="Pelanggan Aktif"
          value={customerMetrics.totalCustomers}
          change={15.7}
          icon={Users}
          color="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Tren Pendapatan vs Biaya" type="line" />
        <ChartPlaceholder title="Rincian Pengeluaran" type="pie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Utilisasi Kendaraan" type="bar" />
        <ChartPlaceholder title="Pertumbuhan Pelanggan" type="line" />
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kendaraan Terbaik</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicleUtilization.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.utilization}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{item.utilization.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatRupiah(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rincian Pengeluaran</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {expenseBreakdown.map((expense) => (
                <div key={expense.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{expense.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatRupiah(expense.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Kinerja Bulanan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biaya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laba</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyData.map((month) => (
                <tr key={month.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatRupiah(month.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatRupiah(month.costs)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatRupiah(month.profit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((month.profit / month.revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wawasan Utama & Rekomendasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Pertumbuhan Pendapatan</h4>
            <p className="text-sm text-gray-600">
              Pendapatan meningkat 12,5% dibandingkan periode sebelumnya, didorong oleh tingkat utilisasi kendaraan yang lebih tinggi.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Optimasi Biaya</h4>
            <p className="text-sm text-gray-600">
              Biaya perawatan mencapai 28,6% dari total pengeluaran. Pertimbangkan perawatan preventif untuk mengurangi perbaikan darurat.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Kinerja Armada</h4>
            <p className="text-sm text-gray-600">
              Utilisasi armada 78,5% di atas rata-rata industri. Pertimbangkan ekspansi armada selama musim puncak.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Retensi Pelanggan</h4>
            <p className="text-sm text-gray-600">
              Tingkat pelanggan berulang 70% menunjukkan kepuasan yang kuat. Fokus pada program loyalitas untuk meningkatkan retensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;