import React, { useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, MapPin, Calendar, BarChart, Car, Bus, Truck } from 'lucide-react';
import { CompetitorPrice } from '../types';
import { mockCompetitorPrices } from '../data/mockData';

const PriceTracking: React.FC = () => {
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPrice[]>(mockCompetitorPrices);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPrices = competitorPrices.filter(price => {
    const matchesSearch = 
      price.competitor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.vehicleCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || price.location === locationFilter;
    const matchesCategory = categoryFilter === 'all' || price.vehicleCategory === categoryFilter;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const locations = [...new Set(competitorPrices.map(p => p.location))];
  const categories = ['Sewa Mobil', 'Sewa Bus', 'Sewa Hiace', 'Sewa Elf'];
  const competitors = [...new Set(competitorPrices.map(p => p.competitor))];

  const avgPriceByCategory = categories.map(category => {
    const categoryPrices = competitorPrices.filter(p => p.vehicleCategory === category);
    const avgPrice = categoryPrices.length > 0 
      ? categoryPrices.reduce((sum, p) => sum + p.dailyRate, 0) / categoryPrices.length 
      : 0;
    return { category, avgPrice, count: categoryPrices.length };
  });

  const priceComparison = competitors.map(competitor => {
    const competitorPrices = filteredPrices.filter(p => p.competitor === competitor);
    const avgPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((sum, p) => sum + p.dailyRate, 0) / competitorPrices.length 
      : 0;
    const totalListings = competitorPrices.length;
    return { competitor, avgPrice, totalListings };
  }).filter(comp => comp.totalListings > 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sewa Mobil':
        return <Car size={20} className="text-blue-500" />;
      case 'Sewa Bus':
        return <Bus size={20} className="text-green-500" />;
      case 'Sewa Hiace':
        return <Truck size={20} className="text-purple-500" />;
      case 'Sewa Elf':
        return <Truck size={20} className="text-orange-500" />;
      default:
        return <Car size={20} className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sewa Mobil':
        return 'bg-blue-100 text-blue-800';
      case 'Sewa Bus':
        return 'bg-green-100 text-green-800';
      case 'Sewa Hiace':
        return 'bg-purple-100 text-purple-800';
      case 'Sewa Elf':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AddPriceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tambah Data Harga Kompetitor</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kompetitor</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama kompetitor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Sewa</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih kategori sewa</option>
                <option value="Sewa Mobil">Sewa Mobil</option>
                <option value="Sewa Bus">Sewa Bus</option>
                <option value="Sewa Hiace">Sewa Hiace</option>
                <option value="Sewa Elf">Sewa Elf</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarif Harian (Rp)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan tarif harian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan lokasi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Catatan tambahan tentang harga atau kondisi"
            />
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
              Tambah Data Harga
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
          <h1 className="text-3xl font-bold text-gray-900">Pelacakan Harga Kompetitor</h1>
          <p className="text-gray-600 mt-2">Pantau harga sewa mobil, bus, hiace, dan elf dari kompetitor</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah Data Harga
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan kompetitor, kategori, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Lokasi</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
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

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map((category) => {
          const stats = avgPriceByCategory.find(c => c.category === category);
          return (
            <div key={category} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">{category}</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rata-rata:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.avgPrice ? formatRupiah(stats.avgPrice) : 'Rp 0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.count || 0} listing</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Prices by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChart className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Harga Rata-rata per Kategori</h2>
          </div>
          <div className="space-y-4">
            {avgPriceByCategory.filter(item => item.count > 0).map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getCategoryIcon(item.category)}
                  <span className="ml-2 text-sm font-medium text-gray-700">{item.category}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.avgPrice / Math.max(...avgPriceByCategory.map(i => i.avgPrice))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatRupiah(item.avgPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <TrendingUp className="text-green-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Perbandingan Kompetitor</h2>
          </div>
          <div className="space-y-4">
            {priceComparison.slice(0, 6).map((comp) => (
              <div key={comp.competitor} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{comp.competitor}</h3>
                  <span className="text-lg font-bold text-gray-900">{formatRupiah(comp.avgPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{comp.totalListings} listing</span>
                  <div className="flex items-center">
                    {comp.avgPrice > 1000000 ? (
                      <TrendingUp size={16} className="text-red-500 mr-1" />
                    ) : (
                      <TrendingDown size={16} className="text-green-500 mr-1" />
                    )}
                    <span className={comp.avgPrice > 1000000 ? 'text-red-600' : 'text-green-600'}>
                      {comp.avgPrice > 1000000 ? 'Harga tinggi' : 'Harga kompetitif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wawasan Pasar Rental</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata Pasar</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatRupiah(competitorPrices.reduce((sum, p) => sum + p.dailyRate, 0) / competitorPrices.length)}
                </p>
              </div>
              <DollarSign className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harga Terendah</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatRupiah(Math.min(...competitorPrices.map(p => p.dailyRate)))}
                </p>
              </div>
              <TrendingDown className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harga Tertinggi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatRupiah(Math.max(...competitorPrices.map(p => p.dailyRate)))}
                </p>
              </div>
              <TrendingUp className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Price Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kompetitor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Sewa</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarif Harian</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{price.competitor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(price.vehicleCategory)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(price.vehicleCategory)}`}>
                        {price.vehicleCategory}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatRupiah(price.dailyRate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={16} className="mr-1 text-gray-400" />
                      {price.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      {price.date.toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{price.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddPriceModal />}
    </div>
  );
};

export default PriceTracking;