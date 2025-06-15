import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Shield, Eye, EyeOff, Car, Bus, Truck, Users, CheckCircle, XCircle, Calendar, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'telemarketing-mobil' | 'telemarketing-bus' | 'telemarketing-elf' | 'telemarketing-hiace';
  is_active: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading users from Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error loading users:', fetchError);
        setError('Gagal memuat data pengguna: ' + fetchError.message);
        return;
      }

      console.log('✅ Users loaded successfully:', data?.length || 0, 'users');
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading users:', error);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="text-red-500" size={20} />;
      case 'manager':
        return <Users className="text-blue-500" size={20} />;
      case 'telemarketing-mobil':
        return <Car className="text-blue-500" size={20} />;
      case 'telemarketing-bus':
        return <Bus className="text-green-500" size={20} />;
      case 'telemarketing-elf':
        return <Truck className="text-orange-500" size={20} />;
      case 'telemarketing-hiace':
        return <Truck className="text-purple-500" size={20} />;
      default:
        return <User className="text-gray-500" size={20} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'telemarketing-mobil':
        return 'bg-blue-100 text-blue-800';
      case 'telemarketing-bus':
        return 'bg-green-100 text-green-800';
      case 'telemarketing-elf':
        return 'bg-orange-100 text-orange-800';
      case 'telemarketing-hiace':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'telemarketing-mobil':
        return 'Telemarketing Mobil';
      case 'telemarketing-bus':
        return 'Telemarketing Bus';
      case 'telemarketing-elf':
        return 'Telemarketing Elf';
      case 'telemarketing-hiace':
        return 'Telemarketing Hiace';
      default:
        return role;
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      setSubmitting(true);
      setError(null);
      console.log('➕ Creating new user:', userData.email);
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Get permissions based on role
      const permissions = getPermissionsByRole(userData.role);
      
      const { data, error: createError } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
          role: userData.role,
          is_active: true,
          permissions: permissions
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating user:', createError);
        if (createError.code === '23505' && createError.message.includes('email')) {
          setError('Email sudah digunakan oleh pengguna lain');
        } else {
          setError('Gagal menambahkan pengguna: ' + createError.message);
        }
        return;
      }
      
      console.log('✅ User created successfully:', data.email);
      await loadUsers(); // Reload users
      setShowAddModal(false);
      alert('Pengguna berhasil ditambahkan!');
    } catch (error: any) {
      console.error('❌ Error adding user:', error);
      setError('Gagal menambahkan pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      setError(null);
      console.log('✏️ Updating user:', selectedUser.email);
      
      const updateData: any = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        permissions: getPermissionsByRole(userData.role)
      };

      // Only update password if provided
      if (userData.password && userData.password.trim()) {
        updateData.password_hash = await hashPassword(userData.password);
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        setError('Gagal memperbarui pengguna: ' + updateError.message);
        return;
      }
      
      console.log('✅ User updated successfully:', data.email);
      await loadUsers(); // Reload users
      setShowEditModal(false);
      setSelectedUser(null);
      alert('Pengguna berhasil diperbarui!');
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      setError('Gagal memperbarui pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        setError(null);
        console.log('🗑️ Deleting user:', userId);
        
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (deleteError) {
          console.error('❌ Error deleting user:', deleteError);
          setError('Gagal menghapus pengguna: ' + deleteError.message);
          return;
        }
        
        console.log('✅ User deleted successfully');
        await loadUsers(); // Reload users
        alert('Pengguna berhasil dihapus!');
      } catch (error: any) {
        console.error('❌ Error deleting user:', error);
        setError('Gagal menghapus pengguna');
      }
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setError(null);
      const userToToggle = users.find(u => u.id === userId);
      if (!userToToggle) return;
      
      console.log('🔄 Toggling user status:', userToToggle.email);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: !userToToggle.is_active })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error toggling user status:', updateError);
        setError('Gagal mengubah status pengguna: ' + updateError.message);
        return;
      }
      
      console.log('✅ User status toggled successfully');
      await loadUsers(); // Reload users
    } catch (error: any) {
      console.error('❌ Error toggling user status:', error);
      setError('Gagal mengubah status pengguna');
    }
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const telemarketingUsers = users.filter(u => u.role.startsWith('telemarketing')).length;
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'manager').length;

  const UserFormModal = ({ isEdit = false, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      name: isEdit ? selectedUser?.name || '' : '',
      email: isEdit ? selectedUser?.email || '' : '',
      role: isEdit ? selectedUser?.role || 'telemarketing-mobil' : 'telemarketing-mobil',
      password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation
      if (!formData.name.trim() || !formData.email.trim()) {
        alert('Nama dan email harus diisi');
        return;
      }

      if (!isEdit && !formData.password.trim()) {
        alert('Password harus diisi untuk pengguna baru');
        return;
      }

      if (formData.password && formData.password.length < 6) {
        alert('Password minimal 6 karakter');
        return;
      }

      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="telemarketing-mobil">Telemarketing Mobil</option>
                <option value="telemarketing-bus">Telemarketing Bus</option>
                <option value="telemarketing-elf">Telemarketing Elf</option>
                <option value="telemarketing-hiace">Telemarketing Hiace</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEdit ? 'Password Baru (kosongkan jika tidak ingin mengubah)' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isEdit}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {isEdit ? 'Memperbarui...' : 'Menambahkan...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Update' : 'Tambah'} Pengguna
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-2">Kelola pengguna sistem dengan akses berbasis role</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tambah Pengguna
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="text-red-400 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pengguna Aktif</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeUsers}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Telemarketing</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{telemarketingUsers}</p>
            </div>
            <User className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin & Manager</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{adminUsers}</p>
            </div>
            <Shield className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="telemarketing-mobil">Telemarketing Mobil</option>
            <option value="telemarketing-bus">Telemarketing Bus</option>
            <option value="telemarketing-elf">Telemarketing Elf</option>
            <option value="telemarketing-hiace">Telemarketing Hiace</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Terakhir</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.is_active ? (
                        <CheckCircle className="text-green-500 mr-2" size={16} />
                      ) : (
                        <XCircle className="text-red-500 mr-2" size={16} />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock size={16} className="mr-1 text-gray-400" />
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Belum pernah'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1 rounded transition-colors ${
                          user.is_active 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit pengguna"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna ditemukan</h3>
          <p className="text-gray-600">Coba sesuaikan kriteria pencarian atau tambah pengguna baru.</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <UserFormModal
          onSave={handleAddUser}
          onCancel={() => setShowAddModal(false)}
        />
      )}
      
      {showEditModal && (
        <UserFormModal
          isEdit={true}
          onSave={handleEditUser}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// Helper function to hash password (same as AuthContext)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to get permissions by role
function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['all'];
    case 'manager':
      return ['dashboard', 'customers', 'vehicles', 'reports', 'maintenance', 'vendors', 'kir', 'tax', 'pricing', 'hpp', 'invoices'];
    case 'telemarketing-mobil':
      return ['customers'];
    case 'telemarketing-bus':
      return ['customers'];
    case 'telemarketing-elf':
      return ['customers'];
    case 'telemarketing-hiace':
      return ['customers'];
    default:
      return [];
  }
}

export default UserManagement;