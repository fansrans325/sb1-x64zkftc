import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calculator, FileText, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface TaxRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  taxType: 'annual' | 'transfer' | 'penalty';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  taxYear: number;
}

const mockTaxRecords: TaxRecord[] = [
  {
    id: '1',
    vehicleId: 'V001',
    vehiclePlate: 'B 1234 ABC',
    taxType: 'annual',
    amount: 2500000,
    dueDate: '2024-03-15',
    paidDate: '2024-03-10',
    status: 'paid',
    description: 'Pajak Tahunan 2024',
    taxYear: 2024
  },
  {
    id: '2',
    vehicleId: 'V002',
    vehiclePlate: 'B 5678 DEF',
    taxType: 'annual',
    amount: 3200000,
    dueDate: '2024-04-20',
    status: 'pending',
    description: 'Pajak Tahunan 2024',
    taxYear: 2024
  },
  {
    id: '3',
    vehicleId: 'V003',
    vehiclePlate: 'B 9012 GHI',
    taxType: 'penalty',
    amount: 500000,
    dueDate: '2024-02-28',
    status: 'overdue',
    description: 'Denda Keterlambatan Pajak',
    taxYear: 2024
  }
];

export default function TaxManagement() {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(mockTaxRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TaxRecord | null>(null);

  const filteredRecords = taxRecords.filter(record => {
    const matchesSearch = record.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="text-green-500" size={20} />;
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'overdue': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case 'annual': return 'Pajak Tahunan';
      case 'transfer': return 'Balik Nama';
      case 'penalty': return 'Denda';
      default: return type;
    }
  };

  const handleAddRecord = (newRecord: Omit<TaxRecord, 'id'>) => {
    const record: TaxRecord = {
      ...newRecord,
      id: Date.now().toString()
    };
    setTaxRecords([...taxRecords, record]);
    setShowAddForm(false);
  };

  const handleEditRecord = (updatedRecord: TaxRecord) => {
    setTaxRecords(taxRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pajak ini?')) {
      setTaxRecords(taxRecords.filter(record => record.id !== id));
    }
  };

  const handleMarkAsPaid = (id: string) => {
    const record = taxRecords.find(r => r.id === id);
    if (!record) return;

    const today = new Date();
    const paidDate = today.toISOString().split('T')[0];

    // Update current record to paid
    setTaxRecords(prev => prev.map(r => 
      r.id === id 
        ? { ...r, status: 'paid' as const, paidDate }
        : r
    ));

    // If it's an annual tax, create next year's record automatically
    if (record.taxType === 'annual') {
      const nextYear = record.taxYear + 1;
      const nextDueDate = new Date(record.dueDate);
      nextDueDate.setFullYear(nextYear);

      const nextYearRecord: TaxRecord = {
        id: (Date.now() + 1).toString(),
        vehicleId: record.vehicleId,
        vehiclePlate: record.vehiclePlate,
        taxType: 'annual',
        amount: record.amount, // Same amount, could be adjusted for inflation
        dueDate: nextDueDate.toISOString().split('T')[0],
        status: 'pending',
        description: `Pajak Tahunan ${nextYear}`,
        taxYear: nextYear
      };

      setTaxRecords(prev => [...prev, nextYearRecord]);
      alert(`Pajak berhasil dibayar! Record pajak untuk tahun ${nextYear} telah dibuat otomatis.`);
    } else {
      alert('Pajak berhasil ditandai sebagai sudah dibayar!');
    }
  };

  const totalTaxAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = filteredRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = filteredRecords.filter(r => r.status === 'pending').reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = filteredRecords.filter(r => r.status === 'overdue').reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pajak</h1>
          <p className="text-gray-600 mt-1">Kelola pajak kendaraan dengan perpanjangan otomatis tahunan</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Pajak
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pajak</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTaxAmount)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Belum Dibayar</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terlambat</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
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
                placeholder="Cari berdasarkan plat nomor atau deskripsi..."
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
            <option value="paid">Sudah Dibayar</option>
            <option value="pending">Belum Dibayar</option>
            <option value="overdue">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Tax Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Pajak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tahun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.vehiclePlate}</div>
                      <div className="text-sm text-gray-500">{record.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTaxTypeLabel(record.taxType)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{record.taxYear}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(record.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{formatDate(record.dueDate)}</div>
                      {record.paidDate && (
                        <div className="text-sm text-gray-500">Dibayar: {formatDate(record.paidDate)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status === 'paid' ? 'Sudah Dibayar' : 
                         record.status === 'pending' ? 'Belum Dibayar' : 'Terlambat'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {record.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(record.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                          title="Tandai Sudah Dibayar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingRecord(record)}
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
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data pajak</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tidak ada data yang sesuai dengan filter.'
                : 'Mulai dengan menambahkan data pajak kendaraan.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingRecord) && (
        <TaxFormModal
          record={editingRecord}
          onSave={editingRecord ? handleEditRecord : handleAddRecord}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

interface TaxFormModalProps {
  record?: TaxRecord | null;
  onSave: (record: any) => void;
  onCancel: () => void;
}

function TaxFormModal({ record, onSave, onCancel }: TaxFormModalProps) {
  const [formData, setFormData] = useState({
    vehicleId: record?.vehicleId || '',
    vehiclePlate: record?.vehiclePlate || '',
    taxType: record?.taxType || 'annual',
    amount: record?.amount || 0,
    dueDate: record?.dueDate || '',
    paidDate: record?.paidDate || '',
    status: record?.status || 'pending',
    description: record?.description || '',
    taxYear: record?.taxYear || new Date().getFullYear()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(record ? { ...record, ...formData } : formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {record ? 'Edit Data Pajak' : 'Tambah Data Pajak'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plat Nomor
              </label>
              <input
                type="text"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pajak
              </label>
              <select
                value={formData.taxType}
                onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="annual">Pajak Tahunan</option>
                <option value="transfer">Balik Nama</option>
                <option value="penalty">Denda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Pajak
              </label>
              <input
                type="number"
                value={formData.taxYear}
                onChange={(e) => setFormData({ ...formData, taxYear: parseInt(e.target.value) || new Date().getFullYear() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Jatuh Tempo
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Belum Dibayar</option>
                <option value="paid">Sudah Dibayar</option>
                <option value="overdue">Terlambat</option>
              </select>
            </div>

            {formData.status === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {record ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}