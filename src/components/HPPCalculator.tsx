import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, PieChart, BarChart } from 'lucide-react';
import { HPPCalculation, Vehicle } from '../types';
import { mockVehicles } from '../data/mockData';

const HPPCalculator: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [period, setPeriod] = useState<string>('monthly');
  const [calculations, setCalculations] = useState<HPPCalculation[]>([]);
  
  const [costs, setCosts] = useState({
    maintenanceCosts: 0,
    insuranceCosts: 0,
    taxCosts: 0,
    fuelCosts: 0,
    depreciationCosts: 0,
    operatingCosts: 0
  });

  const [revenue, setRevenue] = useState(0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateHPP = () => {
    const vehicle = mockVehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) return;

    const totalCosts = vehicle.acquisitionCost + 
                      costs.maintenanceCosts + 
                      costs.insuranceCosts + 
                      costs.taxCosts + 
                      costs.fuelCosts + 
                      costs.depreciationCosts + 
                      costs.operatingCosts;

    const profit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const calculation: HPPCalculation = {
      vehicleId: selectedVehicle,
      period,
      acquisitionCost: vehicle.acquisitionCost,
      ...costs,
      totalCosts,
      revenue,
      profit,
      profitMargin
    };

    setCalculations([calculation, ...calculations]);
  };

  const CostBreakdownChart = ({ calculation }: { calculation: HPPCalculation }) => {
    const costItems = [
      { label: 'Akuisisi', value: calculation.acquisitionCost, color: 'bg-blue-500' },
      { label: 'Perawatan', value: calculation.maintenanceCosts, color: 'bg-green-500' },
      { label: 'Asuransi', value: calculation.insuranceCosts, color: 'bg-yellow-500' },
      { label: 'Pajak', value: calculation.taxCosts, color: 'bg-red-500' },
      { label: 'Bahan Bakar', value: calculation.fuelCosts, color: 'bg-purple-500' },
      { label: 'Depresiasi', value: calculation.depreciationCosts, color: 'bg-pink-500' },
      { label: 'Operasional', value: calculation.operatingCosts, color: 'bg-indigo-500' }
    ];

    const maxValue = Math.max(...costItems.map(item => item.value));

    return (
      <div className="space-y-3">
        {costItems.map((item) => (
          <div key={item.label} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{item.label}:</div>
            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              />
            </div>
            <div className="w-32 text-sm font-medium text-gray-900 text-right">
              {formatRupiah(item.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kalkulator HPP</h1>
        <p className="text-gray-600 mt-2">Hitung Harga Pokok Penjualan dan margin keuntungan kendaraan Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <Calculator className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Hitung HPP</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kendaraan</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih kendaraan</option>
                {mockVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode Perhitungan</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Triwulan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Perawatan (Rp)</label>
                <input
                  type="number"
                  value={costs.maintenanceCosts}
                  onChange={(e) => setCosts({...costs, maintenanceCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Asuransi (Rp)</label>
                <input
                  type="number"
                  value={costs.insuranceCosts}
                  onChange={(e) => setCosts({...costs, insuranceCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Pajak (Rp)</label>
                <input
                  type="number"
                  value={costs.taxCosts}
                  onChange={(e) => setCosts({...costs, taxCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Bahan Bakar (Rp)</label>
                <input
                  type="number"
                  value={costs.fuelCosts}
                  onChange={(e) => setCosts({...costs, fuelCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depresiasi (Rp)</label>
                <input
                  type="number"
                  value={costs.depreciationCosts}
                  onChange={(e) => setCosts({...costs, depreciationCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Operasional (Rp)</label>
                <input
                  type="number"
                  value={costs.operatingCosts}
                  onChange={(e) => setCosts({...costs, operatingCosts: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pendapatan (Rp)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan total pendapatan untuk periode tersebut"
              />
            </div>

            <button
              onClick={calculateHPP}
              disabled={!selectedVehicle}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Calculator size={20} className="mr-2" />
              Hitung HPP
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Perhitungan</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{calculations.length}</p>
                </div>
                <BarChart className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Margin Keuntungan Rata-rata</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {calculations.length > 0 
                      ? `${(calculations.reduce((sum, calc) => sum + calc.profitMargin, 0) / calculations.length).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
          </div>

          {/* Quick HPP Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips Perhitungan HPP</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Sertakan semua biaya langsung yang terkait dengan kendaraan
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Pertimbangkan depresiasi berdasarkan usia dan penggunaan kendaraan
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Faktor variasi musiman dalam biaya operasional
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Tinjau dan perbarui perhitungan secara berkala untuk akurasi
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculation Results */}
      {calculations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Hasil Perhitungan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biaya</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keuntungan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc, index) => {
                  const vehicle = mockVehicles.find(v => v.id === calc.vehicleId);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Kendaraan Tidak Diketahui'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle?.licensePlate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {calc.period === 'monthly' ? 'Bulanan' : 
                           calc.period === 'quarterly' ? 'Triwulan' : 'Tahunan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatRupiah(calc.totalCosts)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatRupiah(calc.revenue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          calc.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatRupiah(calc.profit)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          calc.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {calc.profitMargin.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Lihat Rincian
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cost Breakdown for Latest Calculation */}
      {calculations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <PieChart className="text-purple-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Rincian Biaya Terbaru</h2>
          </div>
          <CostBreakdownChart calculation={calculations[0]} />
        </div>
      )}
    </div>
  );
};

export default HPPCalculator;