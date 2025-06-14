import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Calendar, User, Car, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface KIRRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  inspectionDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring-soon';
  inspector: string;
  certificateNumber: string;
  notes: string;
}

const mockKIRData: KIRRecord[] = [
  {
    id: '1',
    vehicleId: 'V001',
    vehiclePlate: 'B 1234 ABC',
    inspectionDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'valid',
    inspector: 'PT. Inspeksi Kendaraan',
    certificateNumber: 'KIR-2024-001',
    notes: 'All systems passed inspection'
  },
  {
    id: '2',
    vehicleId: 'V002',
    vehiclePlate: 'B 5678 DEF',
    inspectionDate: '2023-12-01',
    expiryDate: '2024-12-01',
    status: 'expiring-soon',
    inspector: 'PT. Inspeksi Kendaraan',
    certificateNumber: 'KIR-2023-045',
    notes: 'Renewal required within 30 days'
  },
  {
    id: '3',
    vehicleId: 'V003',
    vehiclePlate: 'B 9012 GHI',
    inspectionDate: '2023-06-15',
    expiryDate: '2024-06-15',
    status: 'expired',
    inspector: 'PT. Inspeksi Kendaraan',
    certificateNumber: 'KIR-2023-023',
    notes: 'Immediate renewal required'
  }
];

export default function KIRManagement() {
  const [kirRecords, setKirRecords] = useState<KIRRecord[]>(mockKIRData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KIRRecord | null>(null);

  // Auto-update status based on dates
  useEffect(() => {
    const updateStatuses = () => {
      const today = new Date();
      setKirRecords(prevRecords => 
        prevRecords.map(record => {
          const expiryDate = new Date(record.expiryDate);
          const sixMonthsFromExpiry = new Date(expiryDate);
          sixMonthsFromExpiry.setMonth(sixMonthsFromExpiry.getMonth() - 6);
          
          let newStatus = record.status;
          
          if (today > expiryDate) {
            newStatus = 'expired';
          } else if (today >= sixMonthsFromExpiry) {
            newStatus = 'expiring-soon';
          } else {
            newStatus = 'valid';
          }
          
          return { ...record, status: newStatus };
        })
      );
    };

    updateStatuses();
    // Update every hour
    const interval = setInterval(updateStatuses, 3600000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = kirRecords.filter(record => {
    const matchesSearch = record.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring-soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring-soon': return 'Segera Berakhir';
      case 'expired': return 'Kadaluarsa';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="text-green-500" size={20} />;
      case 'expiring-soon': return <Clock className="text-yellow-500" size={20} />;
      case 'expired': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <FileText className="text-gray-500" size={20} />;
    }
  };

  const handleAddRecord = () => {
    setShowAddModal(true);
    setEditingRecord(null);
  };

  const handleEditRecord = (record: KIRRecord) => {
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data KIR ini?')) {
      setKirRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const handleMarkAsProcessed = (id: string) => {
    const record = kirRecords.find(r => r.id === id);
    if (!record) return;

    // Create new KIR record with 6 months validity
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 6);
    
    const newRecord: KIRRecord = {
      id: Date.now().toString(),
      vehicleId: record.vehicleId,
      vehiclePlate: record.vehiclePlate,
      inspectionDate: new Date().toISOString().split('T')[0],
      expiryDate: newExpiryDate.toISOString().split('T')[0],
      status: 'valid',
      inspector: record.inspector,
      certificateNumber: `KIR-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      notes: 'Diperbaharui otomatis setelah proses'
    };

    setKirRecords(prev => [...prev, newRecord]);
    alert('KIR berhasil diperbarui! Record baru telah dibuat dengan masa berlaku 6 bulan.');
  };

  const handleSaveRecord = (formData: any) => {
    if (editingRecord) {
      // Update existing record
      setKirRecords(prev => prev.map(record => 
        record.id === editingRecord.id ? { ...record, ...formData } : record
      ));
    } else {
      // Add new record
      const newRecord: KIRRecord = {
        id: Date.now().toString(),
        ...formData
      };
      setKirRecords(prev => [...prev, newRecord]);
    }
    setShowAddModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen KIR</h1>
          <p className="text-gray-600 mt-1">Kelola sertifikat inspeksi kendaraan dan perpanjangan otomatis</p>
        </div>
        <button
          onClick={handleAddRecord}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Data KIR
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{kirRecords.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valid</p>
              <p className="text-2xl font-bold text-green-600">
                {kirRecords.filter(r => r.status === 'valid').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Segera Berakhir</p>
              <p className="text-2xl font-bold text-yellow-600">
                {kirRecords.filter(r => r.status === 'expiring-soon').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kadaluarsa</p>
              <p className="text-2xl font-bold text-red-600">
                {kirRecords.filter(r => r.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
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
                placeholder="Cari berdasarkan plat nomor atau nomor sertifikat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="valid">Valid</option>
            <option value="expiring-soon">Segera Berakhir</option>
            <option value="expired">Kadaluarsa</option>
          </select>
        </div>
      </div>

      {/* KIR Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sertifikat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Inspeksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Kadaluarsa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspektur
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
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.vehiclePlate}</div>
                        <div className="text-sm text-gray-500">ID: {record.vehicleId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.certificateNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(record.inspectionDate).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(record.expiryDate).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.inspector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {(record.status === 'expired' || record.status === 'expiring-soon') && (
                        <button
                          onClick={() => handleMarkAsProcessed(record.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                          title="Proses Perpanjangan"
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
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data KIR ditemukan</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Coba sesuaikan kriteria pencarian atau filter.'
                : 'Mulai dengan menambahkan data KIR baru.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRecord ? 'Edit Data KIR' : 'Tambah Data KIR Baru'}
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
                    ID Kendaraan
                  </label>
                  <input
                    type="text"
                    name="vehicleId"
                    defaultValue={editingRecord?.vehicleId || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                    Nomor Sertifikat
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    defaultValue={editingRecord?.certificateNumber || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Inspeksi
                  </label>
                  <input
                    type="date"
                    name="inspectionDate"
                    defaultValue={editingRecord?.inspectionDate || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    defaultValue={editingRecord?.expiryDate || ''}
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
                    defaultValue={editingRecord?.status || 'valid'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="valid">Valid</option>
                    <option value="expiring-soon">Segera Berakhir</option>
                    <option value="expired">Kadaluarsa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspektur
                  </label>
                  <input
                    type="text"
                    name="inspector"
                    defaultValue={editingRecord?.inspector || ''}
                    required
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingRecord ? 'Update' : 'Tambah'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}