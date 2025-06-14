import React, { useState } from 'react';
import { Calendar, Clock, Wrench, AlertTriangle, CheckCircle, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'scheduled' | 'repair' | 'inspection';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  cost?: number;
  technician?: string;
  notes?: string;
}

const mockMaintenanceData: MaintenanceRecord[] = [
  {
    id: '1',
    vehicleId: 'v1',
    vehiclePlate: 'B 1234 ABC',
    type: 'scheduled',
    description: 'Oil Change & Filter Replacement',
    scheduledDate: '2024-01-15',
    completedDate: '2024-01-15',
    status: 'completed',
    cost: 350000,
    technician: 'Ahmad Wijaya',
    notes: 'Regular maintenance completed successfully'
  },
  {
    id: '2',
    vehicleId: 'v2',
    vehiclePlate: 'B 5678 DEF',
    type: 'repair',
    description: 'Brake Pad Replacement',
    scheduledDate: '2024-01-20',
    status: 'in-progress',
    technician: 'Budi Santoso'
  },
  {
    id: '3',
    vehicleId: 'v3',
    vehiclePlate: 'B 9012 GHI',
    type: 'inspection',
    description: 'Annual Safety Inspection',
    scheduledDate: '2024-01-10',
    status: 'overdue'
  }
];

export default function MaintenanceModule() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress': return <Clock className="text-blue-500" size={20} />;
      case 'pending': return <Calendar className="text-yellow-500" size={20} />;
      case 'overdue': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Wrench className="text-gray-500" size={20} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'repair': return <Wrench className="w-4 h-4" />;
      case 'inspection': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleMarkAsCompleted = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMaintenanceRecords(prev => prev.map(record => 
      record.id === id 
        ? { ...record, status: 'completed' as const, completedDate: today }
        : record
    ));
    alert('Maintenance berhasil ditandai sebagai selesai!');
  };

  const handleMarkAsInProgress = (id: string) => {
    setMaintenanceRecords(prev => prev.map(record => 
      record.id === id 
        ? { ...record, status: 'in-progress' as const }
        : record
    ));
    alert('Maintenance berhasil ditandai sedang dalam proses!');
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setShowAddForm(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data maintenance ini?')) {
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const handleSaveRecord = (formData: any) => {
    if (editingRecord) {
      // Update existing record
      setMaintenanceRecords(prev => prev.map(record => 
        record.id === editingRecord.id ? { ...record, ...formData } : record
      ));
    } else {
      // Add new record
      const newRecord: MaintenanceRecord = {
        id: Date.now().toString(),
        ...formData
      };
      setMaintenanceRecords(prev => [...prev, newRecord]);
    }
    setShowAddForm(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modul Perawatan</h1>
          <p className="text-gray-600 mt-1">Lacak dan kelola jadwal perawatan kendaraan</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Jadwalkan Perawatan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Terjadwal</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceRecords.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
              <p className="text-2xl font-bold text-blue-600">
                {maintenanceRecords.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-green-600">
                {maintenanceRecords.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terlambat</p>
              <p className="text-2xl font-bold text-red-600">
                {maintenanceRecords.filter(r => r.status === 'overdue').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan plat nomor atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="in-progress">Dalam Proses</option>
              <option value="completed">Selesai</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Terjadwal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biaya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teknisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{record.vehiclePlate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(record.type)}
                      <span className="capitalize text-sm text-gray-600">{record.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.description}</div>
                    {record.notes && (
                      <div className="text-xs text-gray-500 mt-1">{record.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.scheduledDate).toLocaleDateString('id-ID')}
                    {record.completedDate && (
                      <div className="text-xs text-gray-500">
                        Selesai: {new Date(record.completedDate).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status === 'pending' ? 'Menunggu' :
                         record.status === 'in-progress' ? 'Dalam Proses' :
                         record.status === 'completed' ? 'Selesai' : 'Terlambat'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.cost ? formatCurrency(record.cost) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.technician || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {record.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsInProgress(record.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Mulai Proses"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {(record.status === 'in-progress' || record.status === 'overdue') && (
                        <button
                          onClick={() => handleMarkAsCompleted(record.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                          title="Tandai Selesai"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data maintenance ditemukan</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Coba sesuaikan kriteria pencarian atau filter.'
                : 'Mulai dengan menjadwalkan maintenance pertama.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRecord ? 'Edit Maintenance' : 'Jadwalkan Maintenance Baru'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());
              handleSaveRecord(data);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    name="vehiclePlate"
                    defaultValue={editingRecord?.vehiclePlate || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Maintenance
                  </label>
                  <select
                    name="type"
                    defaultValue={editingRecord?.type || 'scheduled'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Terjadwal</option>
                    <option value="repair">Perbaikan</option>
                    <option value="inspection">Inspeksi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingRecord?.description || ''}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terjadwal
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    defaultValue={editingRecord?.scheduledDate || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingRecord?.status || 'pending'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="in-progress">Dalam Proses</option>
                    <option value="completed">Selesai</option>
                    <option value="overdue">Terlambat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teknisi
                  </label>
                  <input
                    type="text"
                    name="technician"
                    defaultValue={editingRecord?.technician || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    defaultValue={editingRecord?.cost || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingRecord?.notes || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRecord(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingRecord ? 'Update' : 'Jadwalkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}