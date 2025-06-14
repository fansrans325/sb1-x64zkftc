import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Download, Send, MessageCircle, Calendar, Clock, DollarSign, FileText, User, CheckCircle, AlertTriangle, X, Save } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { mockInvoices, mockCustomers, mockVehicles } from '../data/mockData';

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesDuration = durationFilter === 'all' ||
      (durationFilter === 'short' && invoice.totalRentalDays <= 3) ||
      (durationFilter === 'medium' && invoice.totalRentalDays > 3 && invoice.totalRentalDays <= 14) ||
      (durationFilter === 'long' && invoice.totalRentalDays > 14);
    
    return matchesSearch && matchesStatus && matchesDuration;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'sent':
        return <Send className="text-blue-500" size={20} />;
      case 'overdue':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'draft':
        return <FileText className="text-gray-500" size={20} />;
      case 'cancelled':
        return <X className="text-red-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Dibayar';
      case 'sent':
        return 'Terkirim';
      case 'overdue':
        return 'Terlambat';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getDurationCategory = (days: number) => {
    if (days <= 3) return { label: 'Pendek', color: 'bg-red-100 text-red-800', icon: Clock };
    if (days <= 14) return { label: 'Menengah', color: 'bg-yellow-100 text-yellow-800', icon: Calendar };
    return { label: 'Panjang', color: 'bg-green-100 text-green-800', icon: Calendar };
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateDaysFromDates = (startDate: Date, endDate: Date) => {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Statistics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);
  const totalRentalDays = invoices.reduce((sum, inv) => sum + inv.totalRentalDays, 0);
  const avgRentalDuration = totalInvoices > 0 ? Math.round(totalRentalDays / totalInvoices * 10) / 10 : 0;

  // Duration statistics
  const durationStats = {
    short: invoices.filter(inv => inv.totalRentalDays <= 3).length,
    medium: invoices.filter(inv => inv.totalRentalDays > 3 && inv.totalRentalDays <= 14).length,
    long: invoices.filter(inv => inv.totalRentalDays > 14).length
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // Simulate PDF download
    console.log('Downloading PDF for invoice:', invoice.invoiceNumber);
    alert(`PDF untuk invoice ${invoice.invoiceNumber} sedang diunduh...`);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Simulate print
    console.log('Printing invoice:', invoice.invoiceNumber);
    alert(`Invoice ${invoice.invoiceNumber} sedang dicetak...`);
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
    // Simulate WhatsApp send
    const message = `Halo ${invoice.customerName}, berikut adalah invoice ${invoice.invoiceNumber} untuk sewa kendaraan Anda. Total: ${formatRupiah(invoice.total)}. Terima kasih!`;
    const whatsappUrl = `https://wa.me/${invoice.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const ViewInvoiceModal = () => {
    if (!selectedInvoice) return null;

    const durationCategory = getDurationCategory(selectedInvoice.totalRentalDays);
    const IconComponent = durationCategory.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="text-blue-600 mr-3" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Invoice {selectedInvoice.invoiceNumber}</h2>
                  <p className="text-sm text-gray-600">Detail invoice dan durasi sewa</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Company Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Rentalinx</h1>
              <p className="text-gray-600">Greenmansion Cluster Kalimaya Blok I1</p>
              <p className="text-gray-600">Telepon: 0811320326 | Email: cs@rentalinx.com</p>
            </div>

            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nama:</span> {selectedInvoice.customerName}</p>
                  <p><span className="font-medium">Email:</span> {selectedInvoice.customerEmail}</p>
                  <p><span className="font-medium">Telepon:</span> {selectedInvoice.customerPhone}</p>
                  <p><span className="font-medium">Alamat:</span> {selectedInvoice.customerAddress}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Invoice</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nomor Invoice:</span> {selectedInvoice.invoiceNumber}</p>
                  <p><span className="font-medium">Tanggal Terbit:</span> {selectedInvoice.issueDate.toLocaleDateString('id-ID')}</p>
                  <p><span className="font-medium">Jatuh Tempo:</span> {selectedInvoice.dueDate.toLocaleDateString('id-ID')}</p>
                  <div className="flex items-center">
                    {getStatusIcon(selectedInvoice.status)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusText(selectedInvoice.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <IconComponent size={20} className="mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Ringkasan Durasi Sewa</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Total Hari Sewa</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedInvoice.totalRentalDays}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Kategori Durasi</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${durationCategory.color}`}>
                    {durationCategory.label}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Tarif Harian Rata-rata</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(selectedInvoice.averageDailyRate)}</p>
                </div>
                {selectedInvoice.durationDiscount && selectedInvoice.durationDiscount > 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Diskon Durasi</p>
                    <p className="text-2xl font-bold text-green-600">-{formatRupiah(selectedInvoice.durationDiscount)}</p>
                    <p className="text-xs text-gray-500">({selectedInvoice.durationDiscountPercentage}%)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Item</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode Sewa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarif Harian</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.startDate && item.endDate ? (
                            <div>
                              <div>{item.startDate.toLocaleDateString('id-ID')}</div>
                              <div className="text-xs text-gray-500">s/d {item.endDate.toLocaleDateString('id-ID')}</div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.rentalDays ? (
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-1 text-gray-400" />
                              <span>{item.rentalDays} hari</span>
                              {item.durationCategory && (
                                <span className={`ml-2 inline-flex px-1 py-0.5 text-xs font-semibold rounded ${getDurationCategory(item.rentalDays).color}`}>
                                  {getDurationCategory(item.rentalDays).label}
                                </span>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatRupiah(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatRupiah(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatRupiah(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.durationDiscount && selectedInvoice.durationDiscount > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>Diskon Durasi ({selectedInvoice.durationDiscountPercentage}%):</span>
                      <span>-{formatRupiah(selectedInvoice.durationDiscount)}</span>
                    </div>
                  )}
                  {selectedInvoice.hasTax && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Pajak ({selectedInvoice.taxRate}%):</span>
                      <span className="font-medium">{formatRupiah(selectedInvoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-200 text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatRupiah(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
                <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedInvoice)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText size={16} className="mr-2" />
                Print
              </button>
              <button
                onClick={() => handleSendWhatsApp(selectedInvoice)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle size={16} className="mr-2" />
                Kirim WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddInvoiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Buat Invoice Baru</h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <form className="p-6 space-y-6">
          {/* Customer Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pelanggan</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Pilih pelanggan</option>
                  {mockCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Invoice</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="INV-2024-XXX"
                />
              </div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tanggal Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Terbit</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rental Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Item Sewa</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kendaraan</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Pilih kendaraan</option>
                      {mockVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tarif Harian (Rp)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="675000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Sewa</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai Sewa</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (hari)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      placeholder="Otomatis terhitung"
                      readOnly
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Calendar className="text-blue-600 mr-2" size={16} />
                    <span className="text-sm font-medium text-blue-900">Kategori Durasi: Menengah (7 hari)</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Total: 7 hari × Rp 675.000 = Rp 4.725.000
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Tambah Item
            </button>
          </div>

          {/* Tax Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfigurasi Pajak</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Tambahkan Pajak 12%</h4>
                <p className="text-sm text-gray-600">Aktifkan untuk menambahkan pajak 12% ke total invoice</p>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>

          {/* Duration Discount */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Diskon Durasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Persentase Diskon (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Diskon (Rp)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                  placeholder="Otomatis terhitung"
                  readOnly
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat Invoice
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
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Invoice</h1>
          <p className="text-gray-600 mt-2">Kelola invoice dengan tracking durasi sewa dan diskon otomatis</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Buat Invoice
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari invoice berdasarkan nomor, nama pelanggan, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Terkirim</option>
            <option value="paid">Dibayar</option>
            <option value="overdue">Terlambat</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Durasi</option>
            <option value="short">Pendek (≤3 hari)</option>
            <option value="medium">Menengah (4-14 hari)</option>
            <option value="long">Panjang (&gt;14 hari)</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoice</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalInvoices}</p>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nilai</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatRupiah(totalAmount)}</p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatRupiah(paidAmount)}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terlambat</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatRupiah(overdueAmount)}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hari Sewa</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRentalDays}</p>
            </div>
            <Calendar className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Durasi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgRentalDuration}</p>
              <p className="text-xs text-gray-500 mt-1">hari per invoice</p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Duration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-xs text-gray-500 mt-1">&gt;14 hari</p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi Sewa</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const durationCategory = getDurationCategory(invoice.totalRentalDays);
                const IconComponent = durationCategory.icon;
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">{invoice.issueDate.toLocaleDateString('id-ID')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center mb-1">
                        <IconComponent size={16} className="mr-1" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${durationCategory.color}`}>
                          {durationCategory.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.totalRentalDays} hari • {formatRupiah(invoice.averageDailyRate)}/hari
                      </div>
                      {invoice.durationDiscount && invoice.durationDiscount > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Diskon: -{formatRupiah(invoice.durationDiscount)} ({invoice.durationDiscountPercentage}%)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatRupiah(invoice.total)}</div>
                      {invoice.hasTax && (
                        <div className="text-xs text-gray-500">Termasuk pajak {invoice.taxRate}%</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.dueDate.toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Lihat invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(invoice)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Kirim WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors">
                          <Edit size={16} />
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
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada invoice ditemukan</h3>
          <p className="text-gray-600">Coba sesuaikan kriteria pencarian atau buat invoice baru.</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddInvoiceModal />}
      {showViewModal && <ViewInvoiceModal />}
    </div>
  );
};

export default InvoiceManagement;